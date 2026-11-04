import { createHash } from 'node:crypto';
import http from 'node:http';
import { AddressInfo } from 'node:net';

/**
 * Supabase/PostgREST falso, em memória, só com o que as rotas de auth e
 * preferências usam. Permite testar a API de ponta a ponta sem banco real.
 * Falhas podem ser simuladas com `failNext`.
 */

export const CATEGORIES = ['sushi', 'pizza', 'hamburguer', 'bar', 'churrasco', 'doces'].map(
  (slug, i) => ({ id: `00000000-0000-0000-0000-00000000000${i + 1}`, slug }),
);

type UserRow = { id: string; name: string; email: string; password_hash: string; created_at: string };
type PreferencesRow = { price_range: string | null; updated_at: string };
type Link = { user_id: string; category_id: string };
type ResetTokenRow = {
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

const eq = (value: string | null) => (value ?? '').replace(/^(eq|ilike)\./, '');
const inList = (value: string | null) =>
  (value ?? '').replace(/^in\.\(/, '').replace(/\)$/, '').split(',').filter(Boolean);

export class FakeSupabase {
  users = new Map<string, UserRow>();
  preferences = new Map<string, PreferencesRow>();
  links: Link[] = [];
  resetTokens: ResetTokenRow[] = [];
  requests: string[] = [];
  /** `"METHOD tabela"` → próxima chamada responde 500 (uma vez). */
  private failures = new Set<string>();
  private server = http.createServer((req, res) => this.handle(req, res));
  private nextUser = 1;

  async start(): Promise<string> {
    await new Promise<void>((resolve) => this.server.listen(0, '127.0.0.1', resolve));
    return `http://127.0.0.1:${(this.server.address() as AddressInfo).port}`;
  }

  stop(): Promise<void> {
    return new Promise((resolve) => this.server.close(() => resolve()));
  }

  reset(): void {
    this.users.clear();
    this.preferences.clear();
    this.links = [];
    this.resetTokens = [];
    this.requests = [];
    this.failures.clear();
  }

  failNext(method: string, table: string): void {
    this.failures.add(`${method} ${table}`);
  }

  addUser(id: string): void {
    this.users.set(id, {
      id,
      name: 'Teste',
      email: `${id}@example.com`,
      password_hash: 'x',
      created_at: new Date().toISOString(),
    });
  }

  /** Grava um token de recuperação direto no "banco" (só o hash, como a API faz). */
  addResetToken(
    userId: string,
    token: string,
    options: { expiresAt?: Date; usedAt?: Date } = {},
  ): void {
    this.resetTokens.push({
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: (options.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000)).toISOString(),
      used_at: options.usedAt?.toISOString() ?? null,
      created_at: new Date().toISOString(),
    });
  }

  slugsOf(userId: string): string[] {
    return this.links
      .filter((link) => link.user_id === userId)
      .map((link) => CATEGORIES.find((c) => c.id === link.category_id)?.slug as string)
      .sort();
  }

  private handle(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url ?? '/', 'http://fake');
    const table = url.pathname.replace('/rest/v1/', '');
    const method = req.method ?? 'GET';
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : null;
      const wantsObject = (req.headers.accept ?? '').includes('vnd.pgrst.object');
      const send = (status: number, data: unknown) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(status === 204 ? undefined : JSON.stringify(data));
      };
      this.requests.push(`${method} ${table}`);

      if (this.failures.delete(`${method} ${table}`)) {
        return send(500, { code: 'XX000', message: 'falha simulada' });
      }

      const q = url.searchParams;
      switch (`${method} ${table}`) {
        case 'GET categories': {
          const slugs = inList(q.get('slug'));
          return send(200, CATEGORIES.filter((c) => slugs.includes(c.slug)));
        }
        case 'GET users': {
          const email = eq(q.get('email')).toLowerCase();
          const found = [...this.users.values()].filter((u) => u.email.toLowerCase() === email);
          return send(200, found);
        }
        case 'POST users': {
          const id = `22222222-2222-2222-2222-${String(this.nextUser++).padStart(12, '0')}`;
          const row: UserRow = { id, created_at: new Date().toISOString(), ...body };
          this.users.set(id, row);
          return send(201, wantsObject ? row : [row]);
        }
        case 'DELETE users': {
          this.users.delete(eq(q.get('id')));
          return send(204, null);
        }
        case 'GET user_preferences': {
          const row = this.preferences.get(eq(q.get('user_id')));
          return send(200, row ? [row] : []);
        }
        case 'POST user_preferences': {
          if (!this.users.has(body.user_id)) {
            return send(409, { code: '23503', message: 'violates foreign key constraint' });
          }
          const previous = this.preferences.get(body.user_id);
          const ignoreDuplicates = String(req.headers.prefer ?? '').includes('ignore-duplicates');
          if (!(previous && ignoreDuplicates)) {
            this.preferences.set(body.user_id, {
              price_range: 'price_range' in body ? body.price_range : (previous?.price_range ?? null),
              updated_at: new Date().toISOString(),
            });
          }
          return send(201, []);
        }
        case 'POST rpc/replace_user_preferences': {
          // Imita a função SQL: valida tudo antes de gravar (tudo ou nada) e
          // sempre atualiza updated_at, inclusive quando só as categorias mudam.
          const { p_user_id, p_category_ids, p_set_price_range, p_price_range } = body;
          const invalid =
            !this.users.has(p_user_id) ||
            p_category_ids.some((id: string) => !CATEGORIES.some((c) => c.id === id));
          if (invalid) {
            return send(409, { code: '23503', message: 'violates foreign key constraint' });
          }
          const previous = this.preferences.get(p_user_id);
          this.preferences.set(p_user_id, {
            price_range: p_set_price_range ? p_price_range : (previous?.price_range ?? null),
            updated_at: new Date().toISOString(),
          });
          this.links = this.links.filter(
            (link) => link.user_id !== p_user_id || p_category_ids.includes(link.category_id),
          );
          for (const id of p_category_ids as string[]) {
            if (!this.links.some((l) => l.user_id === p_user_id && l.category_id === id)) {
              this.links.push({ user_id: p_user_id, category_id: id });
            }
          }
          return send(204, null);
        }
        case 'GET user_preference_categories': {
          const userId = eq(q.get('user_id'));
          return send(
            200,
            this.links
              .filter((link) => link.user_id === userId)
              .map((link) => ({
                category_id: link.category_id,
                category: { slug: CATEGORIES.find((c) => c.id === link.category_id)?.slug },
              })),
          );
        }
        case 'POST user_preference_categories': {
          this.links.push(...body);
          return send(201, []);
        }
        case 'DELETE user_preference_categories': {
          const userId = eq(q.get('user_id'));
          const ids = inList(q.get('category_id'));
          this.links = this.links.filter(
            (link) => !(link.user_id === userId && ids.includes(link.category_id)),
          );
          return send(204, null);
        }
        case 'GET password_reset_tokens': {
          const userId = eq(q.get('user_id'));
          const latest = this.resetTokens
            .filter((row) => row.user_id === userId)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, 1);
          return send(200, latest);
        }
        case 'POST password_reset_tokens': {
          this.resetTokens.push({ used_at: null, created_at: new Date().toISOString(), ...body });
          return send(201, []);
        }
        case 'PATCH password_reset_tokens': {
          const userId = q.get('user_id');
          const tokenHash = q.get('token_hash');
          for (const row of this.resetTokens) {
            const matches =
              row.used_at === null &&
              (userId === null || row.user_id === eq(userId)) &&
              (tokenHash === null || row.token_hash === eq(tokenHash));
            if (matches) {
              row.used_at = body.used_at;
            }
          }
          return send(204, null);
        }
        case 'POST rpc/reset_password_with_token': {
          // Imita a função SQL: consome o token e troca a senha juntos.
          const now = new Date().toISOString();
          const row = this.resetTokens.find(
            (r) => r.token_hash === body.p_token_hash && r.used_at === null && r.expires_at > now,
          );
          if (!row) {
            return send(200, null);
          }
          const user = this.users.get(row.user_id);
          if (user) {
            user.password_hash = body.p_password_hash;
          }
          for (const r of this.resetTokens) {
            if (r.user_id === row.user_id && r.used_at === null) {
              r.used_at = now;
            }
          }
          return send(200, row.user_id);
        }
        default:
          return send(404, { message: `fake: rota não tratada ${method} ${table}` });
      }
    });
  }
}
