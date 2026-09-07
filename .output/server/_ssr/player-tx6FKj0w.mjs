import { n as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as signedUrl } from "./media-C1QoYJjN.mjs";
import { t as track } from "./analytics-CloptECG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-tx6FKj0w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PlayerContext = (0, import_react.createContext)(null);
function PlayerProvider({ children }) {
	const audioRef = (0, import_react.useRef)(null);
	const [current, setCurrent] = (0, import_react.useState)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [finished, setFinished] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [duration, setDuration] = (0, import_react.useState)(0);
	const [volume, setVolumeState] = (0, import_react.useState)(.9);
	(0, import_react.useEffect)(() => {
		const audio = new Audio();
		audio.preload = "none";
		audio.volume = .9;
		audioRef.current = audio;
		const onTime = () => setProgress(audio.currentTime);
		const onMeta = () => setDuration(audio.duration || 0);
		const onEnd = () => {
			setPlaying(false);
			setFinished(true);
		};
		const onErr = () => {
			setError("Cet extrait n'a pas pu être chargé.");
			setPlaying(false);
			setLoading(false);
		};
		audio.addEventListener("timeupdate", onTime);
		audio.addEventListener("loadedmetadata", onMeta);
		audio.addEventListener("ended", onEnd);
		audio.addEventListener("error", onErr);
		return () => {
			audio.pause();
			audio.removeEventListener("timeupdate", onTime);
			audio.removeEventListener("loadedmetadata", onMeta);
			audio.removeEventListener("ended", onEnd);
			audio.removeEventListener("error", onErr);
		};
	}, []);
	const play = (0, import_react.useCallback)(async (next) => {
		const audio = audioRef.current;
		if (!audio) return;
		setError(null);
		setFinished(false);
		if (current?.id === next.id && audio.src) {
			if (audio.ended) audio.currentTime = 0;
			try {
				await audio.play();
				setPlaying(true);
			} catch {
				setError("Playback was blocked by the browser.");
			}
			return;
		}
		if (!next.previewPath) {
			setError("Aucun extrait disponible pour ce beat.");
			return;
		}
		setLoading(true);
		setCurrent(next);
		setProgress(0);
		setDuration(0);
		const url = await signedUrl("previews", next.previewPath);
		if (!url) {
			setLoading(false);
			setError("Audio file unavailable.");
			return;
		}
		audio.src = url;
		try {
			await audio.play();
			setPlaying(true);
			track("beat_play", {
				beatId: next.id,
				once: true
			});
		} catch {
			setError("Playback was blocked by the browser.");
		} finally {
			setLoading(false);
		}
	}, [current]);
	const toggle = (0, import_react.useCallback)((next) => {
		const audio = audioRef.current;
		if (!audio) return;
		if (next && next.id !== current?.id) {
			play(next);
			return;
		}
		if (playing) {
			audio.pause();
			setPlaying(false);
		} else if (current) play(current);
	}, [
		current,
		playing,
		play
	]);
	const seek = (0, import_react.useCallback)((seconds) => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.currentTime = seconds;
		setProgress(seconds);
	}, []);
	const setVolume = (0, import_react.useCallback)((value) => {
		const audio = audioRef.current;
		if (audio) audio.volume = value;
		setVolumeState(value);
	}, []);
	const stop = (0, import_react.useCallback)(() => {
		const audio = audioRef.current;
		if (audio) {
			audio.pause();
			audio.removeAttribute("src");
		}
		setPlaying(false);
		setFinished(false);
		setCurrent(null);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerContext.Provider, {
		value: {
			current,
			playing,
			finished,
			loading,
			error,
			progress,
			duration,
			volume,
			play: (t) => void play(t),
			toggle,
			seek,
			setVolume,
			stop
		},
		children
	});
}
function usePlayer() {
	const ctx = (0, import_react.useContext)(PlayerContext);
	if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
	return ctx;
}
//#endregion
export { usePlayer as n, PlayerProvider as t };
