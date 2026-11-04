import net from 'node:net';
import { AddressInfo } from 'node:net';

/**
 * Servidor SMTP falso, em memória, com o mínimo do protocolo que o
 * nodemailer usa (sem TLS e sem autenticação, como o Mailpit local).
 * Guarda as mensagens recebidas; falhas de envio podem ser simuladas com
 * `failNext`.
 */

export type SentMail = { to: string[]; raw: string };

export class FakeSmtp {
  messages: SentMail[] = [];
  private failNextSend = false;
  private sockets = new Set<net.Socket>();
  private server = net.createServer((socket) => this.handle(socket));

  async start(): Promise<{ host: string; port: number }> {
    await new Promise<void>((resolve) => this.server.listen(0, '127.0.0.1', resolve));
    return { host: '127.0.0.1', port: (this.server.address() as AddressInfo).port };
  }

  stop(): Promise<void> {
    for (const socket of this.sockets) {
      socket.destroy();
    }
    return new Promise((resolve) => this.server.close(() => resolve()));
  }

  reset(): void {
    this.messages = [];
    this.failNextSend = false;
  }

  /** O próximo envio é recusado pelo servidor (uma vez). */
  failNext(): void {
    this.failNextSend = true;
  }

  /** Texto da mensagem com o quoted-printable desfeito (para achar o link). */
  static decode(raw: string): string {
    return raw
      .replace(/=\r\n/g, '')
      .replace(/=([0-9A-F]{2})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
  }

  private handle(socket: net.Socket): void {
    this.sockets.add(socket);
    socket.on('close', () => this.sockets.delete(socket));

    let buffer = '';
    let inData = false;
    let data: string[] = [];
    let to: string[] = [];
    const reply = (line: string) => socket.write(`${line}\r\n`);

    reply('220 fake-smtp');
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      let index: number;
      while ((index = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);

        if (inData) {
          if (line === '.') {
            inData = false;
            this.messages.push({ to, raw: data.join('\r\n') });
            reply('250 OK');
          } else {
            data.push(line.startsWith('..') ? line.slice(1) : line);
          }
          continue;
        }

        const command = line.slice(0, 4).toUpperCase();
        if (command === 'EHLO' || command === 'HELO') {
          reply('250 fake-smtp');
        } else if (command === 'MAIL') {
          if (this.failNextSend) {
            this.failNextSend = false;
            reply('554 falha simulada');
          } else {
            to = [];
            reply('250 OK');
          }
        } else if (command === 'RCPT') {
          to.push(line.replace(/^RCPT TO:\s*<?([^>]*)>?.*$/i, '$1'));
          reply('250 OK');
        } else if (command === 'DATA') {
          inData = true;
          data = [];
          reply('354 fim com <CRLF>.<CRLF>');
        } else if (command === 'QUIT') {
          reply('221 tchau');
          socket.end();
        } else {
          reply('250 OK');
        }
      }
    });
  }
}
