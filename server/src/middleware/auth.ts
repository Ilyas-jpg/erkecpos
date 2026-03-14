import { Context, Next } from "hono";

// Simple auth middleware - checks for Bearer token
// For production, use proper JWT verification
export async function authMiddleware(c: Context, next: Next) {
  // Skip auth for health check
  if (c.req.path === "/api/health") {
    return next();
  }

  // For now, accept any request (auth can be enabled later)
  // TODO: Implement JWT verification
  return next();
}
