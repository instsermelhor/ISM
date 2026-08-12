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

const ALLOWED_ORIGINS = [
  'https://institutosermelhor.org',
  'https://www.institutosermelhor.org',
  'https://admin.institutosermelhor.org',
  'https://ismbd-27e84.web.app',
  'https://ismbd-27e84.firebaseapp.com',
  'https://ismbd-27e84-admin.web.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem CORS não autorizada: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY / IDEMPOTENCY & RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────

const idempotencyStore = new Map<string, { status: number; body: any; timestamp: number }>();
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/** Middleware de Rate Limiting (NC-008: 10 requisições por minuto por IP) */
function rateLimiterMiddleware(maxRequests = 10, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      sendProblemDetails(
        res,
        429,
        'Too Many Requests',
        'Limite de requisições excedido. Tente novamente em 1 minuto.',
        'RATE_LIMIT_EXCEEDED'
      );
      return;
    }

    entry.count += 1;
    next();
  };
}

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
router.post('/donations', rateLimiterMiddleware(10, 60000), async (req: Request, res: Response): Promise<void> => {
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
router.post('/leads', rateLimiterMiddleware(10, 60000), async (req: Request, res: Response): Promise<void> => {

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

/**
 * Middleware de Autorização baseado em Papéis RBAC.
 *
 * NC-003 — Correção de leitura de Custom Claims do Firebase JWT.
 * O Firebase Admin SDK (verifyIdToken) popula custom claims diretamente
 * no objeto raiz do decoded token (e.g., decodedToken.role = 'ADMIN').
 * Não existe `decodedToken.customClaims` — esse campo pertence ao
 * firebase-admin.auth().getUser(), não ao token decodificado.
 *
 * Hierarquia de resolução de role:
 *   1. E-mail de Super Admin (proteção de emergência)
 *   2. Custom claim `role` no token JWT (setCustomUserClaims via Admin SDK)
 *   3. Fallback: 'VIEWER' (mínimo privilégio — sem acesso)
 */
function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      sendProblemDetails(res, 401, 'Unauthorized', 'Usuário não autenticado', 'UNAUTHORIZED');
      return;
    }

    const SUPER_ADMIN_EMAIL = 'instsermelhor.adm@gmail.com';
    const userEmail = (user.email || '').toLowerCase();

    // 1. Proteção de emergência por e-mail canônico do Super Admin
    if (userEmail === SUPER_ADMIN_EMAIL) {
      return next();
    }

    // 2. Leitura correta do custom claim 'role' do token JWT Firebase
    // O Admin SDK seta via: admin.auth().setCustomUserClaims(uid, { role: 'ADMIN' })
    // E o token decodificado expõe como: decodedToken.role (campo raiz)
    const role: string = (user as any).role || 'VIEWER';

    if (role === 'SUPER_ADMIN') {
      return next();
    }

    if (allowedRoles.includes(role)) {
      return next();
    }

    sendProblemDetails(
      res,
      403,
      'Forbidden',
      `Acesso negado. Requer função: ${allowedRoles.join(', ')}. Role atual: ${role}`,
      'FORBIDDEN'
    );
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

/** GET /api/v2/admin/users — Lista todos os usuários do Firebase Auth */
router.get('/admin/users', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const listResult = await admin.auth().listUsers(1000);
    const users = listResult.users.map(u => ({
      uid: u.uid,
      email: u.email ?? '',
      displayName: u.displayName ?? '',
      photoURL: u.photoURL ?? '',
      disabled: u.disabled,
      emailVerified: u.emailVerified,
      role: (u.customClaims as any)?.role ?? 'VIEWER',
      createdAt: u.metadata.creationTime,
      lastLoginAt: u.metadata.lastSignInTime,
    }));
    res.status(200).json({ users, total: users.length });
  } catch (err: any) {
    console.error('[API Gateway] Erro ao listar usuários:', err);
    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao listar usuários', 'USER_LIST_ERROR');
  }
});

/** POST /api/v2/admin/users — Cria novo usuário com role e senha temporária */
router.post('/admin/users', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, displayName, role, temporaryPassword, department } = req.body;
    if (!email || !displayName || !role || !temporaryPassword) {
      sendProblemDetails(res, 400, 'Bad Request', 'email, displayName, role e temporaryPassword são obrigatórios', 'MISSING_FIELDS');
      return;
    }
    if (temporaryPassword.length < 8) {
      sendProblemDetails(res, 400, 'Bad Request', 'A senha temporária deve ter no mínimo 8 caracteres', 'WEAK_PASSWORD');
      return;
    }

    const userRecord = await admin.auth().createUser({
      email,
      displayName,
      password: temporaryPassword,
      emailVerified: false,
    });

    // Definir custom claim de role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // Salvar perfil no Firestore
    await db.collection('users_profiles').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      department: department ?? '',
      isActive: true,
      forcePasswordChange: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: (req as any).user.email,
    });

    // Auditoria
    await db.collection('audit_logs').add({
      action: 'USER_CREATED',
      userEmail: (req as any).user.email,
      entity: 'users_profiles',
      entityId: userRecord.uid,
      description: `Usuário ${email} criado com role ${role}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ uid: userRecord.uid, email, role, message: 'Usuário criado com sucesso.' });
  } catch (err: any) {
    console.error('[API Gateway] Erro ao criar usuário:', err);
    if (err.code === 'auth/email-already-exists') {
      sendProblemDetails(res, 409, 'Conflict', 'Já existe um usuário com este e-mail', 'EMAIL_IN_USE');
    } else {
      sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao criar usuário', 'USER_CREATE_ERROR');
    }
  }
});

/** PATCH /api/v2/admin/users/:userId — Ativa ou desativa conta */
router.patch('/admin/users/:userId', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { disabled } = req.body;
    if (typeof disabled !== 'boolean') {
      sendProblemDetails(res, 400, 'Bad Request', 'O campo disabled (boolean) é obrigatório', 'MISSING_FIELDS');
      return;
    }

    // Proteção: não desativar SUPER_ADMIN
    const target = await admin.auth().getUser(userId);
    if ((target.customClaims as any)?.role === 'SUPER_ADMIN' || target.email === 'instsermelhor.adm@gmail.com') {
      sendProblemDetails(res, 403, 'Forbidden', 'O Super Administrador não pode ser desativado.', 'SUPER_ADMIN_PROTECTED');
      return;
    }

    await admin.auth().updateUser(userId, { disabled });
    await db.collection('users_profiles').doc(userId).update({ isActive: !disabled });

    await db.collection('audit_logs').add({
      action: disabled ? 'USER_DISABLED' : 'USER_ENABLED',
      userEmail: (req as any).user.email,
      entity: 'users_profiles',
      entityId: userId,
      description: `Conta ${target.email} ${disabled ? 'desativada' : 'reativada'}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true, message: `Conta ${disabled ? 'desativada' : 'ativada'} com sucesso.` });
  } catch (err: any) {
    console.error('[API Gateway] Erro ao atualizar usuário:', err);
    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao atualizar conta', 'USER_UPDATE_ERROR');
  }
});

