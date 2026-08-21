/** The storage form of an address - always normalize before lookup or write. */
export const normalizeEmail = (email: string) => email.trim().toLowerCase()
