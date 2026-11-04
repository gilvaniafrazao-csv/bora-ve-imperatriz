import { Request, Response } from 'express';
import { getPlaceDetails, searchPlaces } from './places.service';
import { parsePlaceId, parsePlaceSearchQuery } from './places.validation';

export async function listPlaces(req: Request, res: Response): Promise<void> {
  const input = parsePlaceSearchQuery(req.query as Record<string, unknown>);
  const result = await searchPlaces(input);
  res.status(200).json(result);
}

export async function showPlace(req: Request, res: Response): Promise<void> {
  const placeId = parsePlaceId(req.params.placeId);
  const place = await getPlaceDetails(placeId);
  res.status(200).json({ place });
}
