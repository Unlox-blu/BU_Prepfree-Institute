export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`
    : process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined in production!");
      })()
    : "http://localhost:1995/api/v1";