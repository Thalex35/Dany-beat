globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-09-07T01:28:08.540Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-07T01:28:08.589Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/about-q6kNedZt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2e-h8iVWOESaCjqwAJ2QvWcHBqVjS8\"",
		"mtime": "2026-09-07T05:18:27.904Z",
		"size": 2862,
		"path": "../public/assets/about-q6kNedZt.js"
	},
	"/assets/admin-1PQ0-wyU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1531-DVj1Os2Pim6YPDa67TcV0clJtXQ\"",
		"mtime": "2026-09-07T05:18:27.904Z",
		"size": 5425,
		"path": "../public/assets/admin-1PQ0-wyU.js"
	},
	"/assets/admin.beats-C5Q4ZfbW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4111-1S2XMuUbL+FVxFTaceWl59zMtH8\"",
		"mtime": "2026-09-07T05:18:27.905Z",
		"size": 16657,
		"path": "../public/assets/admin.beats-C5Q4ZfbW.js"
	},
	"/assets/admin.cart-C1BU0OFi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b89-VNXjO7Wnv8oBLxCu2OIWQpKIo0g\"",
		"mtime": "2026-09-07T05:18:27.906Z",
		"size": 2953,
		"path": "../public/assets/admin.cart-C1BU0OFi.js"
	},
	"/assets/admin.index-DRGDuQqq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff8-1kbWoed0XHxt/JZeiA+oGfQ6BXU\"",
		"mtime": "2026-09-07T05:18:27.906Z",
		"size": 4088,
		"path": "../public/assets/admin.index-DRGDuQqq.js"
	},
	"/assets/admin.users-D90z4Pky.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc1-kUIhmEB9O5276VKiyguuZY7BvOo\"",
		"mtime": "2026-09-07T05:18:27.908Z",
		"size": 4033,
		"path": "../public/assets/admin.users-D90z4Pky.js"
	},
	"/assets/admin.settings-BhRdSo95.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2003-rcoU3AixIY2bWkE1s9Co2QwdBw0\"",
		"mtime": "2026-09-07T05:18:27.907Z",
		"size": 8195,
		"path": "../public/assets/admin.settings-BhRdSo95.js"
	},
	"/assets/auth-DU4pQmwt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f25-eLdhpae/7/WSeg4Dtt46UI8G4UU\"",
		"mtime": "2026-09-07T05:18:27.909Z",
		"size": 7973,
		"path": "../public/assets/auth-DU4pQmwt.js"
	},
	"/assets/BeatCard-C3KFn5P1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a80-6qIRDi5s+tcKo8hghPIF8hjLH5U\"",
		"mtime": "2026-09-07T05:18:27.818Z",
		"size": 2688,
		"path": "../public/assets/BeatCard-C3KFn5P1.js"
	},
	"/assets/beats-B8sIY77c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"425-QW5wZiGC3EOsw742eiCy9wfNlxo\"",
		"mtime": "2026-09-07T05:18:27.910Z",
		"size": 1061,
		"path": "../public/assets/beats-B8sIY77c.js"
	},
	"/assets/beats-CDGObUFB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1172-ER+9HMBw9LBYrYXbs0w6MNreujM\"",
		"mtime": "2026-09-07T05:18:27.912Z",
		"size": 4466,
		"path": "../public/assets/beats-CDGObUFB.js"
	},
	"/assets/beats_._slug-C7Q5vLeG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2f05-92bG1BMWLc4fo6OOLIifOXNydFs\"",
		"mtime": "2026-09-07T05:18:27.913Z",
		"size": 12037,
		"path": "../public/assets/beats_._slug-C7Q5vLeG.js"
	},
	"/assets/button-HDjnFMXO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13b2-DeH4wBhI7eheZZeY0/QSPn15Nyk\"",
		"mtime": "2026-09-07T05:18:27.999Z",
		"size": 5042,
		"path": "../public/assets/button-HDjnFMXO.js"
	},
	"/assets/cart-CLT8z6hf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12b4-9Yh9Pw0paBIaKGefHhVlo/mYBRA\"",
		"mtime": "2026-09-07T05:18:28.001Z",
		"size": 4788,
		"path": "../public/assets/cart-CLT8z6hf.js"
	},
	"/assets/confirm-DyXT59YT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8fc3-2Bmb60guAFRdrZhws2YWw5aznZk\"",
		"mtime": "2026-09-07T05:18:28.002Z",
		"size": 36803,
		"path": "../public/assets/confirm-DyXT59YT.js"
	},
	"/assets/contact-B76xacBA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20f0-tHvfW+ib6thhAW9P8KIvVL81P44\"",
		"mtime": "2026-09-07T05:18:28.003Z",
		"size": 8432,
		"path": "../public/assets/contact-B76xacBA.js"
	},
	"/assets/contact-COSi5g_X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"197-yWmkeCCA0WWF56aE1l+fEzApQRM\"",
		"mtime": "2026-09-07T05:18:28.003Z",
		"size": 407,
		"path": "../public/assets/contact-COSi5g_X.js"
	},
	"/assets/Cover-CFyED9Qx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"524-Bb84R+vMhdLIcP7R1pgblxFsIJ0\"",
		"mtime": "2026-09-07T05:18:27.819Z",
		"size": 1316,
		"path": "../public/assets/Cover-CFyED9Qx.js"
	},
	"/assets/dist-Di7mV1WC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9084-tfvxaBwcafS05FUhP0s/mU3SSJg\"",
		"mtime": "2026-09-07T05:18:28.004Z",
		"size": 36996,
		"path": "../public/assets/dist-Di7mV1WC.js"
	},
	"/assets/field-D84BLf5h.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"45c-DoGcUc5JKMeM+CXY4EO39re/IVQ\"",
		"mtime": "2026-09-07T05:18:28.005Z",
		"size": 1116,
		"path": "../public/assets/field-D84BLf5h.js"
	},
	"/assets/index-Czcb1eH3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"40462-um+voSMOyWo6Cp9yTIWtPxj5g/M\"",
		"mtime": "2026-09-07T05:18:27.818Z",
		"size": 263266,
		"path": "../public/assets/index-Czcb1eH3.js"
	},
	"/assets/jsx-runtime-Cltr0gcK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20ee-ObwGPj96dlkL76iVLbX2wLAXzuw\"",
		"mtime": "2026-09-07T05:18:28.006Z",
		"size": 8430,
		"path": "../public/assets/jsx-runtime-Cltr0gcK.js"
	},
	"/assets/LikeButton-B3DFVdop.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cdf-9U1/OkYilGRe5hU4Me5tp//pd1Q\"",
		"mtime": "2026-09-07T05:18:27.898Z",
		"size": 3295,
		"path": "../public/assets/LikeButton-B3DFVdop.js"
	},
	"/assets/link-DQ-SI1J_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1116-SsT9kEGKlxor/KgPk7sss7S4dWU\"",
		"mtime": "2026-09-07T05:18:28.007Z",
		"size": 4374,
		"path": "../public/assets/link-DQ-SI1J_.js"
	},
	"/assets/log-out-CCOZWZVu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dc-t0x+dsQfFXAUvEjiZCd48MjyzuY\"",
		"mtime": "2026-09-07T05:18:28.098Z",
		"size": 220,
		"path": "../public/assets/log-out-CCOZWZVu.js"
	},
	"/assets/mail-B1JwWYTX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-3caiyQbgHRZc6yQsffWh0X2jA3I\"",
		"mtime": "2026-09-07T05:18:28.099Z",
		"size": 203,
		"path": "../public/assets/mail-B1JwWYTX.js"
	},
	"/assets/Match-C0VHaIY6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bddd-FGqNTNyMjL8swoFwAs+4Ofra+qw\"",
		"mtime": "2026-09-07T05:18:27.899Z",
		"size": 48605,
		"path": "../public/assets/Match-C0VHaIY6.js"
	},
	"/assets/matchContext-qESg7g4D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"29c-k8oj2CsjfOV0/evjJYp1TZ1TQww\"",
		"mtime": "2026-09-07T05:18:28.102Z",
		"size": 668,
		"path": "../public/assets/matchContext-qESg7g4D.js"
	},
	"/assets/message-circle-6tqJjUZ0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e7-wjBIan5BU5XtQxBQaYEkrKBA6f0\"",
		"mtime": "2026-09-07T05:18:28.103Z",
		"size": 231,
		"path": "../public/assets/message-circle-6tqJjUZ0.js"
	},
	"/assets/music-4-fKj5B4qE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f9-zlbASRkI77BvGpdZdSmAXT0MSog\"",
		"mtime": "2026-09-07T05:18:28.103Z",
		"size": 249,
		"path": "../public/assets/music-4-fKj5B4qE.js"
	},
	"/assets/pencil-_OzY85ua.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10a-EL9SIhfrXS5p3e9NotirEuGN61M\"",
		"mtime": "2026-09-07T05:18:28.104Z",
		"size": 266,
		"path": "../public/assets/pencil-_OzY85ua.js"
	},
	"/assets/profile-jiQRddp6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d3e-hImX2ZPHPbDwKZwKoW+CF0uEGwI\"",
		"mtime": "2026-09-07T05:18:28.110Z",
		"size": 3390,
		"path": "../public/assets/profile-jiQRddp6.js"
	},
	"/assets/route-BR6RlMbW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-Suuo2DL+JXBR7534c+Esw7/NiiQ\"",
		"mtime": "2026-09-07T05:18:28.118Z",
		"size": 141,
		"path": "../public/assets/route-BR6RlMbW.js"
	},
	"/assets/routes-98rNKkwq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"131f-9Vfd+gk5t/LbDAkJEp3uyLWJ4xE\"",
		"mtime": "2026-09-07T05:18:28.123Z",
		"size": 4895,
		"path": "../public/assets/routes-98rNKkwq.js"
	},
	"/assets/settings-DhJywOEA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a5-TSBA08zdYZwvAccBUQSs0o0VVlQ\"",
		"mtime": "2026-09-07T05:18:28.257Z",
		"size": 421,
		"path": "../public/assets/settings-DhJywOEA.js"
	},
	"/assets/shopping-cart-C1z5KNeL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11a-+WOmaVcuSk8RUSoNm7svosjmxok\"",
		"mtime": "2026-09-07T05:18:28.258Z",
		"size": 282,
		"path": "../public/assets/shopping-cart-C1z5KNeL.js"
	},
	"/assets/SiteLayout-CHr0ruIo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ce2-UcFSQGvWCt1z+OiS8THsplV7iB4\"",
		"mtime": "2026-09-07T05:18:27.902Z",
		"size": 11490,
		"path": "../public/assets/SiteLayout-CHr0ruIo.js"
	},
	"/assets/producer-dany-1-82CYpm.jpg": {
		"type": "image/jpeg",
		"etag": "\"17d50-s/do5dfrd9Nqo66mbemQm2CmQo4\"",
		"mtime": "2026-09-07T05:18:28.313Z",
		"size": 97616,
		"path": "../public/assets/producer-dany-1-82CYpm.jpg"
	},
	"/assets/sparkles-DFnunQZ4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e4-D0xg67A1zRuKl8mh1ZIYFdwmnsU\"",
		"mtime": "2026-09-07T05:18:28.259Z",
		"size": 484,
		"path": "../public/assets/sparkles-DFnunQZ4.js"
	},
	"/assets/states-CcU_apFJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bf9-SGaOZVY+lALUmNXwhvccoSbREBc\"",
		"mtime": "2026-09-07T05:18:28.264Z",
		"size": 3065,
		"path": "../public/assets/states-CcU_apFJ.js"
	},
	"/assets/trash-2-4hzC2SRL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e-0hKHtq83jCot1FY+CnbhlQ6qp1s\"",
		"mtime": "2026-09-07T05:18:28.269Z",
		"size": 318,
		"path": "../public/assets/trash-2-4hzC2SRL.js"
	},
	"/assets/styles-CvSmyuGX.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"19136-K5AhwG3TuYQTY/jOE9lst1OfH8k\"",
		"mtime": "2026-09-07T05:18:28.316Z",
		"size": 102710,
		"path": "../public/assets/styles-CvSmyuGX.css"
	},
	"/assets/useMutation-QQsNn1_G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"946-qupvp1UxhncwIwBXJvFb49JKZrQ\"",
		"mtime": "2026-09-07T05:18:28.274Z",
		"size": 2374,
		"path": "../public/assets/useMutation-QQsNn1_G.js"
	},
	"/assets/useQuery-BKC1Zg3J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39f75-pGuZmlVD8HGPCsrrO97KjSbu4YM\"",
		"mtime": "2026-09-07T05:18:28.278Z",
		"size": 237429,
		"path": "../public/assets/useQuery-BKC1Zg3J.js"
	},
	"/assets/useStore-D-4ReuTk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4af0-rc3wtf3jY9TfJ/YAIbkp0ufikZo\"",
		"mtime": "2026-09-07T05:18:28.279Z",
		"size": 19184,
		"path": "../public/assets/useStore-D-4ReuTk.js"
	},
	"/assets/utils-B6KiDbIe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6a7d-iNkBSvaSyIjvZOzWoTvEa49qwcI\"",
		"mtime": "2026-09-07T05:18:28.282Z",
		"size": 27261,
		"path": "../public/assets/utils-B6KiDbIe.js"
	},
	"/assets/validation-DwcGD84Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-4NZbm0pWBYJ7ZZiuwNAUQHAnl/g\"",
		"mtime": "2026-09-07T05:18:28.312Z",
		"size": 179,
		"path": "../public/assets/validation-DwcGD84Z.js"
	},
	"/video/hero-bg-poster.jpg": {
		"type": "image/jpeg",
		"etag": "\"135d3-5a+C2qxEcYRS28uYTUnj3LilkD4\"",
		"mtime": "2026-09-07T01:28:08.647Z",
		"size": 79315,
		"path": "../public/video/hero-bg-poster.jpg"
	},
	"/video/hero-bg.mp4": {
		"type": "video/mp4",
		"etag": "\"bc11f-IC9OkafMmQzdvf1yyurvCGx7a/k\"",
		"mtime": "2026-09-07T01:28:08.713Z",
		"size": 770335,
		"path": "../public/video/hero-bg.mp4"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_kTAq89 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_kTAq89
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
