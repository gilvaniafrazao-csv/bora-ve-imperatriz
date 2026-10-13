import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/http/requireAuth";
import { getRecommendations } from "./recommendations.service";

export async function listRecommendations(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const recommendations = await getRecommendations(req.userId as string);

  res.status(200).json({
    recommendations,
  });
}
