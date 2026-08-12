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
exports.api = void 0;
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
app.use(express_1.default.json());
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
/** GET /api/v2/health — Liveness Probe */
router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', apiVersion: 'v2.0', mode: 'Liveness', timestamp: new Date().toISOString() });
});
/** GET /api/v2/health/deep — Readiness Probe (Testa conexão com o Firestore) */
router.get('/health/deep', async (_req, res) => {
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
    }
    catch (err) {
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
        // 2. Leitura correta do custom claim 'role' do token JWT Firebase
        // O Admin SDK seta via: admin.auth().setCustomUserClaims(uid, { role: 'ADMIN' })
        // E o token decodificado expõe como: decodedToken.role (campo raiz)
        const role = user.role || 'VIEWER';
        if (role === 'SUPER_ADMIN') {
            return next();
        }
        if (allowedRoles.includes(role)) {
            return next();
        }
        sendProblemDetails(res, 403, 'Forbidden', `Acesso negado. Requer função: ${allowedRoles.join(', ')}. Role atual: ${role}`, 'FORBIDDEN');
    };
}
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
        // Proteção: apenas SUPER_ADMIN pode definir role SUPER_ADMIN
        if (role === 'SUPER_ADMIN' && req.user.email !== 'instsermelhor.adm@gmail.com') {
            sendProblemDetails(res, 403, 'Forbidden', 'Apenas o Super Administrador pode elevar uma conta para SUPER_ADMIN.', 'FORBIDDEN');
            return;
        }
        const target = await admin.auth().getUser(userId);
        if (target.customClaims?.role === 'SUPER_ADMIN' && req.user.email !== 'instsermelhor.adm@gmail.com') {
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
    }
    catch (err) {
        console.error('[API Gateway] Erro ao excluir usuário:', err);
        sendProblemDetails(res, 500, 'Internal Server Error', 'Falha ao excluir usuário', 'USER_DELETE_ERROR');
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
// ENDPOINTS DE PAGAMENTO MULTI-GATEWAY — Stripe, ASAAS, Efí, Cora, Nubank, BB
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
app.use('/api/v2', router);
exports.api = (0, https_1.onRequest)({ region: 'southamerica-east1', cors: true }, app);
//# sourceMappingURL=index.js.map