import { AuthClient } from "@sharkauth/sdk";

const SHARK_BASE_URL = process.env.NEXT_PUBLIC_SHARK_URL || "http://localhost:3000/shark";

export const sharkAuth = new AuthClient(SHARK_BASE_URL);
