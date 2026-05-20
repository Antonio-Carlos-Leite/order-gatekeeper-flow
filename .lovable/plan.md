
# Plano: Segurança Corporativa IPPark (SaaS Multiempresa)

Este é um escopo grande. Vou implementá-lo em **fases**, entregando cada parte funcional antes de avançar. Aprove para começar pela Fase 1.

## Visão geral da arquitetura

- **Autenticação**: já usamos Supabase Auth (JWT + refresh + bcrypt nativo). Vou reaproveitar e endurecer.
- **Centralização**: tudo de gestão avançada vive **apenas** dentro da Área de Manutenção (que já existe via `MaintenanceSection` + `sessionStorage` flag). Diretores/Gestores **não** ganham nenhum poder novo.
- **Multiempresa**: já isolado por `empresa_id` + RLS. Mantido.
- **Emails**: usar **Lovable Emails** (auth-email-hook + transacional) com domínio próprio do IPPark.

## Fases de entrega

### Fase 1 — Fundação de dados e auditoria (essa entrega)
- Tabela `user_status` (status: pendente/ativo/bloqueado, email_verificado, must_change_password, failed_attempts, locked_until, last_login_at)
- Tabela `audit_logs` (actor_id, action, target_user_id, empresa_id, ip, user_agent, metadata, created_at)
- Tabela `active_sessions` (user_id, session_id, ip, user_agent, last_seen, created_at)
- Tabela `password_history` (hashes anteriores p/ impedir reuso)
- RLS: leitura/escrita apenas via edge functions com service_role; usuário comum só lê o próprio status
- Função `log_audit()` helper
- Trigger no `handle_new_user` para criar `user_status` com `pendente` + `must_change_password=false`

### Fase 2 — Verificação de email obrigatória + senha temporária
- Configurar `auto_confirm_email = false` (já é o default)
- Edge function `admin-create-user`: cria usuário com status=pendente, gera senha temporária, envia email de boas-vindas
- Edge function `force-password-change`: marca `must_change_password=true`
- Tela `/primeiro-acesso`: bloqueia navegação até trocar senha
- Política de senha forte (8+ chars, maiúscula, número, especial) + checagem contra `password_history`
- Habilitar **HIBP** (`password_hibp_enabled: true`)

### Fase 3 — Recuperação de senha
- Link "Esqueceu sua senha?" no LoginForm
- Página `/reset-password` (recovery flow Supabase)
- Customização do email de recovery via templates Lovable Emails

### Fase 4 — Painel "Segurança de Usuários" (apenas Manutenção)
Adicionar dentro do `MaintenanceSection`:
- Lista global de usuários (todas empresas)
- Ações: criar, bloquear/desbloquear, ativar/desativar, reenviar verificação, forçar reset, alterar permissões, excluir, encerrar sessão
- Visualização de sessões ativas
- Logs de auditoria filtráveis (usuário, empresa, ação, data)
- Monitor de tentativas de login falhas
- Todas as ações chamam edge functions que registram em `audit_logs`

### Fase 5 — Brute force + rate limit + sessões
- Edge function `check-login-attempt`: incrementa `failed_attempts`, bloqueia conta após 5 tentativas por 15min
- Rate limit por IP (tabela `rate_limits` simples)
- Registro de sessão ativa no login; encerramento remoto via revoke
- Expiração de sessão configurável

### Fase 6 — Perfil → Segurança → Alterar Senha
- Nova rota/seção no perfil do usuário (qualquer role)
- Campos: senha atual, nova, confirmar
- Valida política + histórico

### Fase 7 — Emails transacionais customizados
- Configurar domínio de email IPPark
- Scaffold de auth email templates (verificação, recovery, magic link)
- Scaffold transacional para "Acesso liberado" com senha temporária
- Branding IPPark (logo, cores #0B2E59)

### Fase 8 — Telas modernas auxiliares
- `/verificar-email` (sucesso/erro/expirado)
- `/conta-pendente`
- `/conta-bloqueada`
- Confirmação visual após alteração de senha

## Restrições reforçadas
- Diretor/Gestor/Estoque: **nenhum** acesso ao painel de segurança. Continuam só editando o próprio perfil e a própria empresa.
- Manutenção continua protegida pela autenticação especial existente (sessionStorage flag + credenciais separadas).
- Senhas reais **nunca** trafegam para a UI; resets sempre por email.

## O que precisa do usuário antes de começar Fase 2/7
1. Domínio do IPPark para envio de emails (ex: `ippark.com` ou subdomínio). Sem isso, emails saem com remetente padrão Lovable.
2. Confirmação de quem hoje tem acesso à Área de Manutenção (credenciais atuais).

## Próximo passo
Se aprovar, começo agora pela **Fase 1** (migrations de auditoria/status/sessões/histórico) e em seguida **Fase 6** (alterar senha no perfil — entrega rápida e independente). Depois seguimos para verificação de email e painel de segurança nas fases seguintes.

Quer que eu siga nessa ordem, ou prefere priorizar outra fase primeiro (ex.: painel de segurança antes da recuperação)?