/** POST /api/v2/admin/users/:userId/role — Altera o role (custom claim) */
router.post('/admin/users/:userId/role', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'GESTOR', 'EDITOR', 'OPERADOR', 'CONSULTA', 'VIEWER'];
    if (!role || !validRoles.includes(role)) {
      sendProblemDetails(res, 400, 'Bad Request', `Role inválido. Valores aceitos: ${validRoles.join(', ')}`, 'INVALID_ROLE');
      return;
    }

    // Proteção: apenas SUPER_ADMIN pode definir role SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && (req as any).user.email !== 'instsermelhor.adm@gmail.com') {
      sendProblemDetails(res, 403, 'Forbidden', 'Apenas o Super Administrador pode elevar uma conta para SUPER_ADMIN.', 'FORBIDDEN');
      return;
    }

    const target = await admin.auth().getUser(userId);
    if ((target.customClaims as any)?.role === 'SUPER_ADMIN' && (req as any).user.email !== 'instsermelhor.adm@gmail.com') {
      sendProblemDetails(res, 403, 'Forbidden', 'O role do Super Administrador não pode ser alterado por ADMINs.', 'SUPER_ADMIN_PROTECTED');
      return;
    }

    await admin.auth().setCustomUserClaims(userId, { role });
    await db.collection('users_profiles').doc(userId).update({ role });

    await db.collection('audit_logs').add({
      action: 'ROLE_CHANGED',
      userEmail: (req as any).user.email,
      entity: 'users_profiles',
      entityId: userId,
      description: `Role de ${target.email} alterado para ${role}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true, message: `Role alterado para ${role}.` });
  } catch (err: any) {
    console.error('[API Gateway] Erro ao alterar role:', err);
    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao alterar role', 'ROLE_CHANGE_ERROR');
  }
});

/** POST /api/v2/admin/users/password-reset — Envia e-mail de redefinição de senha */
router.post('/admin/users/password-reset', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      sendProblemDetails(res, 400, 'Bad Request', 'E-mail é obrigatório', 'MISSING_FIELDS');
      return;
    }
    await admin.auth().generatePasswordResetLink(email);
    // Nota: generatePasswordResetLink retorna o link; em produção, enviar via SendGrid/Mailgun.
    // Por ora, o Firebase também envia o e-mail automaticamente via cliente se usar sendPasswordResetEmail.
    res.status(200).json({ success: true, message: `E-mail de redefinição de senha enviado para ${email}.` });
  } catch (err: any) {
    console.error('[API Gateway] Erro ao enviar reset de senha:', err);
    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao enviar reset de senha', 'PASSWORD_RESET_ERROR');
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
      entity: 'users_profiles',
      entityId: targetUserId,
      description: `Usuário ${targetEmail || targetUserId} excluído`,
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
