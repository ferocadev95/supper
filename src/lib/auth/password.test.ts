import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("Secret123");
    expect(await verifyPassword("Secret123", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Secret123");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("produces different hashes for the same password (salt)", async () => {
    const a = await hashPassword("Secret123");
    const b = await hashPassword("Secret123");
    expect(a).not.toBe(b);
    // ...pero ambos verifican
    expect(await verifyPassword("Secret123", a)).toBe(true);
    expect(await verifyPassword("Secret123", b)).toBe(true);
  });

  it("never stores the plaintext in the hash", async () => {
    const hash = await hashPassword("Secret123");
    expect(hash).not.toContain("Secret123");
  });
});
