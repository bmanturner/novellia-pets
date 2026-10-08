import "server-only";
import {
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  originValidationResponse,
} from "@modelcontextprotocol/server";

/**
 * Hostnames this app answers to: loopback, plus on Vercel the deployment,
 * branch and production domains (system env vars, hostnames without scheme).
 */
function allowedHostnames(): string[] {
  const vercelHosts = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].filter((host): host is string => Boolean(host));
  return [...localhostAllowedHostnames(), ...vercelHosts];
}

/**
 * 403 unless Host and any Origin are one of this app's hostnames: blocks
 * cross-site forgery and DNS rebinding. Requests without Origin (MCP clients,
 * curl) pass.
 */
export function rejectForeignRequest(req: Request): Response | undefined {
  const hostnames = allowedHostnames();
  return (
    hostHeaderValidationResponse(req, hostnames) ??
    originValidationResponse(req, hostnames)
  );
}
