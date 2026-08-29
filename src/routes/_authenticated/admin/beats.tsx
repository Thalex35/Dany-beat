import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ErrorState, Skeleton } from "@/components/ui/states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminBeatStatsQuery,
  adminBeatsQuery,
  beatToForm,
  deleteBeat,
  emptyBeatForm,
  saveBeat,
  uploadBeatAsset,
  type BeatFormValues,
} from "@/lib/admin";
import { useAuth } from "@/lib/auth";
import { formatPrice, slugify, type Beat, type License } from "@/lib/beats";

export const Route = createFileRoute("/_authenticated/admin/beats")({
  component: AdminBeatsPage,
});

function AdminBeatsPage() {
  const beats = useQuery(adminBeatsQuery);
  const stats = useQuery(adminBeatStatsQuery);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [editing, setEditing] = useState<BeatFormValues | null>(null);
  const [isNew, setIsNew] = useState(false);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "beats"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "beat-stats"] });
    void queryClient.invalidateQueries({ queryKey: ["beats"] });
    void queryClient.invalidateQueries({ queryKey: ["beat"] });
  };

  const saveMutation = useMutation({
    mutationFn: (form: BeatFormValues) => saveBeat(form, isNew, isNew ? user?.id : undefined),
    onSuccess: () => {
      toast.success(isNew ? "Beat created" : "Beat updated");
      setEditing(null);
      invalidate();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Could not save this beat.";
      toast.error(message.includes("duplicate key") ? "That slug is already taken." : message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBeat(id),
    onSuccess: () => {
      toast.success("Beat deleted");
      invalidate();
    },
    onError: () => toast.error("Could not delete this beat."),
  });

  function openNew() {
    setIsNew(true);
    setEditing(emptyBeatForm(crypto.randomUUID()));
  }

  function openEdit(beat: Beat) {
    setIsNew(false);
    setEditing(beatToForm(beat));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tighter">Beats</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and publish instrumentals.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 size-4" /> New beat
        </Button>
      </div>

      <div className="mt-8">
        {beats.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : beats.isError ? (
          <ErrorState
            description="Beats could not be loaded."
            onRetry={() => void beats.refetch()}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Plays</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beats.data.map((beat) => {
                const s = stats.data?.[beat.id];
                return (
                  <TableRow key={beat.id}>
                    <TableCell className="font-medium">
                      {beat.title}
                      {beat.featured ? (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                          Featured
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          beat.status === "published"
                            ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-600"
                            : "rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        }
                      >
                        {beat.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatPrice(beat.price)}</TableCell>
                    <TableCell>{s?.views ?? "—"}</TableCell>
                    <TableCell>{s?.plays ?? "—"}</TableCell>
                    <TableCell>{s?.likes ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(beat)}>
                          Edit
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button size="sm" variant="destructive">
                              <Trash2 className="size-3.5" />
                            </Button>
                          }
                          title="Delete this beat?"
                          description={`"${beat.title}" and all of its likes, comments, and analytics will be permanently removed. This cannot be undone.`}
                          confirmLabel="Delete"
                          loading={deleteMutation.isPending}
                          onConfirm={() => deleteMutation.mutate(beat.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "New beat" : "Edit beat"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <BeatForm
              key={editing.id}
              value={editing}
              onChange={setEditing}
              onSubmit={() => saveMutation.mutate(editing)}
              saving={saveMutation.isPending}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BeatForm({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: BeatFormValues;
  onChange: (next: BeatFormValues) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  const [slugTouched, setSlugTouched] = useState(!!value.slug);
  const [uploading, setUploading] = useState<"cover" | "preview" | "master" | null>(null);

  function set<K extends keyof BeatFormValues>(key: K, val: BeatFormValues[K]) {
    onChange({ ...value, [key]: val });
  }

  async function handleUpload(kind: "cover" | "preview" | "master", file: File | undefined) {
    if (!file) return;
    setUploading(kind);
    try {
      const path = await uploadBeatAsset(value.id, kind, file);
      set(`${kind}_path` as "cover_path" | "preview_path" | "master_path", path);
      toast.success(`${kind.charAt(0).toUpperCase()}${kind.slice(1)} uploaded`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(null);
    }
  }

  function updateLicense(index: number, patch: Partial<License>) {
    const current = value.licenses[index];
    if (!current) return;
    const next = value.licenses.slice();
    next[index] = { ...current, ...patch };
    set("licenses", next);
  }

  function addLicense() {
    set("licenses", [
      ...value.licenses,
      { id: crypto.randomUUID(), name: "", price: 0, files: "" },
    ]);
  }

  function removeLicense(index: number) {
    set(
      "licenses",
      value.licenses.filter((_, i) => i !== index),
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="title">
          <Input
            id="title"
            required
            value={value.title}
            onChange={(e) => {
              const title = e.target.value;
              set("title", title);
              if (!slugTouched) set("slug", slugify(title));
            }}
          />
        </Field>
        <Field label="Slug" htmlFor="slug" hint="Used in the beat's URL — must be unique">
          <Input
            id="slug"
            required
            value={value.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
          />
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <Textarea
          id="description"
          rows={3}
          value={value.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Genre" htmlFor="genre">
          <Input id="genre" value={value.genre} onChange={(e) => set("genre", e.target.value)} />
        </Field>
        <Field label="Mood" htmlFor="mood">
          <Input id="mood" value={value.mood} onChange={(e) => set("mood", e.target.value)} />
        </Field>
        <Field label="BPM" htmlFor="bpm">
          <Input
            id="bpm"
            type="number"
            min={20}
            max={400}
            value={value.bpm}
            onChange={(e) => set("bpm", e.target.value)}
          />
        </Field>
        <Field label="Key" htmlFor="key">
          <Input
            id="key"
            value={value.song_key}
            onChange={(e) => set("song_key", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Base price (USD)" htmlFor="price">
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={value.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select
            id="status"
            value={value.status}
            onChange={(e) => set("status", e.target.value as "draft" | "published")}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </Field>
        <div className="flex items-end gap-2 pb-2.5">
          <Checkbox
            id="featured"
            checked={value.featured}
            onCheckedChange={(checked) => set("featured", checked === true)}
          />
          <label htmlFor="featured" className="text-sm">
            Featured on homepage
          </label>
        </div>
      </div>

      <Field label="Tags" htmlFor="tags" hint="Comma-separated">
        <Input id="tags" value={value.tags} onChange={(e) => set("tags", e.target.value)} />
      </Field>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Licenses</p>
          <Button type="button" variant="ghost" size="sm" onClick={addLicense}>
            <Plus className="mr-1 size-3.5" /> Add license
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {value.licenses.map((license, i) => (
            <div key={license.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
              <Input
                placeholder="Name (e.g. MP3 Lease)"
                value={license.name}
                onChange={(e) => updateLicense(i, { name: e.target.value })}
              />
              <Input
                className="w-24"
                type="number"
                min={0}
                step="0.01"
                placeholder="Price"
                value={license.price}
                onChange={(e) => updateLicense(i, { price: Number(e.target.value) || 0 })}
              />
              <Input
                className="w-32"
                placeholder="Files included"
                value={license.files}
                onChange={(e) => updateLicense(i, { files: e.target.value })}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeLicense(i)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AssetUploader
          label="Cover image"
          accept="image/png,image/jpeg,image/webp"
          uploaded={value.cover_path}
          uploading={uploading === "cover"}
          onSelect={(f) => void handleUpload("cover", f)}
        />
        <AssetUploader
          label="Preview audio"
          accept="audio/mpeg,audio/wav"
          uploaded={value.preview_path}
          uploading={uploading === "preview"}
          onSelect={(f) => void handleUpload("preview", f)}
        />
        <AssetUploader
          label="Master / deliverable"
          accept="audio/wav,audio/mpeg,application/zip"
          uploaded={value.master_path}
          uploading={uploading === "master"}
          onSelect={(f) => void handleUpload("master", f)}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={saving || uploading !== null}>
          {saving ? "Saving…" : "Save beat"}
        </Button>
      </div>
    </form>
  );
}

function AssetUploader({
  label,
  accept,
  uploaded,
  uploading,
  onSelect,
}: {
  label: string;
  accept: string;
  uploaded: string | null;
  uploading: boolean;
  onSelect: (file: File | undefined) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-3 py-4 text-xs text-muted-foreground hover:bg-surface-2">
        <Upload className="size-3.5" />
        {uploading ? "Uploading…" : uploaded ? "Replace file" : "Upload file"}
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={uploading}
          onChange={(e) => onSelect(e.target.files?.[0])}
        />
      </label>
      {uploaded ? (
        <p className="mt-1 truncate text-[10px] text-muted-foreground">{uploaded}</p>
      ) : null}
    </div>
  );
}
