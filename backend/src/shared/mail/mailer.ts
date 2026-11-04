import nodemailer from 'nodemailer';
import { getMailConfig } from '../../config/env';

/*
 * A configuracao vem de getMailConfig(): em desenvolvimento usa o Mailpit
 * local (sem TLS); em producao exige TLS, credenciais e remetente por
 * variaveis de ambiente. Se faltar alguma em producao, o servidor nem sobe.
 */
const mailConfig = getMailConfig();

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure,
  requireTLS: mailConfig.requireTLS,
  ignoreTLS: mailConfig.ignoreTLS,
  auth: mailConfig.auth,
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  link: string,
): Promise<void> {
  await transporter.sendMail({
    from: mailConfig.from,
    to,
    subject: 'Recuperação de senha - Bora Vê',
    text:
      `Olá, ${name}.\n\n` +
      `Recebemos um pedido para redefinir a sua senha. Abra o link abaixo (válido por 1 hora):\n\n` +
      `${link}\n\n` +
      `Se você não fez esse pedido, ignore este e-mail.`,
    html:
      `<p>Olá, ${escapeHtml(name)}.</p>` +
      `<p>Recebemos um pedido para redefinir a sua senha. O link abaixo é válido por 1 hora:</p>` +
      `<p><a href="${link}">Redefinir minha senha</a></p>` +
      `<p>Se você não fez esse pedido, ignore este e-mail.</p>`,
  });
}