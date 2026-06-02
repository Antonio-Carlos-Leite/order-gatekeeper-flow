/**
 * Geradores de HTML para emails IPPark.
 *
 * Estes templates são reutilizáveis pelo provedor de autenticação atual
 * (via configuração de templates) e também pelo futuro `auth-email-hook`
 * quando o domínio próprio estiver verificado. A assinatura de cada
 * função é estável — para migrar basta plugar no novo provedor.
 */
import { EMAIL_CONFIG } from '@/config/email';

const { brand, companyName, companyLegalName, supportEmail, logoUrl } = EMAIL_CONFIG;

interface BaseLayoutOptions {
  title: string;
  preview?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}

const baseLayout = ({ title, preview, body, ctaLabel, ctaUrl, footerNote }: BaseLayoutOptions) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${brand.surface};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:${brand.textBody};">
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden;">${preview}</div>` : ''}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${brand.surface};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:${brand.background};border:1px solid ${brand.border};border-radius:12px;overflow:hidden;">
        <tr><td style="background:${brand.primary};padding:24px;text-align:center;">
          <img src="${logoUrl}" alt="${companyName}" width="80" style="display:inline-block;border-radius:8px;" />
          <div style="color:#fff;font-size:14px;letter-spacing:2px;margin-top:8px;font-weight:600;">${companyName}</div>
        </td></tr>
        <tr><td style="padding:32px 32px 8px 32px;">
          <h1 style="margin:0 0 16px;color:${brand.primary};font-size:22px;font-weight:700;">${title}</h1>
          <div style="font-size:15px;line-height:1.6;color:${brand.textBody};">${body}</div>
          ${ctaLabel && ctaUrl ? `
          <div style="text-align:center;margin:28px 0 8px;">
            <a href="${ctaUrl}" style="display:inline-block;background:${brand.primary};color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">${ctaLabel}</a>
          </div>
          <p style="font-size:12px;color:${brand.textMuted};word-break:break-all;margin:8px 0 0;">Se o botão não funcionar, copie e cole este link no navegador:<br/><a href="${ctaUrl}" style="color:${brand.accent};">${ctaUrl}</a></p>
          ` : ''}
        </td></tr>
        ${footerNote ? `<tr><td style="padding:0 32px 24px;"><div style="background:${brand.surface};border-left:3px solid ${brand.accent};padding:12px 16px;font-size:13px;color:${brand.textMuted};border-radius:4px;">${footerNote}</div></td></tr>` : ''}
        <tr><td style="border-top:1px solid ${brand.border};padding:20px 32px;background:${brand.surface};">
          <p style="margin:0;font-size:12px;color:${brand.textMuted};line-height:1.5;">
            Este é um email automático do sistema <strong>${companyName}</strong>. Não responda a esta mensagem.<br/>
            Dúvidas? Entre em contato com <a href="mailto:${supportEmail}" style="color:${brand.accent};">${supportEmail}</a>.
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:${brand.textMuted};">© ${new Date().getFullYear()} ${companyLegalName}. Todos os direitos reservados.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export interface TemplateResult {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  verifyEmail: (confirmationUrl: string): TemplateResult => ({
    subject: `Confirme seu email no ${EMAIL_CONFIG.companyName}`,
    html: baseLayout({
      title: 'Confirme seu endereço de email',
      preview: 'Confirme seu email para ativar sua conta IPPARK',
      body: `<p>Olá,</p><p>Recebemos uma solicitação de cadastro no sistema <strong>${EMAIL_CONFIG.companyName}</strong>. Para ativar sua conta e começar a usar a plataforma, confirme seu endereço de email clicando no botão abaixo.</p>`,
      ctaLabel: 'Confirmar email',
      ctaUrl: confirmationUrl,
      footerNote: 'Se você não solicitou este cadastro, ignore este email. Nenhuma ação será realizada na sua conta.',
    }),
    text: `Confirme seu email no ${EMAIL_CONFIG.companyName}: ${confirmationUrl}`,
  }),

  recoverPassword: (resetUrl: string): TemplateResult => ({
    subject: `${EMAIL_CONFIG.companyName} — Redefinição de senha`,
    html: baseLayout({
      title: 'Redefinição de senha',
      preview: 'Solicitamos sua confirmação para redefinir sua senha',
      body: `<p>Olá,</p><p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>${EMAIL_CONFIG.companyName}</strong>. Clique no botão abaixo para criar uma nova senha segura.</p><p style="font-size:13px;color:${brand.textMuted};">Este link expira em 1 hora por questões de segurança.</p>`,
      ctaLabel: 'Redefinir senha',
      ctaUrl: resetUrl,
      footerNote: 'Se você não solicitou esta redefinição, ignore este email. Sua senha atual permanecerá inalterada.',
    }),
    text: `Redefinir sua senha no ${EMAIL_CONFIG.companyName}: ${resetUrl}`,
  }),

  temporaryPassword: (displayName: string, tempPassword: string, loginUrl: string): TemplateResult => ({
    subject: `Bem-vindo ao ${EMAIL_CONFIG.companyName} — Sua senha de acesso`,
    html: baseLayout({
      title: `Bem-vindo, ${displayName}!`,
      preview: 'Sua conta IPPARK foi criada — veja sua senha temporária',
      body: `<p>Sua conta no sistema <strong>${EMAIL_CONFIG.companyName}</strong> foi criada por um administrador. Use os dados abaixo para fazer seu primeiro acesso:</p>
        <div style="background:${brand.surface};border:1px solid ${brand.border};border-radius:8px;padding:16px;margin:16px 0;font-family:Menlo,Monaco,monospace;font-size:14px;">
          <div style="color:${brand.textMuted};font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Senha temporária</div>
          <div style="color:${brand.primary};font-weight:700;font-size:18px;letter-spacing:2px;">${tempPassword}</div>
        </div>
        <p><strong>Importante:</strong> por segurança, você será obrigado a criar uma nova senha no primeiro acesso.</p>`,
      ctaLabel: 'Acessar o sistema',
      ctaUrl: loginUrl,
      footerNote: 'Nunca compartilhe esta senha. Caso suspeite de uso indevido, entre em contato imediatamente com o suporte.',
    }),
    text: `Bem-vindo ao ${EMAIL_CONFIG.companyName}. Senha temporária: ${tempPassword}. Acesso: ${loginUrl}`,
  }),

  welcome: (displayName: string, loginUrl: string): TemplateResult => ({
    subject: `Bem-vindo ao ${EMAIL_CONFIG.companyName}`,
    html: baseLayout({
      title: `Bem-vindo, ${displayName}!`,
      preview: `Sua conta no ${EMAIL_CONFIG.companyName} foi ativada com sucesso`,
      body: `<p>Sua conta no sistema <strong>${EMAIL_CONFIG.companyName}</strong> foi ativada com sucesso. Agora você já pode acessar todas as funcionalidades disponíveis para o seu perfil.</p>`,
      ctaLabel: 'Acessar o sistema',
      ctaUrl: loginUrl,
    }),
    text: `Bem-vindo ao ${EMAIL_CONFIG.companyName}: ${loginUrl}`,
  }),

  invite: (inviterName: string, empresaNome: string, inviteUrl: string): TemplateResult => ({
    subject: `Convite para acessar o ${EMAIL_CONFIG.companyName}`,
    html: baseLayout({
      title: 'Você foi convidado',
      preview: `${inviterName} convidou você para o ${EMAIL_CONFIG.companyName}`,
      body: `<p><strong>${inviterName}</strong> convidou você para acessar o sistema <strong>${EMAIL_CONFIG.companyName}</strong> da unidade <strong>${empresaNome}</strong>.</p><p>Clique no botão abaixo para aceitar o convite e definir sua senha de acesso.</p>`,
      ctaLabel: 'Aceitar convite',
      ctaUrl: inviteUrl,
      footerNote: 'Este convite é pessoal e intransferível. Se você não esperava receber este email, pode ignorá-lo com segurança.',
    }),
    text: `Convite para o ${EMAIL_CONFIG.companyName}: ${inviteUrl}`,
  }),

  passwordChanged: (displayName: string, ip?: string, when?: string): TemplateResult => ({
    subject: `${EMAIL_CONFIG.companyName} — Sua senha foi alterada`,
    html: baseLayout({
      title: 'Senha alterada com sucesso',
      preview: 'Confirmação de alteração de senha',
      body: `<p>Olá, ${displayName}.</p><p>A senha da sua conta no <strong>${EMAIL_CONFIG.companyName}</strong> foi alterada com sucesso${when ? ` em <strong>${when}</strong>` : ''}${ip ? ` a partir do endereço <strong>${ip}</strong>` : ''}.</p>`,
      footerNote: '⚠️ Se você NÃO realizou esta alteração, entre em contato imediatamente com o suporte e reporte o incidente.',
    }),
    text: `Sua senha no ${EMAIL_CONFIG.companyName} foi alterada${when ? ` em ${when}` : ''}.`,
  }),

  securityAlert: (displayName: string, eventDescription: string, when: string, ip?: string): TemplateResult => ({
    subject: `${EMAIL_CONFIG.companyName} — Alerta de segurança`,
    html: baseLayout({
      title: '🔒 Alerta de segurança',
      preview: 'Detectamos uma atividade importante na sua conta',
      body: `<p>Olá, ${displayName}.</p><p>Detectamos a seguinte atividade na sua conta <strong>${EMAIL_CONFIG.companyName}</strong>:</p>
        <div style="background:${brand.surface};border:1px solid ${brand.border};border-radius:8px;padding:16px;margin:16px 0;">
          <div style="font-weight:600;color:${brand.primary};margin-bottom:8px;">${eventDescription}</div>
          <div style="font-size:13px;color:${brand.textMuted};">📅 ${when}${ip ? `<br/>🌐 IP: ${ip}` : ''}</div>
        </div>`,
      footerNote: 'Se essa atividade não foi realizada por você, altere sua senha imediatamente e entre em contato com o suporte.',
    }),
    text: `Alerta de segurança no ${EMAIL_CONFIG.companyName}: ${eventDescription} em ${when}.`,
  }),
};

export type EmailTemplateName = keyof typeof emailTemplates;
