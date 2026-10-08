import "server-only";
import {
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  localhostAllowedOrigins,
  originValidationResponse,
} from "@modelcontextprotocol/server";

/**
 * 403 unless Host is loopback and any Origin is loopback: blocks LAN callers,
 * cross-site forgery and DNS rebinding. Requests without Origin (MCP clients,
 * curl) pass.
 */
export function rejectNonLocalRequest(req: Request): Response | undefined {
  return (
    hostHeaderValidationResponse(req, localhostAllowedHostnames()) ??
    originValidationResponse(req, localhostAllowedOrigins())
  );
}
