import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../lib/auth/users", () => ({ getUserByEmail: vi.fn() }));
vi.mock("../../lib/auth/token-store", () => ({
  createPasswordResetToken: vi.fn(),
}));
vi.mock("../../lib/send-email", () => ({ sendPasswordResetEmail: vi.fn() }));

import { requestPasswordReset } from "./request-password-reset-action";
import { getUserByEmail } from "../../lib/auth/users";
import { createPasswordResetToken } from "../../lib/auth/token-store";
import { sendPasswordResetEmail } from "../../lib/send-email";

const getUserByEmailMock = vi.mocked(getUserByEmail);
const createTokenMock = vi.mocked(createPasswordResetToken);
const sendEmailMock = vi.mocked(sendPasswordResetEmail);

const INITIAL = { success: "", error: "" };

const formOf = (email: string) => {
  const fd = new FormData();
  fd.set("email", email);
  return fd;
};

describe("requestPasswordReset action (anti-enumeración)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTokenMock.mockResolvedValue("raw-token");
    sendEmailMock.mockResolvedValue(undefined);
  });

  it("returns the generic success even when the email does not exist", async () => {
    getUserByEmailMock.mockResolvedValue(null);
    const res = await requestPasswordReset(INITIAL, formOf("nadie@mail.com"));
    expect(res.success).toBeTruthy();
    expect(res.error).toBe("");
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("returns the same generic success and sends the email when the user exists", async () => {
    getUserByEmailMock.mockResolvedValue({
      id: "u1",
      email: "ana@mail.com",
      hashedPassword: "hash",
    });
    const res = await requestPasswordReset(INITIAL, formOf("ana@mail.com"));
    expect(res.success).toBeTruthy();
    expect(sendEmailMock).toHaveBeenCalledWith("ana@mail.com", "raw-token");
  });

  it("does not send an email to accounts without a password (e.g. Google)", async () => {
    getUserByEmailMock.mockResolvedValue({
      id: "u1",
      email: "ana@mail.com",
      hashedPassword: null,
    });
    const res = await requestPasswordReset(INITIAL, formOf("ana@mail.com"));
    expect(res.success).toBeTruthy();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid email format", async () => {
    const res = await requestPasswordReset(INITIAL, formOf("not-an-email"));
    expect(res.error).toBeTruthy();
    expect(getUserByEmailMock).not.toHaveBeenCalled();
  });
});
