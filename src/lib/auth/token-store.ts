import { adminDB } from "../../../firebaseAdmin";
import { generateToken, hashToken } from "./tokens";

// Colecciones de tokens de un solo uso. El id de cada documento es el hash
// SHA-256 del token, así la búsqueda es O(1) y nunca se guarda el token en claro.
export const EMAIL_VERIFICATION = "emailVerificationTokens";
export const PASSWORD_RESET = "passwordResetTokens";

interface TokenData {
  userId: string;
  email: string;
  expires: number; // epoch ms
  used?: boolean;
}

// Crea un token, lo guarda hasheado con expiración y devuelve el valor en claro
// para incluirlo en el enlace del correo.
async function issueToken(
  collection: string,
  data: Omit<TokenData, "expires">,
  ttlMs: number,
): Promise<string> {
  const { raw, hash } = generateToken();
  await adminDB
    .collection(collection)
    .doc(hash)
    .set({ ...data, expires: Date.now() + ttlMs });
  return raw;
}

// Valida y consume (borra) un token. Devuelve sus datos o null si es inválido/expirado.
async function consumeToken(
  collection: string,
  raw: string,
): Promise<Omit<TokenData, "expires"> | null> {
  const hash = hashToken(raw);
  const ref = adminDB.collection(collection).doc(hash);
  const doc = await ref.get();

  if (!doc.exists) return null;

  const data = doc.data() as TokenData;

  // Un solo uso: se borra siempre que exista, esté o no vigente.
  await ref.delete();

  if (!data.expires || data.expires < Date.now()) return null;

  return { userId: data.userId, email: data.email };
}

// Canjea un token de verificación de correo de forma IDEMPOTENTE: en vez de
// borrarlo, lo marca como usado y lo conserva. Así, GETs repetidos al enlace
// (recargas de HMR, prefetch de clientes de correo/antivirus, refresh) siguen
// devolviendo éxito en lugar de "inválido o expiró".
async function redeemEmailVerificationToken(
  raw: string,
): Promise<Omit<TokenData, "expires" | "used"> | null> {
  const hash = hashToken(raw);
  const ref = adminDB.collection(EMAIL_VERIFICATION).doc(hash);
  const doc = await ref.get();

  if (!doc.exists) return null;

  const data = doc.data() as TokenData;

  // Ya usado: repetición idempotente, se considera éxito.
  if (data.used) return { userId: data.userId, email: data.email };

  // Expirado sin haberse usado: inválido; se borra.
  if (!data.expires || data.expires < Date.now()) {
    await ref.delete();
    return null;
  }

  await ref.update({ used: true });
  return { userId: data.userId, email: data.email };
}

const HOUR = 60 * 60 * 1000;

export const createEmailVerificationToken = (userId: string, email: string) =>
  issueToken(EMAIL_VERIFICATION, { userId, email }, 24 * HOUR);

export const verifyEmailToken = (raw: string) =>
  redeemEmailVerificationToken(raw);

export const createPasswordResetToken = (userId: string, email: string) =>
  issueToken(PASSWORD_RESET, { userId, email }, 1 * HOUR);

export const consumePasswordResetToken = (raw: string) =>
  consumeToken(PASSWORD_RESET, raw);
