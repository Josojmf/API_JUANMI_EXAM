import { usersCollection } from "../db/mongo.ts";
import { hash, compare, create, getNumericDate } from "../deps.ts";
import type { Jose } from "../deps.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "supersecretkey";

// Función para crear la clave crypto
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

export async function register(req: Request): Promise<Response> {
    try {
        const { email, password } = await req.json();
        const existing = await usersCollection.findOne({ email });
        if (existing) return new Response("Usuario ya existe", { status: 409 });

        const hashed = await hash(password);
        await usersCollection.insertOne({ email, password: hashed });

        return new Response("Usuario registrado", { status: 201 });
    } catch (error) {
        console.error("Error en register:", error);
        return new Response("Error interno del servidor", { status: 500 });
    }
}

export async function login(req: Request): Promise<Response> {
    try {
        const { email, password } = await req.json();
        const user = await usersCollection.findOne({ email });

        if (!user) return new Response("Usuario no encontrado", { status: 404 });

        const isValid = await compare(password, user.password);
        if (!isValid) return new Response("Credenciales inválidas", { status: 401 });

        const header: Jose = { alg: "HS256", typ: "JWT" };
        const payload = { email, exp: getNumericDate(60 * 60) };
        
        // Crear la clave crypto y usar en el JWT
        const cryptoKey = await getJWTKey();
        const jwt = await create(
            { alg: "HS256", typ: "JWT" },
            payload,
            cryptoKey  // ✅ Ahora es un CryptoKey
        );

        return new Response(JSON.stringify({ token: jwt }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error en login:", error);
        return new Response("Error interno del servidor", { status: 500 });
    }
}