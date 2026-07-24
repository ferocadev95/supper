import { adminDB } from "../../../firebaseAdmin";

// Usuarios se almacenan en la colección `users` (la misma que usa el
// FirestoreAdapter de Auth.js), de modo que las cuentas de Google y las de
// correo/contraseña conviven en un solo lugar.
const USERS = "users";

export interface AppUser {
  id: string;
  name?: string | null;
  email: string;
  hashedPassword?: string | null;
  // El adaptador guarda `emailVerified` como Timestamp; para credenciales lo
  // guardamos como Date. Aquí solo nos interesa distinguir null vs. con valor.
  emailVerified?: unknown | null;
  image?: string | null;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const snap = await adminDB
    .collection(USERS)
    .where("email", "==", normalizeEmail(email))
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<AppUser, "id">) };
}

export async function createUser(input: {
  name: string;
  email: string;
  hashedPassword: string;
}): Promise<AppUser> {
  const email = normalizeEmail(input.email);
  const data = {
    name: input.name,
    email,
    hashedPassword: input.hashedPassword,
    emailVerified: null,
    image: null,
  };
  const ref = await adminDB.collection(USERS).add(data);
  return { id: ref.id, ...data };
}

export async function setUserPassword(
  id: string,
  hashedPassword: string,
): Promise<void> {
  await adminDB.collection(USERS).doc(id).update({ hashedPassword });
}

export async function markEmailVerified(id: string): Promise<void> {
  await adminDB
    .collection(USERS)
    .doc(id)
    .update({ emailVerified: new Date() });
}
