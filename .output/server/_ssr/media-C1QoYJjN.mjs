import { t as supabase } from "./client-B4XIc1gZ.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/media-C1QoYJjN.js
var ONE_HOUR = 3600;
/**
* Media lives in private buckets. Public-facing assets (covers, previews) are
* readable by everyone through RLS, but are still served via time-limited
* signed URLs so masters/full-length files can stay locked down later.
*/
async function signedUrl(bucket, path) {
	if (!path) return null;
	const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, ONE_HOUR);
	if (error) return null;
	return data.signedUrl;
}
function useSignedUrl(bucket, path) {
	return useQuery({
		queryKey: [
			"signed-url",
			bucket,
			path
		],
		enabled: !!path,
		staleTime: 33e5,
		queryFn: () => signedUrl(bucket, path)
	});
}
function fileExtension(name) {
	const parts = name.split(".");
	return parts.length > 1 ? parts.pop().toLowerCase() : "";
}
//#endregion
export { signedUrl as n, useSignedUrl as r, fileExtension as t };
