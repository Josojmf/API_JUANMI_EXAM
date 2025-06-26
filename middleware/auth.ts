import { verify } from "../deps.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "supersecretkey";

// Función para crear la clave crypto (igual que en authController)
async function getJWTKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);
    return await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

// Interfaz para el tipo de retorno
interface AuthResult {
  email: string;
  exp: number;
}

export async function isAuthenticated(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  try {
    const cryptoKey = await getJWTKey();
    const payload = await verify(token, cryptoKey, "HS256") as any;
    
    // Verificar que el token no haya expirado
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expirado
    }
    
    return {
      email: payload.email,
      exp: payload.exp
    };
  } catch (error) {
    console.error("Error al verificar token:", error);
    return null;
  }
}