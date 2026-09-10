import { Bot, MessageCircle, Play, Send, X } from "lucide-react";
import { useState } from "react";

import { CartButton } from "@/components/site/CartButton";
import { Cover } from "@/components/site/Cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { supabase } from "@/integrations/supabase/client";
import { BEAT_COLUMNS, formatPrice, type Beat } from "@/lib/beats";
import { usePlayer } from "@/lib/player";

const suggestions = ["Trouver un beat", "Drill sombre", "Afro", "Sad", "140 BPM", "Comment acheter ?"];

type ChatMessage = { id: number; role: "user" | "assistant"; text: string };

function parseBpm(text: string) {
  const match = text.match(/(\d{2,3})\s*bpm/i);
  return match ? Number(match[1]) : null;
}

async function findBeats(text: string) {
  const term = text
    .trim()
    .replace(/[%,(){}]/g, " ")
    .replace(/\s+/g, " ");
  const bpm = parseBpm(text);
  let query = supabase
    .from("beats")
    .select(BEAT_COLUMNS)
    .eq("status", "published")
    .limit(4);

  if (term && !/^trouver un beat$|^comment acheter/i.test(term)) {
    query = query.or(
      `title.ilike.%${term}%,genre.ilike.%${term}%,mood.ilike.%${term}%,song_key.ilike.%${term}%`,
    );
  }
  if (bpm) {
    query = query.gte("bpm", bpm - 5).lte("bpm", bpm + 5);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Beat[];
}

function answerFor(text: string, beats: Beat[]) {
  if (/comment acheter|acheter|licence|panier/i.test(text)) {
    return "Choisis une licence sur la page du beat, ajoute-le au panier, puis contacte DANY BEATS par email ou WhatsApp. Les prix et fichiers affichés viennent du catalogue.";
  }
  if (!beats.length) {
    return "Je n'ai pas trouvé de beat publié correspondant à cette recherche. Essaie un genre, une ambiance ou un BPM différent.";
  }
  return `J'ai trouvé ${beats.length} beat${beats.length > 1 ? "s" : ""} qui correspondent à ta recherche.`;
}

export function BeatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", text: "Salut. Je peux chercher un beat dans le catalogue DANY BEATS." },
  ]);
  const [recommendations, setRecommendations] = useState<Beat[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const { toggle } = usePlayer();

  async function send(value = input) {
    const text = value.trim();
    if (!text) return;
    setInput("");
    setSearch(text);
    const id = Date.now();
    setMessages((current) => [...current, { id, role: "user", text }]);
    setIsFetching(true);
    try {
      const beats = await findBeats(text);
      setRecommendations(beats);
      setMessages((current) => [...current, { id: id + 1, role: "assistant", text: answerFor(text, beats) }]);
    } catch {
      setRecommendations([]);
      setMessages((current) => [
        ...current,
        { id: id + 1, role: "assistant", text: "Le catalogue est momentanément indisponible. Réessaie dans un instant." },
      ]);
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <div className="fixed right-5 bottom-5 z-50 sm:right-8 sm:bottom-8">
      {open ? (
        <section className="mb-3 flex h-[min(36rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl bg-background shadow-2xl ring-1 ring-border">
          <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"><Bot className="size-4" /></span>
              <div><p className="text-sm font-semibold">DANY BEATS AI</p><p className="text-[11px] text-muted-foreground">Assistant catalogue</p></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer l'assistant" className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "ml-8 rounded-2xl rounded-br-sm bg-primary p-3 text-sm text-primary-foreground" : "mr-5 rounded-2xl rounded-bl-sm bg-surface p-3 text-sm text-foreground"}>
                {message.text}
              </div>
            ))}
            {isFetching ? <p className="text-xs text-muted-foreground">Recherche dans le catalogue…</p> : null}
            {recommendations?.length ? (
              <div className="space-y-2 pt-1">
                {recommendations.map((beat) => (
                  <div key={beat.id} className="flex items-center gap-2 rounded-2xl bg-surface p-2 ring-1 ring-border">
                    <Cover path={beat.cover_path} alt="" className="size-12 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{beat.title}</p>
                      <p className="text-[11px] text-muted-foreground">{beat.bpm ?? "—"} BPM · {formatPrice(beat.price)}</p>
                    </div>
                    <button type="button" aria-label={`Écouter ${beat.title}`} className="grid size-8 place-items-center rounded-full bg-foreground text-background" onClick={() => toggle({ id: beat.id, title: beat.title, slug: beat.slug, bpm: beat.bpm, coverPath: beat.cover_path, previewPath: beat.preview_path })}><Play className="size-3.5" /></button>
                    <CartButton beatId={beat.id} size="sm" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="border-t border-border p-3">
            <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
              {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void send(suggestion)} className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-border hover:text-foreground">{suggestion}</button>)}
            </div>
            <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); void send(); }}>
              <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Décris ton beat idéal" aria-label="Message à l'assistant" />
              <Button type="submit" size="icon" aria-label="Envoyer"><Send className="size-4" /></Button>
            </form>
          </div>
        </section>
      ) : null}
      <button type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? "Fermer DANY BEATS AI" : "Ouvrir DANY BEATS AI"} className="ml-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105">
        {open ? <X /> : <MessageCircle />}
      </button>
    </div>
  );
}
