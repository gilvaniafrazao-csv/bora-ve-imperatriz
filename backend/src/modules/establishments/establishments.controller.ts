import { Request, Response } from 'express';
import { getEstablishmentDetails } from './establishments.service';

export async function getEstablishment(req: Request, res: Response): Promise<void> {
  const establishment = await getEstablishmentDetails(req.params.id);
  res.status(200).json({ establishment });
}