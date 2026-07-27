const isServer = typeof window === "undefined";

const env = {
  API_URL: isServer
    ? process.env.API_INTERNAL_URL || "http://localhost:4000/api/v1"
    : process.env.NEXT_PUBLIC_API_URL || "/api/v1",
} as const;

export default env;
