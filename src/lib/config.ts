function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const NEXTAUTH_SECRET = requireEnv("NEXTAUTH_SECRET");
export const SECRET_BYTES = new TextEncoder().encode(NEXTAUTH_SECRET);
