/**
 * Configuração centralizada de emails do IPPark.
 *
 * Enquanto não houver domínio próprio configurado, o sistema utiliza o
 * remetente padrão do provedor de autenticação. Quando o domínio for
 * adquirido e os registros SPF/DKIM/DMARC estiverem ativos, basta
 * atualizar `SENDER_DOMAIN` e `FROM_EMAIL` aqui — nenhum outro arquivo
 * precisa mudar.
 */

export const EMAIL_CONFIG = {
  // Identidade da empresa
  companyName: 'IPPARK',
  companyLegalName: 'IPPark Gestão Pública',
  supportEmail: 'suporte@ippark.com.br',

  // URLs do sistema (substitua pelo domínio final em produção)
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://ippark.com.br',
  logoUrl: '/logo-ippark.jpeg',

  // Remetentes — atualizar quando o domínio estiver verificado
  senderDomain: '', // ex.: 'notify.ippark.com.br'
  fromEmail: '', // ex.: 'no-reply@ippark.com.br'
  fromName: 'IPPARK',
  replyTo: '', // ex.: 'suporte@ippark.com.br'

  // Cores institucionais (usadas nos templates)
  brand: {
    primary: '#0B2E59',
    primaryDark: '#061a36',
    accent: '#1F6FB2',
    textBody: '#2d3748',
    textMuted: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
  },

  // Sinaliza se o domínio próprio já está ativo. Quando true, o sistema
  // passará a usar os templates customizados via `auth-email-hook`.
  customDomainActive: false,
} as const;

export type EmailConfig = typeof EMAIL_CONFIG;
