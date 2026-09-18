import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

const ONE_HOUR = 60 * 60;

/**
 * Media lives in private buckets. Public-facing assets (covers, previews) are
 * readable by everyone through RLS, but are still served via time-limited
 * signed URLs so masters/full-length files can stay locked down later.
 */
export async function signedUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, ONE_HOUR);
  if (error) return null;
  return data.signedUrl;
}

export function useSignedUrl(bucket: string, path: string | null | undefined) {
  return useQuery({
    queryKey: ["signed-url", bucket, path],
    enabled: !!path,
    staleTime: (ONE_HOUR - 300) * 1000,
    queryFn: () => signedUrl(bucket, path),
  });
}

export function fileExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function downloadName(slug: string, path: string | null | undefined) {
  const extension = path ? fileExtension(path) : "mp3";
  return `${slug}-preview.${extension || "mp3"}`;
}

export async function downloadFile(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Download failed");
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
