# POLÍTICA CRIPTOGRÁFICA INSTITUCIONAL E SEGURANÇA DE TRANSPORTE
**Código:** SEC-CRYPT-POL-001
**Versão:** 1.0.0
**Classificação:** Crítico — Infraestrutura e Segurança da Informação
**Aprovado por:** Diretoria de TI e Segurança — Instituto Ser Melhor

---

## 1. OBJETIVO E ESCOPO

Esta política define os padrões criptográficos obrigatórios para a transmissão e armazenamento de dados em todos os domínios, serviços web, APIs e microserviços do **Instituto Ser Melhor (ISM)**.
Aplica-se a:
- Todos os domínios institucionais e administrativos (, , etc.).
- APIs em Cloud Functions ().
- Serviços de CDN, Edge e infraestrutura Firebase/Google Cloud Platform.
- Dispositivos de clientes, navegadores e integrações externas (Stripe, Google APIs, etc.).

---

## 2. PROTOCOLOS E VERSÕES TLS

### 2.1. Versões Permitidas
- **TLS 1.3 (RFC 8446):** Obrigatório e preferencial em todas as conexões públicas e internas.
- **TLS 1.2 (RFC 5246):** Permitido exclusivamente para compatibilidade de clientes legados que negociem Cipher Suites seguras com Perfect Forward Secrecy (PFS).

### 2.2. Protocolos Proibidos (Hard Block)
- **SSLv2, SSLv3, TLS 1.0, TLS 1.1:** Estritamente proibidos e desabilitados na terminação de borda da Google Cloud CDN / Firebase Hosting.
- Qualquer tentativa de handshake com versões anteriores a TLS 1.2 deve ser rejeitada pela camada de borda.

---

## 3. SUÍTES DE CIFRAS (CIPHER SUITES)

### 3.1. Requisitos Obrigatórios
- **Perfect Forward Secrecy (PFS):** Obrigatório (ECDHE / DHE).
- **Modo de Operação:** AEAD (Authenticated Encryption with Associated Data), como AES-GCM ou ChaCha20-Poly1305.
- **Proibição:** Cifras CBC obsoletas, RC4, 3DES, DES, NULL e cifras sem autenticação.

### 3.2. Cifras Recomendadas (TLS 1.3)
- 
- 
- 

### 3.3. Cifras Permitidas (TLS 1.2 com PFS)
- 
- 
- 
- 
- 
- 

---

## 4. POLÍTICA DE HSTS (HTTP STRICT TRANSPORT SECURITY)

### 4.1. Configuração Padrão
Todos os pontos de entrada HTTP do ISM devem responder com o cabeçalho HSTS em modo **Strict**:


### 4.2. Parâmetros Obrigatórios
- **:** Mínimo de 63.072.000 segundos (2 anos).
- **:** Obrigatório para cobrir todos os subdomínios presentes e futuros.
- **:** Obrigatório para elegibilidade e inclusão permanente nas listas de pré-carregamento dos principais navegadores (Chrome, Firefox, Safari, Edge).

---

## 5. GESTÃO DO CICLO DE VIDA DE CERTIFICADOS DIGITAIS

### 5.1. Autoridades Certificadoras (CAs)
- Os certificados para os domínios do ISM são provisionados e gerenciados automaticamente pela Google Trust Services / Let's Encrypt através do Firebase Hosting / GCP.
- Chaves privadas nunca devem ser armazenadas em repositórios Git, servidores locais ou arquivos não cifrados.

### 5.2. Prazos de Monitoramento e Renovação
- **Renovação Automática:** Disparada pelo Google Cloud com antecedência de 30 dias da expiração.
- **Alerta Verde (> 30 dias):** Operação normal.
- **Alerta Amarelo (15 a 30 dias):** Aviso preventivo na auditoria semanal do CI/CD.
- **Alerta Laranja (7 a 14 dias):** Notificação de alta prioridade aos administradores.
- **Alerta Vermelho (< 7 dias):** Bloqueio no Deploy Gate e escalonamento crítico.

---

## 6. PREVENÇÃO DE CONTEÚDO MISTO (MIXED CONTENT)

- **Proibição Estrita:** Nenhum recurso ativo (scripts, iframes, stylesheets) ou passivo (imagens, áudios, vídeos) pode ser requisitado via .
- **Content Security Policy:** A diretiva  deve estar ativa em todos os documentos HTML para instruir os navegadores a auto-converter qualquer link HTTP em HTTPS.
- **WebSockets:** Conexões bidirecionais devem utilizar exclusivamente o protocolo seguro .

---

## 7. SEGURANÇA DE COOKIES E SESSÃO

- Caso cookies sejam emitidos por qualquer serviço ou API do ISM, devem obrigatoriamente possuir os seguintes atributos de segurança:
  - : Garante envio apenas através de HTTPS.
  - : Previne acesso via JavaScript (mitigação de roubo de sessão via XSS).
  -  ou : Mitigação de ataques Cross-Site Request Forgery (CSRF).

---

## 8. REGISTROS CAA E DNSSEC

### 8.1. Registros CAA (Certification Authority Authorization)
Para mitigar a emissão indevida de certificados por CAs não autorizadas, o DNS do domínio  deve configurar:


### 8.2. DNSSEC
O domínio deve ter DNSSEC ativado no registrador de domínio para prevenir ataques de DNS Spoofing e interceptação de tráfego.

---

## 9. CONFORMIDADE E DEPLOY GATE

A não conformidade com qualquer item desta política constitui violação de segurança de gravidade **CRITICAL** ou **HIGH**, resultando em bloqueio imediato do pipeline de Deploy ().
