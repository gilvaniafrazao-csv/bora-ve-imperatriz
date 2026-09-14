import { Request, Response } from 'express';
import { registerUser } from './auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  const user = await registerUser(req.body);
  res.status(201).json({
    message: 'Conta criada com sucesso.',
    user,
  });
}
