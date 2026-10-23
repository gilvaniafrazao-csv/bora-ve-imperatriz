import nodemailer from 'nodemailer';
import { env } from '../../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: false,
  ignoreTLS: true,
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
    from: env.mailFrom,
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