import { createHmac, timingSafeEqual } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { AppError } from "../errors/AppError";

interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

function unauthorized(): AppError {
  return new AppError("Você precisa estar autenticado.", 401, "UNAUTHORIZED");
}

function verifyToken(token: string): TokenPayload {
  if (!env.jwtSecret) {
    throw new AppError(
      "Não foi possível validar a autenticação.",
      503,
      "AUTH_MISCONFIGURED",
    );
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    throw unauthorized();
  }

  const [header, payload, signature] = parts;

  const expectedSignature = createHmac("sha256", env.jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw unauthorized();
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as TokenPayload;

    const now = Math.floor(Date.now() / 1000);

    if (!decoded.sub || !decoded.exp || decoded.exp <= now) {
      throw unauthorized();
    }

    return decoded;
  } catch {
    throw unauthorized();
  }
}

export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw unauthorized();
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw unauthorized();
  }

  const payload = verifyToken(token);

  req.userId = payload.sub;

  next();
}
