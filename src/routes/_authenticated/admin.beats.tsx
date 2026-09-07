import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Pencil, Play, Plus, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Cover } from "@/components/site/Cover";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge, EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BEAT_COLUMNS, formatPrice, slugify, type Beat, type License } from "@/lib/beats";
import { fileExtension } from "@/lib/media";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/_authenticated/admin/beats")({
  component: AdminBeats,
});

type FormState = {
  id: string | null;
  title: string;
  slug: string;
  description: string;
  genre: string;
  mood: string;
  bpm: string;
  song_key: string;
  price: string;
  tags: string;
  status: "draft" | "published";
  featured: boolean;
  licenses: License[];
  cover_path: string | null;
  preview_path: string | null;
  master_path: string | null;
};

const blankForm: FormState = {
  id: null,
  title: "",
  slug: "",
  description: "",
  genre: "",
  mood: "",
  bpm: "",
  song_key: "",
  price: "0",
  tags: "",
  status: "draft",
  featured: false,
  licenses: [{ id: "mp3", name: "Licence MP3", price: 25, files: "MP3 taggé 320 kbps" }],
  cover_path: null,
  preview_path: null,
  master_path: null,
};

function toForm(beat: Beat): FormState {
  return {
    id: beat.id,
    title: beat.title,
    slug: beat.slug,
    description: beat.description ?? "",
    genre: beat.genre ?? "",
    mood: beat.mood ?? "",
    bpm: beat.bpm ? String(beat.bpm) : "",
    song_key: beat.song_key ?? "",
    price: String(beat.price ?? 0),
    tags: (beat.tags ?? []).join(", "),
    status: beat.status,
    featured: beat.featured,
    licenses: Array.isArray(beat.licenses) && beat.licenses.length ? beat.licenses : [],
    cover_path: beat.cover_path,
    preview_path: beat.preview_path,
    master_path: beat.master_path,
  };
}

