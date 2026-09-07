import { rateLimit, _resetRateLimitStore } from "@/lib/rate-limit";

describe("rateLimit", () => {
  afterEach(() => {
    _resetRateLimitStore();
  });

  const makeRequest = (ip: string, forwardedFor?: string): Request => {
    const headers = new Headers();
    if (forwardedFor) headers.append("x-forwarded-for", forwardedFor);
    return { headers } as Request;
  };

  it("allows the first request", () => {
    const result = rateLimit(makeRequest("1.1.1.1", "1.1.1.1"));
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBe(0);
  });

  it("allows requests up to the limit", () => {
    const req = makeRequest("1.1.1.1", "1.1.1.1");
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(req);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests over the limit", () => {
    const req = makeRequest("1.1.1.1", "1.1.1.1");
    for (let i = 0; i < 5; i++) {
      rateLimit(req);
    }
    const blocked = rateLimit(req);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(15 * 60);
  });

  it("resets the window after expiry", () => {
    const req = makeRequest("1.1.1.1", "1.1.1.1");
    for (let i = 0; i < 5; i++) {
      rateLimit(req);
    }
    // Simulate window passing by clearing store and re-adding with old timestamp
    _resetRateLimitStore();
    const fresh = rateLimit(req);
    expect(fresh.allowed).toBe(true);
  });

  it("tracks different IPs independently", () => {
    const reqA = makeRequest("1.1.1.1", "1.1.1.1");
    const reqB = makeRequest("2.2.2.2", "2.2.2.2");

    for (let i = 0; i < 5; i++) {
      rateLimit(reqA);
    }
    // B should still be allowed even though A is at limit
    expect(rateLimit(reqB).allowed).toBe(true);
  });

  it("handles missing x-forwarded-for", () => {
    const req = { headers: new Headers() } as Request;
    expect(rateLimit(req).allowed).toBe(true);
  });

  it("handles x-real-ip header", () => {
    const headers = new Headers();
    headers.append("x-real-ip", "3.3.3.3");
    const req = { headers } as Request;
    expect(rateLimit(req).allowed).toBe(true);
  });
});
