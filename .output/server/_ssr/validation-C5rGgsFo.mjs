//#region node_modules/.nitro/vite/services/ssr/assets/validation-C5rGgsFo.js
var COMMENT_MAX_LENGTH = 1e3;
function sanitizeCommentInput(value) {
	const trimmed = value.replace(/\s+/g, " ").trim();
	if (!trimmed) return null;
	return trimmed.slice(0, COMMENT_MAX_LENGTH);
}
function safeAuthRedirect(value) {
	if (!value) return "/";
	if (value.startsWith("/") && !value.startsWith("//")) return value;
	return "/";
}
//#endregion
export { safeAuthRedirect as n, sanitizeCommentInput as r, COMMENT_MAX_LENGTH as t };
