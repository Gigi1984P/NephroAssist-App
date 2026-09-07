import { GET, POST } from "@/app/api/appointments/route";

// Mock auth
const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

// Mock Prisma
const mockFindFirst = jest.fn();
const mockFindMany = jest.fn();
const mockCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    patient: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    organizationMembership: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    appointment: {
      findMany: (...args: any[]) => mockFindMany(...args),
      create: (...args: any[]) => mockCreate(...args),
    },
    patientCase: { findFirst: (...args: any[]) => mockFindFirst(...args) },
    auditLog: { create: jest.fn() },
  },
}));

// Mock audit log
jest.mock("@/lib/audit", () => ({
  logAuditEvent: jest.fn().mockResolvedValue(undefined),
}));

describe("GET /api/appointments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Nicht autorisiert");
  });

  it("returns 403 for disallowed roles", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.de", role: "UNKNOWN" } });
    const res = await GET();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Zugriff verweigert");
  });

  it("returns appointments for PATIENT role filtered by own patient record", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.de", role: "PATIENT" } });
    mockFindFirst.mockResolvedValueOnce({ id: "p1" });
    mockFindMany.mockResolvedValue([{ id: "a1", type: "Checkup" }]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.appointments).toHaveLength(1);
    expect(body.appointments[0].type).toBe("Checkup");
  });

  it("returns appointments for clinic roles filtered by organization", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u2", email: "b@b.de", role: "ADMIN" } });
    mockFindFirst.mockResolvedValueOnce({ organizationId: "o1" });
    mockFindMany.mockResolvedValue([{ id: "a2", type: "Surgery" }]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.appointments).toHaveLength(1);
  });

  it("returns empty array when no patient record found for PATIENT", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.de", role: "PATIENT" } });
    mockFindFirst.mockResolvedValueOnce(null);
    mockFindMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.appointments).toEqual([]);
  });
});

describe("POST /api/appointments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request("http://localhost/api/appointments", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 on Zod validation error", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.de", role: "ADMIN" } });
    const req = new Request("http://localhost/api/appointments", {
      method: "POST",
      body: JSON.stringify({ type: "" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 404 when no active patient case found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.de", role: "ADMIN" } });
    mockFindFirst.mockResolvedValueOnce(null); // no patient case

    const body = {
      patientId: "11111111-1111-1111-1111-111111111111",
      type: "Checkup",
      startTime: new Date().toISOString(),
    };
    const req = new Request("http://localhost/api/appointments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Kein aktiver Fall gefunden");
  });

  it("creates an appointment successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "a@b.de", role: "ADMIN" } });
    mockFindFirst.mockResolvedValueOnce({ id: "c1", organizationId: "o1" });
    mockCreate.mockResolvedValue({ id: "a1", type: "Checkup" });

    const body = {
      patientId: "11111111-1111-1111-1111-111111111111",
      type: "Checkup",
      startTime: new Date().toISOString(),
    };
    const req = new Request("http://localhost/api/appointments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.appointment.id).toBe("a1");
  });
});
