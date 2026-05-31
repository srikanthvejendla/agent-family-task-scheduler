import { describe, it, expect } from "vitest";

describe("Health endpoint", () => {
  it("returns expected shape", async () => {
    // This will be a placeholder until we have the real endpoint
    const mockResponse = { status: "ok", db: "unchecked" };

    expect(mockResponse).toHaveProperty("status");
    expect(mockResponse.status).toBe("ok");
    expect(mockResponse).toHaveProperty("db");
  });
});
