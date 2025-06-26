import { login, register } from "../controllers/authController.ts";

export async function authRoutes(req: Request): Promise<Response | null> {
  const { method } = req;
  const pathname = new URL(req.url).pathname;

  if (method === "POST" && pathname === "/auth/login") return await login(req);
  if (method === "POST" && pathname === "/auth/register") return await register(req);

  return null;
}
