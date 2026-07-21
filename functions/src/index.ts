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

/** PUT /api/v2/admin/cms/institutional */
router.put('/admin/cms/institutional', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    await db.collection('institutional_page').doc('main').set({
      ...data,
      updatedBy: (req as any).user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.status(200).json({ success: true, message: 'Conteúdo institucional atualizado via API Gateway Admin REST v2.' });
  } catch (err: any) {
    console.error('[API Gateway] Erro no CMS Admin:', err);
    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao atualizar o CMS', 'CMS_UPDATE_ERROR');
  }
});

app.use('/api/v2', router);

export const api = onRequest({ region: 'southamerica-east1', cors: true }, app);
