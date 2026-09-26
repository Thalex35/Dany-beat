import { Bot, MessageCircle, Play, Send, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Cover } from "@/components/site/Cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { supabase } from "@/integrations/supabase/client";
import { BEAT_COLUMNS, formatPrice, type Beat } from "@/lib/beats";
import { openWhatsapp } from "@/lib/contact";
import { usePlayer } from "@/lib/player";
import { useSettings } from "@/lib/settings";

const suggestions = ["Trouver un beat", "Drill sombre", "Afro", "Sad", "140 BPM"];

type ChatMessage = { id: number; role: "user" | "assistant"; text: string; contactText?: string };

function normalizeMessage(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function conversationReply(text: string) {
  const normalized = normalizeMessage(text);

  if (
    /^(hi|hello|hey|hiya|howdy|yo|good morning|good afternoon|good evening|good night|salut|bonjour|bonsoir|coucou|cc|wesh)( there| everyone| dany| assistant| tout le monde)?( how are you| how are u| ca va| comment ca va)?$/.test(
      normalized,
    ) || /^(whats up|what is up)$/.test(normalized)
  ) {
    return "Salut ! Je peux t'aider à trouver un beat par style, ambiance ou BPM.";
  }

  if (
    /^(thanks|thank you|thank you very much|thanks a lot|merci|merci beaucoup|je te remercie|je vous remercie)$/.test(
      normalized,
    )
  ) {
    return "Avec plaisir ! Tu cherches un autre style ou une autre ambiance ?";
  }

  if (
    /^(help|aide|what can you do|que peux tu faire|que pouvez vous faire|comment ca marche)$/.test(
      normalized,
    )
  ) {
    return "Je peux chercher les beats publiés par style, ambiance ou BPM, puis te proposer des extraits à écouter.";
  }

  return null;
}

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
  const terms = term
    .replace(/\bbpm\b\s*\d{2,3}/gi, "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1);
  let query = supabase
    .from("beats")
    .select(BEAT_COLUMNS)
    .eq("status", "published")
    .limit(4);

  if (term && !/^trouver un beat$|^comment acheter/i.test(term)) {
    query = query.or(terms
      .map((word) => `title.ilike.%${word}%,genre.ilike.%${word}%,mood.ilike.%${word}%,song_key.ilike.%${word}%`)
      .join(","));
  }
  if (bpm) {
    query = query.gte("bpm", bpm - 5).lte("bpm", bpm + 5);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Beat[];
}

function answerFor(text: string, beats: Beat[]) {
  if (!beats.length) {
    return {
      text: "Je n'ai pas trouvé de réponse fiable. Le producteur pourra t'aider directement sur WhatsApp.",
      contactText: text,
    };
  }
  return { text: `J'ai trouvé ${beats.length} beat${beats.length > 1 ? "s" : ""} qui correspondent à ta recherche.` };
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
  const { data: settings } = useSettings();
  const whatsappReady = !!settings?.whatsapp_number?.replace(/\D/g, "");

  async function send(value = input) {
    const text = value.trim();
    if (!text) return;
    setInput("");
    const id = Date.now();
    setMessages((current) => [...current, { id, role: "user", text }]);

    const reply = conversationReply(text);
    if (reply) {
      setRecommendations([]);
      setMessages((current) => [...current, { id: id + 1, role: "assistant", text: reply }]);
      return;
    }

    setIsFetching(true);
    try {
      const beats = await findBeats(text);
      setRecommendations(beats);
      setMessages((current) => [...current, { id: id + 1, role: "assistant", ...answerFor(text, beats) }]);
    } catch {
      setRecommendations([]);
      setMessages((current) => [
        ...current,
        {
          id: id + 1,
          role: "assistant",
          text: "Je n'arrive pas à consulter le catalogue. Le producteur pourra t'aider directement sur WhatsApp.",
          contactText: text,
        },
      ]);
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <div className="fixed right-5 bottom-24 z-50 sm:right-8 sm:bottom-8">
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
                {message.contactText ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="whatsapp"
                    className="mt-3"
                    disabled={!whatsappReady}
                    title={whatsappReady ? undefined : "WhatsApp non configuré"}
                    onClick={() => {
                      if (!settings?.whatsapp_number) return;
                      openWhatsapp({
                        phone: settings.whatsapp_number,
                        text: `Bonjour ${settings.producer_name || "Dany Beats"},\n\nJ'ai une question à propos du catalogue :\n${message.contactText}\n\nPouvez-vous m'aider ?`,
                      });
                    }}
                  >
                    <MessageCircle />
                    Contacter le producteur
                  </Button>
                ) : null}
              </div>
            ))}
            {isFetching ? <p className="text-xs text-muted-foreground">Recherche dans le catalogue…</p> : null}
            {recommendations?.length ? (
              <div className="space-y-2 pt-1">
                {recommendations.map((beat) => (
                  <div key={beat.id} className="flex items-center gap-2 rounded-2xl bg-surface p-2 ring-1 ring-border">
                    <Cover
                      path={beat.media_source === "youtube" ? null : beat.cover_path}
                      alt=""
                      className="size-12 shrink-0 rounded-xl"
                      youtubeUrl={beat.media_source === "youtube" ? beat.youtube_url : null}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{beat.title}</p>
                      <p className="text-[11px] text-muted-foreground">{beat.bpm ?? "—"} BPM · {formatPrice(beat.price)}</p>
                    </div>
                    {beat.media_source === "youtube" ? (
                      <Link
                        to="/beats/$slug"
                        params={{ slug: beat.slug }}
                        aria-label={`Ouvrir le lecteur YouTube pour ${beat.title}`}
                        className="grid size-8 place-items-center rounded-full bg-foreground text-background"
                      >
                        <Play className="size-3.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Écouter ${beat.title}`}
                        className="grid size-8 place-items-center rounded-full bg-foreground text-background"
                        onClick={() =>
                          toggle({
                            id: beat.id,
                            title: beat.title,
                            slug: beat.slug,
                            bpm: beat.bpm,
                            coverPath: beat.cover_path,
                            previewPath: beat.preview_path,
                          })
                        }
                      >
                        <Play className="size-3.5" />
                      </button>
                    )}
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
