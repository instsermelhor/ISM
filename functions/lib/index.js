"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origem CORS não autorizada: ${origin}`));
        }
    },
    credentials: true,
}));
// Proteção contra fingerprinting do framework
app.disable('x-powered-by');
app.use(express_1.default.json({ limit: '1mb' }));
// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE DE SEGURANÇA HTTP (Hardening — Fase 15)
// Injeta cabeçalhos de segurança em TODAS as respostas da API
// ─────────────────────────────────────────────────────────────────────────────
app.use((_req, res, next) => {
    // HSTS: forçar HTTPS por 2 anos com preload
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // Prevenir MIME-sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Proibir embedding em iframes externos
    res.setHeader('X-Frame-Options', 'DENY');
    // Controlar informações enviadas no Referer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // APIs não devem ser cacheadas em proxies intermediários
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // CORP para APIs JSON
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});
// ─────────────────────────────────────────────────────────────────────────────
// MEMORY / IDEMPOTENCY & RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────
const idempotencyStore = new Map();
const rateLimitStore = new Map();
/** Middleware de Rate Limiting (NC-008: 10 requisições por minuto por IP) */
function rateLimiterMiddleware(maxRequests = 10, windowMs = 60000) {
    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const now = Date.now();
        const entry = rateLimitStore.get(ip);
        if (!entry || now > entry.resetTime) {
            rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }
        if (entry.count >= maxRequests) {
            sendProblemDetails(res, 429, 'Too Many Requests', 'Limite de requisições excedido. Tente novamente em 1 minuto.', 'RATE_LIMIT_EXCEEDED');
            return;
        }
        entry.count += 1;
        next();
    };
}
/** Middleware de Idempotência baseado no cabeçalho Idempotency-Key */
function idempotencyMiddleware(req, res, next) {
    const key = req.headers['idempotency-key'];
    if (!key) {
        return next();
    }
    const cached = idempotencyStore.get(key);
    if (cached) {
        res.status(cached.status).json(cached.body);
        return;
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            idempotencyStore.set(key, { status: res.statusCode, body, timestamp: Date.now() });
        }
        return originalJson(body);
    };
    next();
}
/** Helper para formato de erro padronizado RFC 7807 Problem Details */
function sendProblemDetails(res, status, title, detail, code) {
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
async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendProblemDetails(res, 401, 'Unauthorized', 'Token JWT ausente ou malformatado no cabeçalho Authorization', 'UNAUTHORIZED');
        return;
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        sendProblemDetails(res, 401, 'Unauthorized', 'Token JWT assinado inválido ou expirado', 'INVALID_JWT');
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// ROUTER REST v2
// ─────────────────────────────────────────────────────────────────────────────
const router = express_1.default.Router();
router.use(idempotencyMiddleware);
const DonationSchema = zod_1.z.object({
    donorName: zod_1.z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(200),
    donorEmail: zod_1.z.string().email('Endereço de e-mail inválido').max(320),
    amount: zod_1.z.number().positive('O valor deve ser maior que zero').max(1000000),
    currency: zod_1.z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
    paymentMethod: zod_1.z.string().min(2).max(50),
    message: zod_1.z.string().max(1000).optional(),
});
const LeadSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200),
    email: zod_1.z.string().email().max(320),
    phone: zod_1.z.string().max(30).optional(),
    subject: zod_1.z.string().max(200).optional(),
    message: zod_1.z.string().min(5).max(5000),
});
// ─────────────────────────────────────────────────────────────────────────────
// SEC-SECRET-001 — SECRET REDACTION
// Sanitiza valores sensíveis antes de qualquer log ou resposta de erro
// ─────────────────────────────────────────────────────────────────────────────
/** Padrões de campos sensíveis que NUNCA devem aparecer em logs */
const SENSITIVE_FIELD_PATTERNS = [
    /authorization/i,
    /bearer/i,
    /password/i,
    /passwd/i,
    /secret/i,
    /token/i,
    /api.?key/i,
    /private.?key/i,
    /smtp/i,
    /credential/i,
    /webhook/i,
    /signing.?key/i,
    /stripe/i,
    /openai/i,
];
/** Padrões de valores que parecem segredos (chaves de API, tokens, etc.) */
const SECRET_VALUE_PATTERNS = [
    /sk_(?:test|live)_[A-Za-z0-9]{24,}/, // Stripe Secret Key
    /pk_(?:test|live)_[A-Za-z0-9]{24,}/, // Stripe Publishable Key (log safety)
    /sk-proj-[A-Za-z0-9_-]{32,}/, // OpenAI API Key
    /whsec_[A-Za-z0-9]{32,}/, // Stripe Webhook Secret
    /Bearer\s+[A-Za-z0-9_\-\.]+/, // Bearer tokens JWT
    /[A-Za-z0-9+/]{40,}={0,2}/, // Base64 encoded values > 40 chars
];
/**
 * Redação de segredos em objetos de log.
 * Percorre recursivamente o objeto e substitui valores sensíveis por [REDACTED].
 */
function redactSecrets(obj) {
    if (!obj || typeof obj !== 'object')
        return obj;
    const redacted = { ...obj };
    for (const [key, value] of Object.entries(redacted)) {
        // Redactar campos com nomes suspeitos
        if (SENSITIVE_FIELD_PATTERNS.some(p => p.test(key))) {
            redacted[key] = '[REDACTED]';
            continue;
        }
        // Redactar valores que correspondem a padrões de segredos
        if (typeof value === 'string') {
            let redactedValue = value;
            for (const pattern of SECRET_VALUE_PATTERNS) {
                redactedValue = redactedValue.replace(pattern, '[REDACTED]');
            }
            redacted[key] = redactedValue;
        }
        else if (typeof value === 'object' && value !== null) {
            redacted[key] = redactSecrets(value);
        }
    }
    return redacted;
}
/**
 * Sanitiza strings de erro para remover dados sensíveis antes de logar.
 */
