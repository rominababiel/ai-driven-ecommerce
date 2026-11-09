export function isAdminEmail(email: string | undefined, adminEmails: readonly string[]): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return adminEmails.some((admin) => admin.trim().toLowerCase() === normalized);
}
