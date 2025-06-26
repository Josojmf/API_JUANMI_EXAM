import { serve } from "$deps";
import { authRoutes } from "./routes/authRoutes.ts";
import { videoRoutes } from "./routes/videoRoutes.ts";

console.log("🚀 API escuchando en http://localhost:3000");

serve(async (req) => {
  const auth = await authRoutes(req);
  if (auth) return auth;

  const video = await videoRoutes(req);
  if (video) return video;

  return new Response("🔴 Ruta no encontrada", { status: 404 });
}, { port: 3000 });
