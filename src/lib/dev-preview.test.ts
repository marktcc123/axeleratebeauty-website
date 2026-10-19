import { afterEach, describe, expect, it } from "vitest";
import { isDevPreviewEnabled, isLocalPreviewHost } from "./dev-preview";

const original = { ...process.env };

afterEach(() => {
  process.env.NODE_ENV = original.NODE_ENV;
  process.env.DEV_PREVIEW_AUTH = original.DEV_PREVIEW_AUTH;
  process.env.VERCEL_ENV = original.VERCEL_ENV;
});

describe("local preview switch", () => {
  it("only treats localhost addresses as preview hosts", () => {
    expect(isLocalPreviewHost("localhost:3000")).toBe(true);
    expect(isLocalPreviewHost("127.0.0.1")).toBe(true);
    expect(isLocalPreviewHost("dermabell-us.com")).toBe(false);
    expect(isLocalPreviewHost(null)).toBe(false);
  });

  it("stays off in production even if the env flag is set", () => {
    process.env.NODE_ENV = "production";
    process.env.DEV_PREVIEW_AUTH = "true";
    delete process.env.VERCEL_ENV;
    expect(isDevPreviewEnabled("localhost")).toBe(false);
  });

  it("turns on only for local development with the explicit flag", () => {
    process.env.NODE_ENV = "development";
    process.env.DEV_PREVIEW_AUTH = "true";
    delete process.env.VERCEL_ENV;
    expect(isDevPreviewEnabled("localhost")).toBe(true);
    expect(isDevPreviewEnabled("example.com")).toBe(false);
  });
});
