import { randomBytes, createHash } from "crypto";

// Genera un token de un solo uso. `raw` viaja en el enlace del correo; en la
// base de datos solo se guarda `hash`, de modo que una fuga de la BD no expone
// tokens utilizables.
export function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
