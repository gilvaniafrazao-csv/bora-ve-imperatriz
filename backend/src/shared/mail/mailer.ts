import nodemailer, { Transporter } from 'nodemailer';
import { getMailConfig, MailConfig } from '../../config/env';

/*
 * A configuracao de e-mail so e lida na primeira vez que um e-mail e enviado,
 * e nao quando o backend inicia. Assim, a falta de SMTP em producao nao
 * derruba a API inteira (login, cadastro etc.): so o envio falha, e o erro
 * e registrado em log por quem chamou. Quando a configuracao existe, o
 * comportamento e o mesmo de antes: em desenvolvimento usa o Mailpit local
 * sem TLS; em producao exige TLS, credenciais e remetente.
 */
let mailer: { config: MailConfig; transporter: Transporter } | null = null;

function getMailer(): { config: MailConfig; transporter: Transporter } {
  if (!mailer) {
    const config = getMailConfig();
    mailer = {
      config,
      transporter: nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: config.requireTLS,
        ignoreTLS: config.ignoreTLS,
        auth: config.auth,
      }),
    };
  }
  return mailer;
}

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
  const { config, transporter } = getMailer();

  await transporter.sendMail({
    from: config.from,
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