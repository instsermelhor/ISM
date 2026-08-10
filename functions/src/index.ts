import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { z } from 'zod';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY / IDEMPOTENCY CACHE
// ─────────────────────────────────────────────────────────────────────────────

const idempotencyStore = new Map<string, { status: number; body: any; timestamp: number }>();

/** Middleware de Idempotência baseado no cabeçalho Idempotency-Key */
function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['idempotency-key'] as string;
  if (!key) {
    return next();
  }

  const cached = idempotencyStore.get(key);
  if (cached) {
    res.status(cached.status).json(cached.body);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any): Response => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyStore.set(key, { status: res.statusCode, body, timestamp: Date.now() });
    }
    return originalJson(body);
  };

  next();
}

/** Helper para formato de erro padronizado RFC 7807 Problem Details */
function sendProblemDetails(res: Response, status: number, title: string, detail: string, code: string): void {
  res.status(status).json({
    type: `https://api.institutosermelhor.org/errors/${code.toLowerCase()}`,
    title,
    status,
    detail,
    code,
    timestamp: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARES DE SEGURANÇA & ROUTING
// ─────────────────────────────────────────────────────────────────────────────

async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendProblemDetails(res, 401, 'Unauthorized', 'Token JWT ausente ou malformatado no cabeçalho Authorization', 'UNAUTHORIZED');
    return;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    sendProblemDetails(res, 401, 'Unauthorized', 'Token JWT assinado inválido ou expirado', 'INVALID_JWT');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER REST v2
// ─────────────────────────────────────────────────────────────────────────────

const router = express.Router();
router.use(idempotencyMiddleware);

const DonationSchema = z.object({
  donorName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(200),
  donorEmail: z.string().email('Endereço de e-mail inválido').max(320),
  amount: z.number().positive('O valor deve ser maior que zero').max(1000000),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  paymentMethod: z.string().min(2).max(50),
  message: z.string().max(1000).optional(),
});

const LeadSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(30).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(5).max(5000),
});

/** GET /api/v2/health — Liveness Probe */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', apiVersion: 'v2.0', mode: 'Liveness', timestamp: new Date().toISOString() });
});

/** GET /api/v2/health/deep — Readiness Probe (Testa conexão com o Firestore) */
router.get('/health/deep', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    // Teste atômico de leitura no Firestore para confirmar integridade do banco
    await db.collection('settings').limit(1).get();
    const latency = Date.now() - startTime;
    res.status(200).json({
      status: 'HEALTHY',
      apiVersion: 'v2.0',
      mode: 'Readiness',
      database: 'CONNECTED',
      dbLatencyMs: latency,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'UNHEALTHY',
      apiVersion: 'v2.0',
      mode: 'Readiness',
      database: 'DISCONNECTED',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});


/** POST /api/v2/donations */
router.post('/donations', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = DonationSchema.parse(req.body);
    const docRef = await db.collection('donations').add({
      ...validatedData,
      status: 'PENDING',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      transactionId: docRef.id,
      message: 'Doação recebida e processada com sucesso via API Gateway REST v2.',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      sendProblemDetails(res, 400, 'Bad Request', err.errors.map(e => e.message).join('; '), 'SCHEMA_VALIDATION_ERROR');
    } else {
      console.error('[API Gateway] Erro ao processar doação:', err);
      sendProblemDetails(res, 500, 'Internal Server Error', 'Falha interna ao gravar a doação', 'SERVER_ERROR');
    }
  }
});

/** POST /api/v2/leads */
router.post('/leads', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = LeadSchema.parse(req.body);
    const docRef = await db.collection('leads').add({
      ...validatedData,
      status: 'NEW',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      leadId: docRef.id,
      message: 'Lead registrado com sucesso.',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      sendProblemDetails(res, 400, 'Bad Request', err.errors.map(e => e.message).join('; '), 'SCHEMA_VALIDATION_ERROR');
    } else {
      console.error('[API Gateway] Erro ao registrar lead:', err);
      sendProblemDetails(res, 500, 'Internal Server Error', 'Falha interna ao salvar o lead', 'SERVER_ERROR');
    }
  }
});