async function uploadTo(bucket: string, file: File, slug: string) {
  const ext = fileExtension(file.name) || (bucket === "covers" ? "jpg" : "mp3");
  const path = `${slug || "beat"}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

function AdminBeats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const { current, playing, toggle } = usePlayer();

  const beats = useQuery({
    queryKey: ["admin-beats"],
    queryFn: async (): Promise<Beat[]> => {
      const { data, error } = await supabase
        .from("beats")
        .select(BEAT_COLUMNS)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Beat[];
    },
  });
  const filteredBeats = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return beats.data ?? [];
    return (beats.data ?? []).filter((beat) =>
      [beat.title, beat.slug, beat.genre, beat.mood, ...(beat.tags ?? [])]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [beats.data, search]);

  const save = useMutation({
    mutationFn: async (state: FormState) => {
      const payload = {
        title: state.title.trim(),
        slug: (state.slug.trim() || slugify(state.title)) as string,
        description: state.description.trim() || null,
        genre: state.genre.trim() || null,
        mood: state.mood.trim() || null,
        bpm: state.bpm ? Number(state.bpm) : null,
        song_key: state.song_key.trim() || null,
        price: Number(state.price || 0),
        tags: state.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        licenses: state.licenses,
        status: state.status,
        featured: state.featured,
        cover_path: state.cover_path,
        preview_path: state.preview_path,
        master_path: state.master_path,
        published_at: state.status === "published" ? new Date().toISOString() : null,
      };
      if (state.id) {
        const { error } = await supabase.from("beats").update(payload).eq("id", state.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("beats").insert({ ...payload, created_by: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-beats"] });
      queryClient.invalidateQueries({ queryKey: ["beats", "published"] });
      setForm(null);
      toast.success("Beat enregistré");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Le beat n'a pas pu être enregistré."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("beats").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-beats"] });
      queryClient.invalidateQueries({ queryKey: ["beats", "published"] });
      toast.success("Beat supprimé");
    },
    onError: () => toast.error("Le beat n'a pas pu être supprimé."),
  });

  async function handleUpload(bucket: "covers" | "previews" | "masters", file: File) {
    if (!form) return;
    setUploading(true);
    try {
      const path = await uploadTo(bucket, file, form.slug || slugify(form.title));
      setForm((prev) =>
        prev
          ? {
              ...prev,
              ...(bucket === "covers"
                ? { cover_path: path }
                : bucket === "previews"
                  ? { preview_path: path }
                  : { master_path: path }),
            }
          : prev,
      );
      toast.success("Fichier importé");
    } catch {
      toast.error("L'import a échoué. Vérifiez la taille du fichier et réessayez.");
    } finally {
      setUploading(false);
    }
  }

  if (beats.isError) {
    return (
      <ErrorState
        title="Une erreur est survenue"
        description="Les beats n'ont pas pu être chargés."
        onRetry={() => void beats.refetch()}
      />
    );
  }

  return (
    <div className="admin-beats-page space-y-10">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow text-primary">Bibliothèque studio</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">Beats</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {beats.data?.length ?? 0} beat{(beats.data?.length ?? 0) === 1 ? "" : "s"} au catalogue
          </p>
        </div>
        <Button size="sm" onClick={() => setForm(blankForm)}>
          <Plus />
          Nouveau beat
        </Button>
      </div>

      {form ? (
        <form
          className="admin-editor-panel rounded-3xl p-6"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
        >
          <div className="admin-section-label">
            <Pencil />
            <span>{form.id ? "Modifier le beat" : "Nouveau beat"}</span>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Titre" htmlFor="title">
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: form.id ? form.slug : slugify(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Slug" htmlFor="slug" hint="Utilisé dans l'adresse de la page du beat.">
              <Input
                id="slug"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              />
            </Field>
            <Field label="Genre" htmlFor="genre">
              <Input
                id="genre"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              />
            </Field>
            <Field label="Ambiance" htmlFor="mood">
              <Input
                id="mood"
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: e.target.value })}
              />
            </Field>
            <Field label="BPM" htmlFor="bpm">
              <Input
                id="bpm"
                type="number"
                min={20}
                max={400}
                value={form.bpm}
                onChange={(e) => setForm({ ...form, bpm: e.target.value })}
              />
            </Field>
            <Field label="Tonalité" htmlFor="song_key">
              <Input
                id="song_key"
                value={form.song_key}
                onChange={(e) => setForm({ ...form, song_key: e.target.value })}
                placeholder="Fa# mineur"
              />
            </Field>
            <Field label="Prix de base (USD)" htmlFor="price">
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="Tags" htmlFor="tags" hint="Séparés par des virgules.">
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
          </div>

          <fieldset className="mt-8">
            <legend className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
              Licences
            </legend>
            <div className="mt-4 space-y-3">
              {form.licenses.map((license, i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-[1fr_8rem_1fr_auto]">
                  <Input
                    aria-label="Nom de la licence"
                    value={license.name}
                    onChange={(e) => {
                      const next = [...form.licenses];
                      next[i] = { ...license, name: e.target.value };
                      setForm({ ...form, licenses: next });
                    }}
                  />
                  <Input
                    aria-label="Prix de la licence"
                    type="number"
                    min={0}
                    step="0.01"
                    value={license.price}
                    onChange={(e) => {
                      const next = [...form.licenses];
                      next[i] = { ...license, price: Number(e.target.value) };
                      setForm({ ...form, licenses: next });
                    }}
                  />
                  <Input
                    aria-label="Fichiers inclus"
                    value={license.files ?? ""}
                    placeholder="WAV + stems"
                    onChange={(e) => {
                      const next = [...form.licenses];
                      next[i] = { ...license, files: e.target.value };
                      setForm({ ...form, licenses: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    aria-label="Supprimer la licence"
                    onClick={() =>
                      setForm({ ...form, licenses: form.licenses.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    licenses: [
                      ...form.licenses,
                      { id: crypto.randomUUID(), name: "", price: 0, files: "" },
                    ],
                  })
                }
              >
                <Plus />
                Ajouter une licence
              </Button>
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
              Fichiers du beat
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {(
                [
                  {
                    bucket: "covers",
                    label: "Pochette",
                    accept: "image/*",
                    path: form.cover_path,
                    hint: "JPG ou PNG carré",
                  },
                  {
                    bucket: "previews",
                    label: "Extrait audio",
                    accept: "audio/*",
                    path: form.preview_path,
                    hint: "MP3 taggé, écoutable publiquement",
                  },
                  {
                    bucket: "masters",
                    label: "Master / stems",
                    accept: "audio/*,.zip,.rar",
                    path: form.master_path,
                    hint: "Privé, jamais public",
                  },
                ] as const
              ).map((slot) => (
                <div key={slot.bucket} className="rounded-2xl bg-background p-4 ring-1 ring-border">
                  <p className="text-sm font-medium">{slot.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{slot.hint}</p>
                  <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                    <Upload className="size-4" aria-hidden="true" />
                    {slot.path ? "Remplacer le fichier" : "Importer un fichier"}
                    <input
                      type="file"
                      accept={slot.accept}
                      className="sr-only"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUpload(slot.bucket, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p
                    className="mt-3 truncate text-xs text-muted-foreground"
                    title={slot.path ?? ""}
                  >
                    {slot.path
                      ? `Importé : ${slot.path.split("/").pop()}`
                      : "Aucun fichier importé"}
                  </p>
                  {slot.path ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() =>
                        setForm({
                          ...form,
                          ...(slot.bucket === "covers"
                            ? { cover_path: null }
                            : slot.bucket === "previews"
                              ? { preview_path: null }
                              : { master_path: null }),
                        })
                      }
                    >
                      Retirer
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
            {uploading ? (
              <p className="mt-3 text-xs text-primary">Import du fichier en cours…</p>
            ) : null}
          </fieldset>

          <div className="mt-8 flex flex-wrap items-end gap-5">
            <Field label="Statut" htmlFor="status">
              <Select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "draft" | "published" })
                }
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </Select>
            </Field>
            <label className="flex items-center gap-2 pb-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Mettre en avant sur la page d'accueil
            </label>
          </div>

          <div className="mt-8 flex gap-3">
            <Button type="submit" disabled={save.isPending || uploading}>
              {uploading
                ? "Import en cours…"
                : save.isPending
                  ? "Enregistrement…"
                  : "Enregistrer le beat"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
              Annuler
            </Button>
          </div>
        </form>
      ) : null}

      <div>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un beat par titre, genre ou tag"
          aria-label="Rechercher dans les beats"
          className="mb-4 max-w-xl"
        />
        {beats.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : filteredBeats.length === 0 ? (
          <EmptyState
            title={search ? "Aucun beat trouvé" : "Aucun beat pour le moment"}
            description={
              search
                ? "Essayez un autre titre, genre ou tag."
                : "Importez votre première instrumentale pour ouvrir le catalogue."
            }
          />
        ) : (
          <ul className="space-y-3">
            {filteredBeats.map((beat) => (
              <li
                key={beat.id}
                className="admin-beat-row flex cursor-pointer items-center gap-4 rounded-2xl bg-surface p-3 ring-1 ring-border"
                onClick={() => setSelectedBeat(beat)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setSelectedBeat(beat);
                }}
                role="button"
                tabIndex={0}
              >
                <Cover path={beat.cover_path} alt="" className="size-14 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{beat.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatPrice(beat.price)} · {beat.genre ?? "—"} · {beat.bpm ?? "—"} BPM
                  </p>
                </div>
                <Badge tone={beat.status === "published" ? "success" : "neutral"}>
                  {beat.status === "published" ? "publié" : "brouillon"}
                </Badge>
                {beat.featured ? <Badge tone="accent">à la une</Badge> : null}
                <Button
                  variant="ghost"
                  size="iconSm"
                  aria-label={`Modifier ${beat.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setForm(toForm(beat));
                  }}
                >
                  <Pencil />
                </Button>
                <ConfirmDialog
                  title={`Supprimer « ${beat.title} » ?`}
                  description="Le beat, ses favoris et ses commentaires seront supprimés. Cette action est irréversible."
                  confirmLabel="Supprimer le beat"
                  onConfirm={() => remove.mutate(beat.id)}
                  trigger={
                    <Button
                      variant="ghost"
                      size="iconSm"
                      aria-label={`Supprimer ${beat.title}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Trash2 />
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!selectedBeat} onOpenChange={(open) => !open && setSelectedBeat(null)}>
        {selectedBeat ? (
          <DialogContent className="admin-beat-dialog max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl tracking-tight">
                {selectedBeat.title}
              </DialogTitle>
              <DialogDescription>
                Vue détaillée de cette instrumentale dans le catalogue.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-7 pt-3 md:grid-cols-[15rem_1fr]">
              <div>
                <Cover
                  path={selectedBeat.cover_path}
                  alt={`Pochette de ${selectedBeat.title}`}
                  className="aspect-square w-full rounded-2xl"
                />
                <Button
                  block
                  className="mt-4"
                  onClick={() =>
                    toggle({
                      id: selectedBeat.id,
                      title: selectedBeat.title,
                      slug: selectedBeat.slug,
                      bpm: selectedBeat.bpm,
                      coverPath: selectedBeat.cover_path,
                      previewPath: selectedBeat.preview_path,
                    })
                  }
                  disabled={!selectedBeat.preview_path}
                >
                  {current?.id === selectedBeat.id && playing ? <Pause /> : <Play />}
                  {current?.id === selectedBeat.id && playing ? "Pause" : "Écouter / rejouer"}
                </Button>
                {!selectedBeat.preview_path ? (
                  <p className="mt-2 text-xs text-muted-foreground">Aucun extrait audio importé.</p>
                ) : null}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={selectedBeat.status === "published" ? "success" : "neutral"}>
                    {selectedBeat.status === "published" ? "Publié" : "Brouillon"}
                  </Badge>
                  {selectedBeat.featured ? <Badge tone="accent">À la une</Badge> : null}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {selectedBeat.description || "Aucune description pour ce beat."}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-border sm:grid-cols-4">
                  {[
                    { label: "Genre", value: selectedBeat.genre || "—" },
                    { label: "Ambiance", value: selectedBeat.mood || "—" },
                    { label: "BPM", value: selectedBeat.bpm || "—" },
                    { label: "Tonalité", value: selectedBeat.song_key || "—" },
                  ].map((fact) => (
                    <div key={fact.label} className="bg-background px-3 py-3">
                      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                {selectedBeat.tags.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedBeat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-6 border-t border-border pt-5">
                  <p className="eyebrow">Licences</p>
                  <div className="mt-3 grid gap-2">
                    {selectedBeat.licenses.map((license) => (
                      <div
                        key={license.id}
                        className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2 text-sm"
                      >
                        <span>
                          {license.name}{" "}
                          <span className="text-xs text-muted-foreground">· {license.files}</span>
                        </span>
                        <strong className="text-primary">{formatPrice(license.price)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-5 text-xs text-muted-foreground">
                  Fichiers: {selectedBeat.cover_path ? "pochette" : "sans pochette"} ·{" "}
                  {selectedBeat.preview_path ? "extrait audio" : "sans extrait"} ·{" "}
                  {selectedBeat.master_path ? "master privé" : "sans master"}
                </p>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
