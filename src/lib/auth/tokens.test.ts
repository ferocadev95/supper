import { describe, it, expect } from "vitest";
import { generateToken, hashToken } from "./tokens";

describe("token utilities", () => {
  it("hashes the raw token deterministically", () => {
    const { raw, hash } = generateToken();
    expect(hashToken(raw)).toBe(hash);
  });

  it("does not expose the raw token in its hash", () => {
    const { raw, hash } = generateToken();
    expect(hash).not.toBe(raw);
    expect(hash).toHaveLength(64); // sha256 hex
  });

  it("produces a unique raw token each time", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a.raw).not.toBe(b.raw);
    expect(a.hash).not.toBe(b.hash);
  });
});