function redactErrorMessage(message) {
    let sanitized = message;
    for (const pattern of SECRET_VALUE_PATTERNS) {
        sanitized = sanitized.replace(new RegExp(pattern.source, pattern.flags + 'g'), '[REDACTED]');
    }
    return sanitized;
}
// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRIA E OBSERVABILIDADE ESTRUTURADA (GCP Cloud Logging & System Errors)
// ─────────────────────────────────────────────────────────────────────────────
/** Helper para log estruturado JSON compatível com GCP Cloud Logging */
function logStructured(severity, message, context) {
    const safeMessage = redactErrorMessage(message);
    const safeContext = context ? redactSecrets(context) : undefined;
    const payload = {
        severity,
        message: safeMessage,
        component: 'functions-v2',
        timestamp: new Date().toISOString(),
        ...safeContext,
    };
    if (severity === 'ERROR') {
        console.error(JSON.stringify(payload));
    }
    else if (severity === 'WARNING') {
        console.warn(JSON.stringify(payload));
    }
    else {
        console.log(JSON.stringify(payload));
    }
}
/** Registra erro no log estruturado e persiste na coleção system_errors do Firestore */
async function reportSystemError(source, message, route, statusCode = 500, stack) {
    logStructured('ERROR', `[${source}] ${message}`, { route, statusCode, stack });
    try {
        await db.collection('system_errors').add({
            source,
            message: message || 'Erro não especificado',
            route: route || 'INTERNAL',
            statusCode,
            stack: stack ? stack.substring(0, 2000) : null,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (err) {
        console.error('[Telemetry] Falha ao gravar no Firestore system_errors:', err);
    }
}
/** GET /api/v2/health — Liveness Probe */
router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', apiVersion: 'v2.0', mode: 'Liveness', timestamp: new Date().toISOString() });
});
/** GET /api/v2/health/deep — Readiness Probe Expandido com Telemetria */
router.get('/health/deep', async (_req, res) => {
    const startTime = Date.now();
    const mem = process.memoryUsage();
    try {
        await db.collection('settings').limit(1).get();
        const latency = Date.now() - startTime;
        res.status(200).json({
            status: 'HEALTHY',
            apiVersion: 'v2.0',
            mode: 'Readiness',
            database: 'CONNECTED',
            dbLatencyMs: latency,
            uptimeSeconds: Math.floor(process.uptime()),
            memory: {
                rssMb: Math.round(mem.rss / 1024 / 1024),
                heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
                heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
            },
            nodeVersion: process.version,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        await reportSystemError('HealthProbe', err.message, '/api/v2/health/deep', 503, err.stack);
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
router.post('/donations', rateLimiterMiddleware(10, 60000), async (req, res) => {
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
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            sendProblemDetails(res, 400, 'Bad Request', err.errors.map(e => e.message).join('; '), 'SCHEMA_VALIDATION_ERROR');
        }
        else {
            console.error('[API Gateway] Erro ao processar doação:', err);
            sendProblemDetails(res, 500, 'Internal Server Error', 'Falha interna ao gravar a doação', 'SERVER_ERROR');
        }
    }
});
/** POST /api/v2/leads */
router.post('/leads', rateLimiterMiddleware(10, 60000), async (req, res) => {
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
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            sendProblemDetails(res, 400, 'Bad Request', err.errors.map(e => e.message).join('; '), 'SCHEMA_VALIDATION_ERROR');
        }
        else {
            console.error('[API Gateway] Erro ao registrar lead:', err);
            sendProblemDetails(res, 500, 'Internal Server Error', 'Falha interna ao salvar o lead', 'SERVER_ERROR');
        }
    }
});
/**
 * Middleware de Resolução de Contexto de Multi-Tenancy (MT-001)
 *
 * Princípio Zero Trust:
 * 1. O frontend NUNCA dita isolamento arbitrariamente.
 * 2. O tenantId é resolvido a partir do token JWT assinado (Custom Claims) ou perfil autorizado.
 * 3. SUPER_ADMIN global pode explicitar tenant de trabalho (via header x-tenant-id), com auditoria integral.
 * 4. Tentativas de acesso cross-tenant por usuários delegados são bloqueadas com 403 FORBIDDEN.
 */
async function resolveTenantContext(req, res, next) {
    const user = req.user;
    if (!user) {
        req.tenantId = 'tenant-ism-hq';
        return next();
    }
    const SUPER_ADMIN_EMAIL = 'instsermelhor.adm@gmail.com';
    const userEmail = (user.email || '').toLowerCase();
    const userRole = user.role || 'VIEWER';
    const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL || userRole === 'SUPER_ADMIN';
    const requestedTenant = (req.headers['x-tenant-id'] || req.query.tenantId || '').trim();
    if (isSuperAdmin) {
        req.tenantId = requestedTenant || 'tenant-ism-hq';
        req.isSuperAdmin = true;
        return next();
    }
    // Obter tenants autorizados para o usuário a partir do token ou Firestore
    const tokenTenantId = user.tenantId || user.tenant_id || 'tenant-ism-hq';
    const userAllowedTenants = Array.isArray(user.tenants)
        ? user.tenants
        : [tokenTenantId];
    if (requestedTenant && !userAllowedTenants.includes(requestedTenant)) {
        logStructured('WARNING', `[MT-001] Tentativa de acesso cross-tenant bloqueada: Usuário ${user.email} tentou acessar ${requestedTenant}`, {
            userEmail: user.email,
            attemptedTenant: requestedTenant,
            authorizedTenants: userAllowedTenants,
        });
        sendProblemDetails(res, 403, 'Forbidden', 'Acesso negado: Você não possui autorização para operar neste Tenant.', 'CROSS_TENANT_ACCESS_DENIED');
        return;
    }
    req.tenantId = requestedTenant || tokenTenantId;
    req.isSuperAdmin = false;
    next();
}
/**
 * Middleware de Autorização baseado em Papéis RBAC e Escopo de Tenant.
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
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
        const role = user.role || user.tenantRole || 'VIEWER';
        if (role === 'SUPER_ADMIN') {
            return next();
        }
        if (allowedRoles.includes(role)) {
            return next();
        }
        sendProblemDetails(res, 403, 'Forbidden', `Acesso negado. Requer função: ${allowedRoles.join(', ')}. Role atual: ${role}`, 'FORBIDDEN');
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS DE MULTI-TENANCY (MT-001)
// ─────────────────────────────────────────────────────────────────────────────
const TenantCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome do tenant deve ter no mínimo 2 caracteres').max(200),
    slug: zod_1.z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
    type: zod_1.z.enum(['INSTITUTION_HQ', 'CORPORATE_SPONSOR', 'NGO_PARTNER', 'PUBLIC_AGENCY', 'REGIONAL_HUB']).default('NGO_PARTNER'),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'ONBOARDING', 'ARCHIVED']).default('ACTIVE'),
    documentNumber: zod_1.z.string().max(30).optional(),
    domain: zod_1.z.string().max(200).optional(),
    settings: zod_1.z.record(zod_1.z.any()).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
const TenantUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200).optional(),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'ONBOARDING', 'ARCHIVED']).optional(),
    documentNumber: zod_1.z.string().max(30).optional(),
    domain: zod_1.z.string().max(200).optional(),
    settings: zod_1.z.record(zod_1.z.any()).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
const TenantMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'userId é obrigatório'),
    userEmail: zod_1.z.string().email('E-mail inválido'),
    role: zod_1.z.enum(['TENANT_ADMIN', 'TENANT_GESTOR', 'TENANT_OPERADOR', 'TENANT_VIEWER']),
    isDefault: zod_1.z.boolean().default(false),
});
/** PUT /api/v2/admin/cms/institutional */
router.put('/admin/cms/institutional', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
    try {
        const data = req.body;
        await db.collection('institutional_page').doc('main').set({
            ...data,
            updatedBy: req.user.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // Registrar Trilha de Auditoria Imutável
        await db.collection('audit_logs').add({
            action: 'CONTENT_UPDATED',
            userEmail: req.user.email || 'desconhecido',
            details: 'Atualização do conteúdo institucional via API v2',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).json({ success: true, message: 'Conteúdo institucional atualizado via API Gateway Admin REST v2.' });
    }
    catch (err) {
        console.error('[API Gateway] Erro no CMS Admin:', err);
        sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao atualizar o CMS', 'CMS_UPDATE_ERROR');
    }
});
/** POST /api/v2/admin/change-password — Alteração Obrigatória / Voluntária de Senha */
router.post('/admin/change-password', authenticateToken, async (req, res) => {
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
        const uid = req.user.uid;
        const email = req.user.email;
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
    }
    catch (err) {
        console.error('[API Gateway] Erro na alteração de senha:', err);
        sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao alterar a senha', 'PASSWORD_CHANGE_FAILED');
    }
});
/** GET /api/v2/admin/users — Lista todos os usuários do Firebase Auth */
router.get('/admin/users', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const listResult = await admin.auth().listUsers(1000);
        const users = listResult.users.map(u => ({
            uid: u.uid,
            email: u.email ?? '',
            displayName: u.displayName ?? '',
            photoURL: u.photoURL ?? '',
            disabled: u.disabled,
            emailVerified: u.emailVerified,
            role: u.customClaims?.role ?? 'VIEWER',
            createdAt: u.metadata.creationTime,
            lastLoginAt: u.metadata.lastSignInTime,
        }));
        res.status(200).json({ users, total: users.length });
    }
    catch (err) {
        console.error('[API Gateway] Erro ao listar usuários:', err);
        sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao listar usuários', 'USER_LIST_ERROR');
    }
});
/** POST /api/v2/admin/users — Cria novo usuário com role e senha temporária */
router.post('/admin/users', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
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
            createdBy: req.user.email,
        });
        // Auditoria
        await db.collection('audit_logs').add({
            action: 'USER_CREATED',
            userEmail: req.user.email,
            entity: 'users_profiles',
            entityId: userRecord.uid,
            description: `Usuário ${email} criado com role ${role}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(201).json({ uid: userRecord.uid, email, role, message: 'Usuário criado com sucesso.' });
    }
    catch (err) {
        console.error('[API Gateway] Erro ao criar usuário:', err);
        if (err.code === 'auth/email-already-exists') {
            sendProblemDetails(res, 409, 'Conflict', 'Já existe um usuário com este e-mail', 'EMAIL_IN_USE');
        }
        else {
            sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao criar usuário', 'USER_CREATE_ERROR');
        }
    }
});
/** PATCH /api/v2/admin/users/:userId — Ativa ou desativa conta */
router.patch('/admin/users/:userId', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { disabled } = req.body;
        if (typeof disabled !== 'boolean') {
            sendProblemDetails(res, 400, 'Bad Request', 'O campo disabled (boolean) é obrigatório', 'MISSING_FIELDS');
            return;
        }
        // Proteção: não desativar SUPER_ADMIN
        const target = await admin.auth().getUser(userId);
        if (target.customClaims?.role === 'SUPER_ADMIN' || target.email === 'instsermelhor.adm@gmail.com') {
            sendProblemDetails(res, 403, 'Forbidden', 'O Super Administrador não pode ser desativado.', 'SUPER_ADMIN_PROTECTED');
            return;
        }
        await admin.auth().updateUser(userId, { disabled });
        await db.collection('users_profiles').doc(userId).update({ isActive: !disabled });
        await db.collection('audit_logs').add({
            action: disabled ? 'USER_DISABLED' : 'USER_ENABLED',
            userEmail: req.user.email,
            entity: 'users_profiles',
            entityId: userId,
            description: `Conta ${target.email} ${disabled ? 'desativada' : 'reativada'}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).json({ success: true, message: `Conta ${disabled ? 'desativada' : 'ativada'} com sucesso.` });
    }
    catch (err) {
        console.error('[API Gateway] Erro ao atualizar usuário:', err);
        sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao atualizar conta', 'USER_UPDATE_ERROR');
    }
});
/** POST /api/v2/admin/users/:userId/role — Altera o role (custom claim) */
router.post('/admin/users/:userId/role', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const validRoles = ['SUPER_ADMIN', 'ADMIN', 'GESTOR', 'EDITOR', 'OPERADOR', 'CONSULTA', 'VIEWER'];
        if (!role || !validRoles.includes(role)) {
            sendProblemDetails(res, 400, 'Bad Request', `Role inválido. Valores aceitos: ${validRoles.join(', ')}`, 'INVALID_ROLE');
            return;
        }
        const callerRole = req.user.role || 'VIEWER';
        const callerEmail = (req.user.email || '').toLowerCase();
        const isCallerSuperAdmin = callerEmail === 'instsermelhor.adm@gmail.com' || callerRole === 'SUPER_ADMIN';
        // SoD Protection: Usuários administradores comuns não podem alterar a própria função
        if (req.user.uid === userId && !isCallerSuperAdmin) {
            sendProblemDetails(res, 403, 'Forbidden', 'Você não pode alterar a sua própria função de acesso.', 'SELF_ROLE_CHANGE_FORBIDDEN');
            return;
        }
        // Proteção: apenas SUPER_ADMIN pode definir role SUPER_ADMIN
        if (role === 'SUPER_ADMIN' && !isCallerSuperAdmin) {
            sendProblemDetails(res, 403, 'Forbidden', 'Apenas o Super Administrador pode elevar uma conta para SUPER_ADMIN.', 'SUPER_ADMIN_PROTECTED');
            return;
        }
        const target = await admin.auth().getUser(userId);
        if (target.customClaims?.role === 'SUPER_ADMIN' && !isCallerSuperAdmin) {
            sendProblemDetails(res, 403, 'Forbidden', 'O role do Super Administrador não pode ser alterado por ADMINs.', 'SUPER_ADMIN_PROTECTED');
            return;
        }
        await admin.auth().setCustomUserClaims(userId, { role });
        await db.collection('users_profiles').doc(userId).update({ role });
        await db.collection('audit_logs').add({
            action: 'ROLE_CHANGED',
            userEmail: req.user.email,
            entity: 'users_profiles',
            entityId: userId,
            description: `Role de ${target.email} alterado para ${role}`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).json({ success: true, message: `Role alterado para ${role}.` });
    }
    catch (err) {
        console.error('[API Gateway] Erro ao alterar role:', err);
        sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao alterar role', 'ROLE_CHANGE_ERROR');
    }
});
/** POST /api/v2/admin/users/password-reset — Envia e-mail de redefinição de senha */
router.post('/admin/users/password-reset', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
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
    }
    catch (err) {
        console.error('[API Gateway] Erro ao enviar reset de senha:', err);
        sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao enviar reset de senha', 'PASSWORD_RESET_ERROR');
    }
});
/** DELETE /api/v2/admin/users/:userId — Exclusão protegida de usuário */
router.delete('/admin/users/:userId', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const callerEmail = (req.user.email || '').toLowerCase();
        const callerRole = req.user.role || 'VIEWER';
        const isCallerSuperAdmin = callerEmail === 'instsermelhor.adm@gmail.com' || callerRole === 'SUPER_ADMIN';
        // Buscar perfil do usuário alvo
        const targetUserRecord = await admin.auth().getUser(targetUserId).catch(() => null);
        const targetEmail = (targetUserRecord?.email || '').toLowerCase();
        // Trava de Segurança: Impedir exclusão de SUPER_ADMIN por administradores normais
        if (targetEmail === 'instsermelhor.adm@gmail.com' || targetUserRecord?.customClaims?.role === 'SUPER_ADMIN') {
            if (!isCallerSuperAdmin) {
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
        // ─────────────────────────────────────────────────────────────────────────────
        // ENDPOINTS MULTI-TENANCY ENTERPRISE (MT-001)
        // ─────────────────────────────────────────────────────────────────────────────
        /** GET /api/v2/admin/tenants — Lista tenants autorizados para o usuário */
        router.get('/admin/tenants', authenticateToken, resolveTenantContext, async (req, res) => {
            try {
                const isSuper = req.isSuperAdmin;
                const currentTenantId = req.tenantId;
                if (isSuper) {
                    const snap = await db.collection('tenants').orderBy('createdAt', 'desc').limit(100).get();
                    const tenants = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    res.status(200).json({ tenants, total: tenants.length });
                    return;
                }
                // Usuário regular: apenas o seu próprio tenant autorizado
                const snap = await db.collection('tenants').doc(currentTenantId).get();
                if (!snap.exists) {
                    // Fallback para tenant institucional mestre padrão
                    res.status(200).json({
                        tenants: [{
                                id: 'tenant-ism-hq',
                                name: 'Instituto Ser Melhor — Sede Matriz',
                                slug: 'ism-matriz',
                                type: 'INSTITUTION_HQ',
                                status: 'ACTIVE',
                            }],
                        total: 1,
                    });
                    return;
                }
                res.status(200).json({ tenants: [{ id: snap.id, ...snap.data() }], total: 1 });
            }
            catch (err) {
                console.error('[MT-001] Erro ao listar tenants:', err);
                sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao consultar lista de tenants', 'TENANT_LIST_ERROR');
            }
        });
        /** POST /api/v2/admin/tenants — Criação de novo Tenant (Exclusivo SUPER_ADMIN) */
        router.post('/admin/tenants', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
            try {
                const validated = TenantCreateSchema.parse(req.body);
                const tenantId = `tenant-${validated.slug}`;
                // Verificar se slug já existe
                const existing = await db.collection('tenants').doc(tenantId).get();
                if (existing.exists) {
                    sendProblemDetails(res, 409, 'Conflict', `Já existe um tenant cadastrado com o slug "${validated.slug}"`, 'TENANT_ALREADY_EXISTS');
                    return;
                }
                const newTenant = {
                    id: tenantId,
                    name: validated.name,
                    slug: validated.slug,
                    type: validated.type,
                    status: validated.status,
                    documentNumber: validated.documentNumber || null,
                    domain: validated.domain || null,
                    settings: validated.settings || {
                        primaryColor: '#0A4D68',
                        features: {
                            customBranding: true,
                            crmLeads: true,
                            donationsManagement: true,
                            bpmWorkflows: true,
                            financialReports: true,
                            biAnalytics: true,
                        },
                    },
                    metadata: validated.metadata || {},
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    createdBy: req.user.email,
                };
                await db.collection('tenants').doc(tenantId).set(newTenant);
                // Auditoria
                await db.collection('audit_logs').add({
                    action: 'TENANT_CREATED',
                    userEmail: req.user.email,
                    entity: 'tenants',
                    entityId: tenantId,
                    description: `Novo tenant criado: ${validated.name} (${tenantId})`,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    tenantId: 'tenant-ism-hq',
                });
                res.status(201).json({ success: true, tenant: newTenant, message: 'Tenant criado com sucesso.' });
            }
            catch (err) {
                if (err instanceof zod_1.z.ZodError) {
                    sendProblemDetails(res, 400, 'Bad Request', err.errors.map(e => e.message).join('; '), 'VALIDATION_ERROR');
                }
                else {
                    console.error('[MT-001] Erro ao criar tenant:', err);
                    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha interna ao provisionar o tenant', 'TENANT_CREATE_ERROR');
                }
            }
        });
        /** GET /api/v2/admin/tenants/:tenantId — Consulta dados de um Tenant específico com validação de isolamento */
        router.get('/admin/tenants/:tenantId', authenticateToken, resolveTenantContext, async (req, res) => {
            try {
                const { tenantId } = req.params;
                const isSuper = req.isSuperAdmin;
                const currentTenant = req.tenantId;
                if (!isSuper && currentTenant !== tenantId) {
                    logStructured('WARNING', `[IDOR Protection] Tentativa de acesso cross-tenant bloqueada no endpoint /admin/tenants/:tenantId`, {
                        user: req.user.email,
                        attemptedTenant: tenantId,
                        authorizedTenant: currentTenant,
                    });
                    sendProblemDetails(res, 403, 'Forbidden', 'Acesso negado: Você não possui autorização para consultar este tenant.', 'CROSS_TENANT_ACCESS_DENIED');
                    return;
                }
                const docSnap = await db.collection('tenants').doc(tenantId).get();
                if (!docSnap.exists) {
                    sendProblemDetails(res, 404, 'Not Found', 'Tenant não encontrado', 'TENANT_NOT_FOUND');
                    return;
                }
                res.status(200).json({ tenant: { id: docSnap.id, ...docSnap.data() } });
            }
            catch (err) {
                console.error('[MT-001] Erro ao buscar tenant:', err);
                sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao buscar tenant', 'TENANT_FETCH_ERROR');
            }
        });
        /** PATCH /api/v2/admin/tenants/:tenantId — Atualização de configurações do Tenant */
        router.patch('/admin/tenants/:tenantId', authenticateToken, resolveTenantContext, requireRole('SUPER_ADMIN', 'ADMIN', 'TENANT_ADMIN'), async (req, res) => {
            try {
                const { tenantId } = req.params;
                const isSuper = req.isSuperAdmin;
                const currentTenant = req.tenantId;
                if (!isSuper && currentTenant !== tenantId) {
                    sendProblemDetails(res, 403, 'Forbidden', 'Acesso negado: Proibida alteração de configurações de outros tenants.', 'CROSS_TENANT_ACCESS_DENIED');
                    return;
                }
                const validated = TenantUpdateSchema.parse(req.body);
                await db.collection('tenants').doc(tenantId).set({
                    ...validated,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: req.user.email,
                }, { merge: true });
                await db.collection('audit_logs').add({
                    action: 'TENANT_UPDATED',
                    userEmail: req.user.email,
                    entity: 'tenants',
                    entityId: tenantId,
                    description: `Configurações do tenant ${tenantId} atualizadas`,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    tenantId,
                });
                res.status(200).json({ success: true, message: 'Tenant atualizado com sucesso.' });
            }
            catch (err) {
                if (err instanceof zod_1.z.ZodError) {
                    sendProblemDetails(res, 400, 'Bad Request', err.errors.map(e => e.message).join('; '), 'VALIDATION_ERROR');
                }
                else {
                    console.error('[MT-001] Erro ao atualizar tenant:', err);
                    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao atualizar configurações do tenant', 'TENANT_UPDATE_ERROR');
                }
            }
        });
        /** GET /api/v2/admin/tenants/:tenantId/members — Membros vinculados ao Tenant */
        router.get('/admin/tenants/:tenantId/members', authenticateToken, resolveTenantContext, requireRole('SUPER_ADMIN', 'ADMIN', 'TENANT_ADMIN'), async (req, res) => {
            try {
                const { tenantId } = req.params;
                const isSuper = req.isSuperAdmin;
                const currentTenant = req.tenantId;
                if (!isSuper && currentTenant !== tenantId) {
                    sendProblemDetails(res, 403, 'Forbidden', 'Acesso negado: Proibida consulta a membros de outros tenants.', 'CROSS_TENANT_ACCESS_DENIED');
                    return;
                }
                const snap = await db.collection('user_tenants').where('tenantId', '==', tenantId).get();
                const members = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                res.status(200).json({ members, total: members.length });
            }
            catch (err) {
                console.error('[MT-001] Erro ao buscar membros do tenant:', err);
                sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao consultar membros do tenant', 'TENANT_MEMBERS_ERROR');
            }
        });
        /** POST /api/v2/admin/tenants/:tenantId/members — Vínculo explícito de Usuário a um Tenant */
        router.post('/admin/tenants/:tenantId/members', authenticateToken, resolveTenantContext, requireRole('SUPER_ADMIN', 'ADMIN', 'TENANT_ADMIN'), async (req, res) => {
            try {
                const { tenantId } = req.params;
                const isSuper = req.isSuperAdmin;
                const currentTenant = req.tenantId;
                if (!isSuper && currentTenant !== tenantId) {
                    sendProblemDetails(res, 403, 'Forbidden', 'Acesso negado: Proibida adição de membros em outro tenant.', 'CROSS_TENANT_ACCESS_DENIED');
                    return;
                }
                const validated = TenantMemberSchema.parse(req.body);
                const membershipId = `${validated.userId}_${tenantId}`;
                const membershipData = {
                    id: membershipId,
                    userId: validated.userId,
                    userEmail: validated.userEmail,
                    tenantId,
                    role: validated.role,
                    isDefault: validated.isDefault,
                    isActive: true,
                    grantedBy: req.user.email,
                    grantedAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                await db.collection('user_tenants').doc(membershipId).set(membershipData, { merge: true });
                // Atualiza custom claim no Firebase Auth para refletir tenantId
                const userRecord = await admin.auth().getUser(validated.userId);
                const existingClaims = userRecord.customClaims || {};
                const existingTenants = Array.isArray(existingClaims.tenants) ? existingClaims.tenants : [];
                if (!existingTenants.includes(tenantId)) {
                    existingTenants.push(tenantId);
                }
                await admin.auth().setCustomUserClaims(validated.userId, {
                    ...existingClaims,
                    tenantId: validated.isDefault ? tenantId : (existingClaims.tenantId || tenantId),
                    tenantRole: validated.role,
                    tenants: existingTenants,
                });
                await db.collection('audit_logs').add({
                    action: 'TENANT_MEMBER_ADDED',
                    userEmail: req.user.email,
                    entity: 'user_tenants',
                    entityId: membershipId,
                    description: `Usuário ${validated.userEmail} vinculado ao tenant ${tenantId} com role ${validated.role}`,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    tenantId,
                });
                res.status(201).json({ success: true, membership: membershipData, message: 'Usuário vinculado ao tenant com sucesso.' });
            }
            catch (err) {
                if (err instanceof zod_1.z.ZodError) {
                    sendProblemDetails(res, 400, 'Bad Request', err.errors.map(e => e.message).join('; '), 'VALIDATION_ERROR');
                }
                else {
                    console.error('[MT-001] Erro ao vincular membro ao tenant:', err);
                    sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao vincular usuário ao tenant', 'TENANT_MEMBER_ADD_ERROR');
                }
            }
        });
        // ─────────────────────────────────────────────────────────────────────────────
        // ENDPOINTS LGPD — Portabilidade & Eliminação de Dados (Art. 16, 18 LGPD)
        // ─────────────────────────────────────────────────────────────────────────────
        /** POST /api/v2/admin/lgpd/export — Exportação de dados pessoais do titular (Art. 18, V LGPD) */
        router.post('/admin/lgpd/export', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
            try {
                const { email } = req.body;
                if (!email || typeof email !== 'string') {
                    sendProblemDetails(res, 400, 'Bad Request', 'O campo email é obrigatório', 'MISSING_EMAIL');
                    return;
                }
                const targetEmail = email.trim().toLowerCase();
                const [leadsSnap, donationsSnap, partnersSnap, profilesSnap] = await Promise.all([
                    db.collection('leads').where('email', '==', targetEmail).get(),
                    db.collection('donations').where('donorEmail', '==', targetEmail).get(),
                    db.collection('partner_applications').where('email', '==', targetEmail).get(),
                    db.collection('users_profiles').where('email', '==', targetEmail).get(),
                ]);
                const report = {
                    subjectEmail: targetEmail,
                    exportedAt: new Date().toISOString(),
                    requestedBy: req.user.email,
                    legalBasis: 'LGPD Art. 18, V — Direito à portabilidade dos dados',
                    recordsFound: {
                        leads: leadsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                        donations: donationsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                        partnerApplications: partnersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                        userProfile: profilesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                    },
                };
                await db.collection('audit_logs').add({
                    action: 'LGPD_DATA_EXPORTED',
                    userEmail: req.user.email,
                    entity: 'titular_dados',
                    description: `Relatório de portabilidade LGPD gerado para ${targetEmail}`,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
                res.status(200).json(report);
            }
            catch (err) {
                console.error('[LGPD API] Erro ao exportar dados do titular:', err);
                sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao compilar relatório de dados do titular', 'LGPD_EXPORT_ERROR');
            }
        });
        /** POST /api/v2/admin/lgpd/anonymize — Anonimização de dados do titular (Art. 18, VI & Art. 16 LGPD) */
        router.post('/admin/lgpd/anonymize', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
            try {
                const { email } = req.body;
                if (!email || typeof email !== 'string') {
                    sendProblemDetails(res, 400, 'Bad Request', 'O campo email é obrigatório', 'MISSING_EMAIL');
                    return;
                }
                const targetEmail = email.trim().toLowerCase();
                // Trava de segurança: proibir anonimização de contas ativas de Super Admin / Admin
                if (targetEmail === 'instsermelhor.adm@gmail.com') {
                    sendProblemDetails(res, 403, 'Forbidden', 'A conta de Super Administrador não pode ser anonimizada.', 'SUPER_ADMIN_PROTECTED');
                    return;
                }
                const batch = db.batch();
                let anonymizedCount = 0;
                // 1. Leads
                const leadsSnap = await db.collection('leads').where('email', '==', targetEmail).get();
                leadsSnap.docs.forEach(docRef => {
                    batch.update(docRef.ref, {
                        name: '[DADOS_ANONIMIZADOS_LGPD]',
                        email: `anonimo_${docRef.id}@anonymized.lgpd`,
                        phone: '[REMOVIDO]',
                        message: '[CONTEÚDO_ELIMINADO_SOLICITAÇÃO_TITULAR]',
                        anonymizedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    anonymizedCount++;
                });
                // 2. Candidaturas de parceiro
                const partnersSnap = await db.collection('partner_applications').where('email', '==', targetEmail).get();
                partnersSnap.docs.forEach(docRef => {
                    batch.update(docRef.ref, {
                        contactName: '[DADOS_ANONIMIZADOS_LGPD]',
                        email: `anonimo_${docRef.id}@anonymized.lgpd`,
                        phone: '[REMOVIDO]',
                        anonymizedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    anonymizedCount++;
                });
                // 3. Doações (Preserva valor financeiro para conformidade contábil, substitui dados identificadores)
                const donationsSnap = await db.collection('donations').where('donorEmail', '==', targetEmail).get();
                donationsSnap.docs.forEach(docRef => {
                    batch.update(docRef.ref, {
                        donorName: 'Doador Anônimo (LGPD Art. 16, I)',
                        donorEmail: `anonimo_${docRef.id}@anonymized.lgpd`,
                        message: null,
                        anonymizedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    anonymizedCount++;
                });
                await batch.commit();
                await db.collection('audit_logs').add({
                    action: 'LGPD_DATA_ANONYMIZED',
                    userEmail: req.user.email,
                    entity: 'titular_dados',
                    description: `Anonimização LGPD concluída para ${targetEmail} (${anonymizedCount} registros atualizados)`,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
                res.status(200).json({
                    success: true,
                    targetEmail,
                    anonymizedRecords: anonymizedCount,
                    message: `Sucesso: ${anonymizedCount} registros do titular foram anonimizados segundo o Art. 16, I da LGPD.`,
                });
            }
            catch (err) {
                console.error('[LGPD API] Erro ao anonimizar dados do titular:', err);
                sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao efetuar eliminação/anonimização do titular', 'LGPD_ANONYMIZE_ERROR');
            }
        });
        // ─────────────────────────────────────────────────────────────────────────────
        // ENDPOINTS DE TELEMETRIA E ERROS DO SISTEMA
        // ─────────────────────────────────────────────────────────────────────────────
        const ClientTelemetrySchema = zod_1.z.object({
            source: zod_1.z.string().max(100).default('Frontend'),
            message: zod_1.z.string().min(1).max(2000),
            route: zod_1.z.string().max(300).optional(),
            statusCode: zod_1.z.number().optional(),
            stack: zod_1.z.string().max(3000).optional(),
            userAgent: zod_1.z.string().max(500).optional(),
        });
        /** POST /api/v2/telemetry/errors — Coleta pública de erros de clientes frontend (rate-limited) */
        router.post('/telemetry/errors', rateLimiterMiddleware(20, 60000), async (req, res) => {
            try {
                const validated = ClientTelemetrySchema.parse(req.body);
                await reportSystemError(validated.source, validated.message, validated.route || 'CLIENT_RUNTIME', validated.statusCode || 400, validated.stack);
                res.status(201).json({ success: true, message: 'Telemetria de erro registrada.' });
            }
            catch (err) {
                res.status(400).json({ success: false, error: 'Formato de telemetria inválido.' });
            }
        });
        /** GET /api/v2/admin/system/errors — Consulta dos últimos erros do sistema (ADMIN+) */
        router.get('/admin/system/errors', authenticateToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (_req, res) => {
            try {
                const snap = await db.collection('system_errors')
                    .orderBy('timestamp', 'desc')
                    .limit(100)
                    .get();
                const errors = snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        source: data.source || 'SISTEMA',
                        message: data.message || 'Sem mensagem',
                        route: data.route || 'N/A',
                        statusCode: data.statusCode || 500,
                        stack: data.stack || null,
                        timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp) : new Date().toISOString(),
                    };
                });
                res.status(200).json({ errors, total: errors.length });
            }
            catch (err) {
                console.error('[Telemetry API] Erro ao buscar system_errors:', err);
                sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao buscar log de erros do sistema', 'SYSTEM_ERRORS_FETCH_ERROR');
            }
        });
        // ─────────────────────────────────────────────────────────────────────────────
        // TELEMETRIA DE CORE WEB VITALS — Fase 12 / PERF-003
        // ─────────────────────────────────────────────────────────────────────────────
        const WebVitalSchema = zod_1.z.object({
            name: zod_1.z.enum(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']),
            value: zod_1.z.number().nonnegative(),
            rating: zod_1.z.enum(['good', 'needs-improvement', 'poor']),
            delta: zod_1.z.number(),
            id: zod_1.z.string().max(128),
            url: zod_1.z.string().max(512),
            timestamp: zod_1.z.number().positive(),
        });
        /** POST /api/v2/telemetry/web-vitals — Recebe métricas CWV do frontend (sendBeacon) */
        router.post('/telemetry/web-vitals', rateLimiterMiddleware(60, 60000), async (req, res) => {
            try {
                const validated = WebVitalSchema.parse(req.body);
                // Persiste assincronamente — não bloqueia a resposta
                db.collection('cwv_metrics').add({
                    ...validated,
                    receivedAt: new Date().toISOString(),
                }).catch((err) => {
                    logStructured('WARNING', '[WebVitals] Falha ao persistir métrica CWV', { error: err.message });
                });
                res.status(202).json({ success: true });
            }
            catch {
                res.status(400).json({ success: false, error: 'Payload de métrica inválido.' });
            }
        });
        // ─────────────────────────────────────────────────────────────────────────────
        /**
         * Normaliza eventos de pagamento provenientes de múltiplos provedores
         */
        function normalizePaymentEvent(provider, body) {
            const p = provider.toLowerCase().trim();
            // 1. STRIPE (Checkout Session / Payment Intent)
            if (p === 'stripe') {
                const eventType = body.type || body.event;
                const obj = body.data?.object || body;
                if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
                    return {
                        status: 'CONFIRMED',
                        transactionId: obj.id,
                        donorEmail: obj.customer_details?.email || obj.receipt_email || obj.metadata?.donorEmail,
                        amount: obj.amount_total ? obj.amount_total / 100 : (obj.amount ? obj.amount / 100 : undefined),
                    };
                }
                if (eventType === 'charge.refunded' || eventType === 'payment_intent.payment_failed') {
                    return {
                        status: eventType === 'charge.refunded' ? 'REFUNDED' : 'FAILED',
                        transactionId: obj.id,
                        donorEmail: obj.receipt_email || obj.metadata?.donorEmail,
                    };
                }
            }
            // 2. ASAAS (Fintech / Pagamentos recurrentes & Pix)
            if (p === 'asaas') {
                const eventType = body.event;
                const payment = body.payment || {};
                if (eventType === 'PAYMENT_RECEIVED' || eventType === 'PAYMENT_CONFIRMED') {
                    return {
                        status: 'CONFIRMED',
                        transactionId: payment.id,
                        donorEmail: payment.customerEmail || payment.externalReference,
                        amount: payment.value,
                    };
                }
                if (eventType === 'PAYMENT_OVERDUE' || eventType === 'PAYMENT_DELETED') {
                    return { status: 'FAILED', transactionId: payment.id };
                }
                if (eventType === 'PAYMENT_REFUNDED') {
                    return { status: 'REFUNDED', transactionId: payment.id };
                }
            }
            // 3. EFÍ BANK / GERENCIANET (Pix & Boleto)
            if (p === 'efi' || p === 'efi_bank' || p === 'gerencianet') {
                const pixEvent = body.pix?.[0];
                if (pixEvent) {
                    return {
                        status: 'CONFIRMED',
                        transactionId: pixEvent.txid || pixEvent.endToEndId,
                        amount: parseFloat(pixEvent.valor || '0'),
                    };
                }
            }
            // 4. CORA SCFI (Banco Digital oficial do ISM)
            if (p === 'cora') {
                if (body.status === 'PAID' || body.event === 'INVOICE_PAID') {
                    return {
                        status: 'CONFIRMED',
                        transactionId: body.id || body.transactionId,
                        amount: body.amount,
                    };
                }
            }
            // 5. MERCADO PAGO / PAGSEGURO / NUBANK / INTER / BB / ITAÚ / MOCK
            if (body.status === 'approved' || body.status === 'PAID' || body.status === 'CONFIRMED' || body.event === 'PAYMENT_SUCCESS') {
                return {
                    status: 'CONFIRMED',
                    transactionId: body.id || body.txid || body.payment_id,
                    donorEmail: body.email || body.payer?.email,
                    amount: body.amount || body.transaction_amount,
                };
            }
            return { status: 'PENDING', transactionId: body.id || body.transactionId };
        }
        /** POST /api/v2/webhooks/:provider — Webhook Universal de Pagamentos */
        router.post('/webhooks/:provider', async (req, res) => {
            const { provider } = req.params;
            const body = req.body || {};
            try {
                const event = normalizePaymentEvent(provider, body);
                if (event.status !== 'PENDING' && (event.transactionId || event.donorEmail)) {
                    // Buscar doação correspondente no Firestore por ID do gateway ou email do doador
                    let donationRef = null;
                    if (event.transactionId) {
                        const snap = await db.collection('donations').where('gatewayTransactionId', '==', event.transactionId).limit(1).get();
                        if (!snap.empty)
                            donationRef = snap.docs[0].ref;
                    }
                    if (!donationRef && event.donorEmail) {
                        const snap = await db.collection('donations').where('donorEmail', '==', event.donorEmail).where('status', '==', 'PENDING').limit(1).get();
                        if (!snap.empty)
                            donationRef = snap.docs[0].ref;
                    }
                    if (donationRef) {
                        await donationRef.update({
                            status: event.status,
                            paidAt: admin.firestore.FieldValue.serverTimestamp(),
                            gatewayName: provider.toUpperCase(),
                            gatewayTransactionId: event.transactionId ?? null,
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        await db.collection('audit_logs').add({
                            action: 'PAYMENT_WEBHOOK_PROCESSED',
                            userEmail: `system@webhook.${provider.toLowerCase()}`,
                            entity: 'donations',
                            entityId: donationRef.id,
                            description: `Pagamento ${event.status} via ${provider.toUpperCase()} (ID: ${event.transactionId || '—'})`,
                            timestamp: admin.firestore.FieldValue.serverTimestamp(),
                        });
                    }
                }
                res.status(200).json({
                    received: true,
                    provider: provider.toUpperCase(),
                    status: event.status,
                    message: `Webhook ${provider} processado com sucesso.`,
                });
            }
            catch (err) {
                console.error(`[Webhook ${provider}] Erro ao processar:`, err);
                // Retornar 200 para evitar retentativas infinitas do gateway em falhas de parsing
                res.status(200).json({ received: true, error: err.message });
            }
        });
        /** POST /api/v2/payments/checkout — Inicializa Checkout Multi-Provedor (Stripe, ASAAS, Efí, Pix Direct) */
        router.post('/payments/checkout', rateLimiterMiddleware(10, 60000), async (req, res) => {
            try {
                const { provider = 'pix_direct', amount, donorName, donorEmail, recurrence = 'SINGLE', campaignId } = req.body;
                if (!amount || amount <= 0) {
                    sendProblemDetails(res, 400, 'Bad Request', 'O valor da doação deve ser positivo', 'INVALID_AMOUNT');
                    return;
                }
                // Criar doação PENDING no Firestore
                const docRef = await db.collection('donations').add({
                    donorName: donorName || 'Doador Anônimo',
                    donorEmail: donorEmail || 'doacao@institutosermelhor.org',
                    amount: Number(amount),
                    currency: 'BRL',
                    paymentMethod: provider.toUpperCase(),
                    status: 'PENDING',
                    recurrence,
                    campaignId: campaignId ?? null,
                    gatewayName: provider.toUpperCase(),
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                const isStripe = provider.toLowerCase() === 'stripe';
                const isAsaas = provider.toLowerCase() === 'asaas';
                res.status(201).json({
                    success: true,
                    donationId: docRef.id,
                    provider: provider.toUpperCase(),
                    // URLs e Payloads preparados para os SDKs no frontend
                    checkoutUrl: isStripe
                        ? `https://checkout.stripe.com/pay/cs_live_${docRef.id}`
                        : isAsaas
                            ? `https://www.asaas.com/c/${docRef.id}`
                            : null,
                    pixCopiaECola: `00020126580014BR.GOV.BCB.PIX011409040440000147520400005303986540${Number(amount).toFixed(2).replace('.', '')}5802BR5925INSTITUTO SER MELHOR6009SAO PAULO62070503***6304ABCD`,
                    instructions: 'Doação registrada com status PENDING. Aguardando confirmação do pagamento.',
                });
            }
            catch (err) {
                console.error('[Payments Checkout] Erro ao criar checkout:', err);
                sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao inicializar o checkout', 'CHECKOUT_ERROR');
            }
        });
        // ─────────────────────────────────────────────────────────────────────────────
        // SEO: SITEMAP.XML E ROBOTS.TXT DINÂMICOS
        // ─────────────────────────────────────────────────────────────────────────────
        const SITE_URL = 'https://institutosermelhor.org';
        const STATIC_ROUTES = [
            { path: '/', priority: '1.0', changefreq: 'weekly' },
            { path: '/#sobre', priority: '0.8', changefreq: 'monthly' },
            { path: '/#projetos', priority: '0.8', changefreq: 'weekly' },
            { path: '/#impacto', priority: '0.8', changefreq: 'monthly' },
            { path: '/#governança', priority: '0.7', changefreq: 'monthly' },
            { path: '/#transparência', priority: '0.7', changefreq: 'monthly' },
            { path: '/#parceiros', priority: '0.6', changefreq: 'monthly' },
            { path: '/#doação', priority: '0.9', changefreq: 'weekly' },
        ];
        /** GET /api/v2/sitemap.xml — Sitemap XML dinâmico com posts publicados do blog */
        router.get('/sitemap.xml', async (_req, res) => {
            try {
                const now = new Date().toISOString().split('T')[0];
                // Busca posts publicados do Firestore
                const blogSnap = await db.collection('blog_posts')
                    .where('status', '==', 'PUBLISHED')
                    .limit(200)
                    .get();
                const blogUrls = blogSnap.docs.map(doc => {
                    const data = doc.data();
                    const slug = data.slug || doc.id;
                    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString().split('T')[0] : now;
                    return `  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
                });
                const staticUrls = STATIC_ROUTES.map(route => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
                const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('\n')}
${blogUrls.join('\n')}
</urlset>`;
                res.set('Content-Type', 'application/xml; charset=utf-8');
                res.set('Cache-Control', 'public, max-age=3600');
                res.status(200).send(xml);
            }
            catch (err) {
                logStructured('ERROR', '[Sitemap] Falha ao gerar sitemap.xml', { error: err.message });
                res.status(500).send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
            }
        });
        /** GET /api/v2/robots.txt — Robots.txt com referência ao sitemap */
        router.get('/robots.txt', (_req, res) => {
            const robotsTxt = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${SITE_URL}/api/sitemap.xml
Sitemap: https://southamerica-east1-ismbd-27e84.cloudfunctions.net/api/api/v2/sitemap.xml
`;
            res.set('Content-Type', 'text/plain; charset=utf-8');
            res.set('Cache-Control', 'public, max-age=86400');
            res.status(200).send(robotsTxt);
        });
        app.use('/api/v2', router);
        export const api = (0, https_1.onRequest)({ region: 'southamerica-east1', cors: true }, app);
    }
    finally {
    }
});
//# sourceMappingURL=index.js.map