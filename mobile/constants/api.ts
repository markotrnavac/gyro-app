// Set EXPO_PUBLIC_API_URL in a .env file to point at your running backend.
// Example:  EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
//
// When running on a real device, localhost won't work — use your machine's
// LAN IP address instead.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
