const env = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  CLIENT_URL: import.meta.env.VITE_CLIENT_URL || "http://localhost:3000",
} as const;

export default env;
