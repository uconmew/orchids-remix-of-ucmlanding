import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth.handler);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';