import { v4 } from "uuid"

/** Gera UUID compatível com HTTP e HTTPS (substitui crypto.randomUUID) */
export const generateId = (): string => v4()
