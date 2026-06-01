/** GET, POST /api/auth/* — обработчики NextAuth (вход, сессия, OAuth) */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
