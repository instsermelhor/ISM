-- =============================================================================
-- INSTITUTO SER MELHOR — POSTGRESQL ROW LEVEL SECURITY (RLS-001)
-- Migração Canônica de DDL, Schemas, Políticas RLS e Funções de Sessão
-- Conformidade: Zero Trust, Multi-Tenancy MT-001, RBAC-MASTER-001, LGPD Art. 6º
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA IF NOT EXISTS app;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FUNÇÕES DE CONTEXTO DE SESSÃO & SEGURANÇA (IAM / Context Bridge)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION app.get_current_tenant_id()
RETURNS TEXT AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.get_current_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', true), '');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.get_current_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(NULLIF(current_setting('app.current_role', true), ''), 'VIEWER');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        app.get_current_role() = 'SUPER_ADMIN' OR
        current_setting('app.current_user_email', true) = 'instsermelhor.adm@gmail.com'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABELAS DE TENANCY & IDENTIDADE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'NGO_PARTNER',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    document_number VARCHAR(30),
    domain VARCHAR(200),
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(320)
);

CREATE TABLE IF NOT EXISTS user_tenants (
    id VARCHAR(200) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    user_email VARCHAR(320) NOT NULL,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    role VARCHAR(50) NOT NULL DEFAULT 'TENANT_VIEWER',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    granted_by VARCHAR(320) NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS users_profiles (
    uid VARCHAR(128) PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    display_name VARCHAR(200),
    role VARCHAR(50) NOT NULL DEFAULT 'VIEWER',
    tenant_id VARCHAR(100) REFERENCES tenants(id) ON DELETE SET NULL,
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    force_password_change BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(320)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABELAS OPERACIONAIS TENANT-SCOPED
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    donor_name VARCHAR(200) NOT NULL,
    donor_email VARCHAR(320) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    recurrence VARCHAR(20) NOT NULL DEFAULT 'SINGLE',
    campaign_id VARCHAR(100),
    gateway_name VARCHAR(50),
    gateway_transaction_id VARCHAR(200),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(320) NOT NULL,
    phone VARCHAR(30),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'PORTAL',
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200) NOT NULL,
    email VARCHAR(320) NOT NULL,
    phone VARCHAR(30),
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    account_name VARCHAR(200) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipeline_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    stage VARCHAR(50) NOT NULL DEFAULT 'IDEA',
    priority INT NOT NULL DEFAULT 0,
    due_date TIMESTAMPTZ,
    assignee_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bpm_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    requester_email VARCHAR(320) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bpm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    process_id UUID NOT NULL REFERENCES bpm_processes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    assignee_role VARCHAR(50) NOT NULL,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id VARCHAR(128),
    user_email VARCHAR(320) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(128),
    description TEXT NOT NULL,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. HABILITAÇÃO & OBRIGATORIEDADE DE ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenants FORCE ROW LEVEL SECURITY;

ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations FORCE ROW LEVEL SECURITY;

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;

ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_applications FORCE ROW LEVEL SECURITY;

ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_data FORCE ROW LEVEL SECURITY;

ALTER TABLE pipeline_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_cards FORCE ROW LEVEL SECURITY;

ALTER TABLE bpm_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bpm_processes FORCE ROW LEVEL SECURITY;

ALTER TABLE bpm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bpm_tasks FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. POLÍTICAS DE RLS GRANULARES (SELECT, INSERT, UPDATE, DELETE)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 5.1 TENANTS
CREATE POLICY rls_tenants_select ON tenants
    FOR SELECT USING (
        app.is_super_admin() OR 
        id = app.get_current_tenant_id() OR 
        status = 'ACTIVE'
    );

CREATE POLICY rls_tenants_insert ON tenants
    FOR INSERT WITH CHECK (app.is_super_admin());

CREATE POLICY rls_tenants_update ON tenants
    FOR UPDATE USING (
        app.is_super_admin() OR 
        (id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    ) WITH CHECK (
        app.is_super_admin() OR 
        (id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    );

CREATE POLICY rls_tenants_delete ON tenants
    FOR DELETE USING (app.is_super_admin());

-- ── 5.2 USER_TENANTS
CREATE POLICY rls_user_tenants_select ON user_tenants
    FOR SELECT USING (
        app.is_super_admin() OR 
        user_id = app.get_current_user_id() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    );

CREATE POLICY rls_user_tenants_insert ON user_tenants
    FOR INSERT WITH CHECK (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    );

CREATE POLICY rls_user_tenants_update ON user_tenants
    FOR UPDATE USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    ) WITH CHECK (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    );

CREATE POLICY rls_user_tenants_delete ON user_tenants
    FOR DELETE USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    );

-- ── 5.3 USERS_PROFILES (User-Scoped & Admin)
CREATE POLICY rls_users_profiles_select ON users_profiles
    FOR SELECT USING (
        app.is_super_admin() OR 
        uid = app.get_current_user_id() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'EDITOR', 'GESTOR'))
    );

