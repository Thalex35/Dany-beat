import { t as supabase } from "./client-B4XIc1gZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analytics-CloptECG.js
var SESSION_KEY = "db_session_id";
function sessionId() {
	if (typeof window === "undefined") return null;
	try {
		let id = window.localStorage.getItem(SESSION_KEY);
		if (!id) {
			id = crypto.randomUUID();
			window.localStorage.setItem(SESSION_KEY, id);
		}
		return id;
	} catch {
		return null;
	}
}
var sent = /* @__PURE__ */ new Set();
/**
* Fire-and-forget analytics. Never throws: a failed event must never break
* playback, likes or navigation.
*/
async function track(event, options = {}) {
	try {
		if (typeof window === "undefined") return;
		const key = `${event}:${options.beatId ?? "-"}`;
		if (options.once) {
			if (sent.has(key)) return;
			sent.add(key);
		}
		const { data } = await supabase.auth.getSession();
		await supabase.from("analytics_events").insert({
			event_type: event,
			beat_id: options.beatId ?? null,
			user_id: data.session?.user.id ?? null,
			session_id: sessionId()
		});
	} catch {}
}
//#endregion
export { track as t };
