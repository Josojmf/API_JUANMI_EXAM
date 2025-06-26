// deps.ts - Versión alternativa con versiones más estables
export { serve } from "https://deno.land/std@0.204.0/http/server.ts";

// MongoDB - Versión anterior estable
export { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

// JWT - Versión anterior compatible
export { create, verify, getNumericDate } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
export type { Jose } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

// Bcrypt
export { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";