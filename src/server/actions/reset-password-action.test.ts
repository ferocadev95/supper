import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../lib/auth/token-store", () => ({
  consumePasswordResetToken: vi.fn(),
}));
vi.mock("../../lib/auth/users", () => ({ setUserPassword: vi.fn() }));

import { resetPassword } from "./reset-password-action";
import { consumePasswordResetToken } from "../../lib/auth/token-store";
import { setUserPassword } from "../../lib/auth/users";

const consumeMock = vi.mocked(consumePasswordResetToken);
const setPasswordMock = vi.mocked(setUserPassword);

const INITIAL = { success: "", error: "" };

const formOf = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

const validForm = {
  token: "raw-token",
  password: "NewSecret123",
  confirmPassword: "NewSecret123",
};

describe("resetPassword action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setPasswordMock.mockResolvedValue(undefined);
  });

  it("rejects an invalid or expired token", async () => {
    consumeMock.mockResolvedValue(null);
    const res = await resetPassword(INITIAL, formOf(validForm));
    expect(res.error).toMatch(/inválido o expiró/i);
    expect(setPasswordMock).not.toHaveBeenCalled();
  });

  it("rejects a weak password before touching the token", async () => {
    const res = await resetPassword(
      INITIAL,
      formOf({ ...validForm, password: "weak", confirmPassword: "weak" })
    );
    expect(res.error).toBeTruthy();
    expect(consumeMock).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const res = await resetPassword(
      INITIAL,
      formOf({ ...validForm, confirmPassword: "Other123" })
    );
    expect(res.error).toMatch(/no coinciden/i);
    expect(consumeMock).not.toHaveBeenCalled();
  });

  it("updates the password with a valid token", async () => {
    consumeMock.mockResolvedValue({ userId: "u1", email: "ana@mail.com" });
    const res = await resetPassword(INITIAL, formOf(validForm));
    expect(setPasswordMock).toHaveBeenCalledOnce();
    expect(setPasswordMock.mock.calls[0][0]).toBe("u1");
    expect(res.success).toBeTruthy();
    expect(res.error).toBe("");
  });
});