CREATE POLICY rls_users_profiles_update ON users_profiles
    FOR UPDATE USING (
        app.is_super_admin() OR 
        uid = app.get_current_user_id() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() = 'ADMIN')
    ) WITH CHECK (
        app.is_super_admin() OR 
        uid = app.get_current_user_id() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() = 'ADMIN')
    );

-- ── 5.4 DONATIONS (Tenant-Scoped)
CREATE POLICY rls_donations_select ON donations
    FOR SELECT USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'GESTOR', 'OPERADOR'))
    );

CREATE POLICY rls_donations_insert ON donations
    FOR INSERT WITH CHECK (
        tenant_id = app.get_current_tenant_id() OR app.is_super_admin()
    );

CREATE POLICY rls_donations_update ON donations
    FOR UPDATE USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    ) WITH CHECK (
        (app.is_super_admin() OR tenant_id = app.get_current_tenant_id()) AND 
        app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN')
    );

CREATE POLICY rls_donations_delete ON donations
    FOR DELETE USING (app.is_super_admin());

-- ── 5.5 LEADS & CRM (Tenant-Scoped)
CREATE POLICY rls_leads_select ON leads
    FOR SELECT USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'GESTOR', 'OPERADOR'))
    );

CREATE POLICY rls_leads_insert ON leads
    FOR INSERT WITH CHECK (
        tenant_id = app.get_current_tenant_id() OR app.is_super_admin()
    );

CREATE POLICY rls_leads_update ON leads
    FOR UPDATE USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'GESTOR', 'OPERADOR'))
    ) WITH CHECK (
        (app.is_super_admin() OR tenant_id = app.get_current_tenant_id()) AND 
        app.get_current_role() IN ('ADMIN', 'GESTOR', 'OPERADOR', 'SUPER_ADMIN')
    );

CREATE POLICY rls_leads_delete ON leads
    FOR DELETE USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    );

-- ── 5.6 DADOS FINANCEIROS (Tenant-Scoped & Restrito a Admin)
CREATE POLICY rls_financial_data_select ON financial_data
    FOR SELECT USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    );

CREATE POLICY rls_financial_data_insert ON financial_data
    FOR INSERT WITH CHECK (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    );

CREATE POLICY rls_financial_data_update ON financial_data
    FOR UPDATE USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    ) WITH CHECK (
        (app.is_super_admin() OR tenant_id = app.get_current_tenant_id()) AND 
        app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN')
    );

CREATE POLICY rls_financial_data_delete ON financial_data
    FOR DELETE USING (false); -- Imutável por compliance contábil

-- ── 5.7 AUDIT LOGS (Trilha Imutável LGPD Art. 6º X)
CREATE POLICY rls_audit_logs_select ON audit_logs
    FOR SELECT USING (
        app.is_super_admin() OR 
        (tenant_id = app.get_current_tenant_id() AND app.get_current_role() IN ('ADMIN', 'TENANT_ADMIN'))
    );

CREATE POLICY rls_audit_logs_insert ON audit_logs
    FOR INSERT WITH CHECK (
        tenant_id = app.get_current_tenant_id() OR app.is_super_admin()
    );

CREATE POLICY rls_audit_logs_update ON audit_logs
    FOR UPDATE USING (false); -- Proibido alterar logs

CREATE POLICY rls_audit_logs_delete ON audit_logs
    FOR DELETE USING (false); -- Proibido excluir logs

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ÍNDICES COMPOSTOS PARA PERFORMANCE DAS POLÍTICAS RLS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_donations_tenant_created ON donations(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_tenant_status ON donations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_created ON leads(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_partner_app_tenant ON partner_applications(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_tenant ON financial_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_tenant ON pipeline_cards(tenant_id, stage);
CREATE INDEX IF NOT EXISTS idx_bpm_proc_tenant ON bpm_processes(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_bpm_tasks_tenant ON bpm_tasks(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_tenants_lookup ON user_tenants(user_id, tenant_id);
