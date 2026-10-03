import { Request, Response } from 'express';
import { getAuthenticatedUserId } from '../../shared/http/requireAuth';
import { getUserPreferences, updateUserPreferences } from './preferences.service';

export async function getPreferences(_req: Request, res: Response): Promise<void> {
  const preferences = await getUserPreferences(getAuthenticatedUserId(res));
  res.status(200).json({ preferences });
}

export async function putPreferences(req: Request, res: Response): Promise<void> {
  const preferences = await updateUserPreferences(getAuthenticatedUserId(res), req.body);
  res.status(200).json({
    message: 'Preferências salvas com sucesso.',
    preferences,
  });
}
