import { describe, it, expect, vi, beforeEach } from "vitest";

// Estos módulos importan firebaseAdmin/Resend (evalúan env al cargar), así que
// se mockean por completo, igual que en CartSync.test.tsx.
vi.mock("../../lib/auth/users", () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));
vi.mock("../../lib/auth/token-store", () => ({
  createEmailVerificationToken: vi.fn(),
}));
vi.mock("../../lib/send-email", () => ({
  sendVerificationEmail: vi.fn(),
}));

import { register } from "./register-action";
import { getUserByEmail, createUser } from "../../lib/auth/users";
import { createEmailVerificationToken } from "../../lib/auth/token-store";
import { sendVerificationEmail } from "../../lib/send-email";

const getUserByEmailMock = vi.mocked(getUserByEmail);
const createUserMock = vi.mocked(createUser);
const createTokenMock = vi.mocked(createEmailVerificationToken);
const sendEmailMock = vi.mocked(sendVerificationEmail);

const INITIAL = { success: "", error: "" };

const formOf = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

const validForm = {
  name: "Ana",
  email: "ana@mail.com",
  password: "Secret123",
  confirmPassword: "Secret123",
};

describe("register action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createUserMock.mockResolvedValue({ id: "u1", email: "ana@mail.com" });
    createTokenMock.mockResolvedValue("raw-token");
    sendEmailMock.mockResolvedValue(undefined);
  });

  it("rejects a weak password without creating a user", async () => {
    const res = await register(
      INITIAL,
      formOf({ ...validForm, password: "weak", confirmPassword: "weak" })
    );
    expect(res.error).toBeTruthy();
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const res = await register(
      INITIAL,
      formOf({ ...validForm, confirmPassword: "Different123" })
    );
    expect(res.error).toMatch(/no coinciden/i);
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("rejects an already registered email", async () => {
    getUserByEmailMock.mockResolvedValue({ id: "x", email: "ana@mail.com" });
    const res = await register(INITIAL, formOf(validForm));
    expect(res.error).toMatch(/ya está registrado/i);
    expect(createUserMock).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("creates the user and sends a verification email on success", async () => {
    getUserByEmailMock.mockResolvedValue(null);
    const res = await register(INITIAL, formOf(validForm));

    expect(createUserMock).toHaveBeenCalledOnce();
    expect(createTokenMock).toHaveBeenCalledWith("u1", "ana@mail.com");
    expect(sendEmailMock).toHaveBeenCalledWith("ana@mail.com", "raw-token");
    expect(res.success).toBeTruthy();
    expect(res.error).toBe("");
  });
});
