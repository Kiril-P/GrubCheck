import { biomePresets } from "@grubcheck/domain";
import { Hono } from "hono";

export const biomeRoutes = new Hono().get("/", (context) => context.json(biomePresets));