/** Middleware de Autorização baseado em Papéis RBAC */
function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      sendProblemDetails(res, 401, 'Unauthorized', 'Usuário não autenticado', 'UNAUTHORIZED');
      return;
    }

    const SUPER_ADMIN_EMAILS = [
      'instsermelhor.adm@gmail.com'
    ];

    const userEmail = (user.email || '').toLowerCase();
    const isSuperAdmin = userEmail === 'instsermelhor.adm@gmail.com' || SUPER_ADMIN_EMAILS.includes(userEmail);
    const role = isSuperAdmin ? 'SUPER_ADMIN' : (user.role || user.customClaims?.role || 'EDITOR');

    if (role === 'SUPER_ADMIN') {
      return next();
    }

    if (allowedRoles.includes(role)) {
      return next();
    }

    sendProblemDetails(res, 403, 'Forbidden', `Acesso negado. Requer função: ${allowedRoles.join(', ')}`, 'FORBIDDEN');
  };
}

/** PUT /api/v2/admin/cms/institutional */
router.put('/admin/cms/institutional', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    await db.collection('institutional_page').doc('main').set({
      ...data,
      updatedBy: (req as any).user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Registrar Trilha de Auditoria Imutável
    await db.collection('audit_logs').add({
      action: 'CONTENT_UPDATED',
      userEmail: (req as any).user.email || 'desconhecido',
      details: 'Atualização do conteúdo institucional via API v2',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true, message: 'Conteúdo institucional atualizado via API Gateway Admin REST v2.' });
  } catch (err: any) {
    console.error('[API Gateway] Erro no CMS Admin:', err);
    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao atualizar o CMS', 'CMS_UPDATE_ERROR');
  }
});

/** POST /api/v2/admin/change-password — Alteração Obrigatória / Voluntária de Senha */
router.post('/admin/change-password', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      sendProblemDetails(res, 400, 'Bad Request', 'A nova senha deve possuir no mínimo 8 caracteres.', 'WEAK_PASSWORD');
      return;
    }
    if (newPassword === oldPassword) {
      sendProblemDetails(res, 400, 'Bad Request', 'A nova senha deve ser diferente da senha atual/provisória.', 'SAME_PASSWORD');
      return;
    }

    const uid = (req as any).user.uid;
    const email = (req as any).user.email;

    // Atualiza credencial no Firebase Auth via Admin SDK
    await admin.auth().updateUser(uid, { password: newPassword });

    // Registra auditoria imutável
    await db.collection('audit_logs').add({
      action: 'PASSWORD_CHANGE',
      userEmail: email,
      details: 'Troca de senha realizada com sucesso via API REST v2',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (err: any) {
    console.error('[API Gateway] Erro na alteração de senha:', err);
    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao alterar a senha', 'PASSWORD_CHANGE_FAILED');
  }
});

/** DELETE /api/v2/admin/users/:userId — Exclusão protegida de usuário */
router.delete('/admin/users/:userId', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.userId;
    const callerEmail = ((req as any).user.email || '').toLowerCase();
    
    // Buscar perfil do usuário alvo
    const targetUserRecord = await admin.auth().getUser(targetUserId).catch(() => null);
    const targetEmail = (targetUserRecord?.email || '').toLowerCase();

    // Trava de Segurança: Impedir exclusão de SUPER_ADMIN por administradores normais
    if (targetEmail === 'instsermelhor.adm@gmail.com' || targetUserRecord?.customClaims?.role === 'SUPER_ADMIN') {
      if (callerEmail !== 'instsermelhor.adm@gmail.com') {
        sendProblemDetails(res, 403, 'Forbidden', 'Operação bloqueada pelo backend. O Super Administrador não pode ser excluído por usuários delegados.', 'SUPER_ADMIN_PROTECTED');
        return;
      }
    }

    await admin.auth().deleteUser(targetUserId);

    await db.collection('audit_logs').add({
      action: 'USER_DELETED',
      userEmail: callerEmail,
      details: `Usuário ${targetEmail || targetUserId} excluído com sucesso`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true, message: 'Usuário excluído com sucesso.' });
  } catch (err: any) {
    console.error('[API Gateway] Erro ao excluir usuário:', err);
    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao excluir usuário', 'USER_DELETE_ERROR');
  }
});

app.use('/api/v2', router);

export const api = onRequest({ region: 'southamerica-east1', cors: true }, app);
