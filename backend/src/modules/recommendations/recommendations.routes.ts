import { Router } from "express";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { requireAuth } from "../../shared/http/requireAuth";
import { listRecommendations } from "./recommendations.controller";

export const recommendationsRouter = Router();

recommendationsRouter.get("/", requireAuth, asyncHandler(listRecommendations));
