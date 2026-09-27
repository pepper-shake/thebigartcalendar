import type { NextConfig } from "next";

// One canonical host for search engines. The production deployment is also
// reachable at the Vercel default domain and at www; 308-redirect both to the
// apex so crawlers index a single copy. Preview deployments (other *.vercel.app
// hosts) and localhost are unaffected — `has.host` is an exact match.
const CANONICAL_ORIGIN = "https://thebigartcalendar.com";
const ALIAS_HOSTS = ["thebigartcalendar.vercel.app", "www.thebigartcalendar.com"];

const nextConfig: NextConfig = {
  async redirects() {
    return ALIAS_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${CANONICAL_ORIGIN}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
