export const COMMENT_MAX_LENGTH = 1000;

export function sanitizeCommentInput(value: string): string | null {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  return trimmed.slice(0, COMMENT_MAX_LENGTH);
}

export function safeAuthRedirect(value: string | undefined): string {
  if (!value) return "/";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}
