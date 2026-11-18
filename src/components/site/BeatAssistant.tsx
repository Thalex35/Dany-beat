import { Link, useNavigate } from "@tanstack/react-router";
import { MessageCircle, Pause, Play, RotateCcw, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Cover } from "@/components/site/Cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { supabase } from "@/integrations/supabase/client";
import {
  answerMusicQuestion,
  answerSiteQuestion,
  isBeatSearchRequest,
  parseBeatSearch,
  type AssistantAction,
} from "@/lib/assistant";
import { BEAT_COLUMNS, formatPrice, type Beat } from "@/lib/beats";
import { openWhatsapp } from "@/lib/contact";
import { signedUrl } from "@/lib/media";
import { playerTrackFromBeat, usePlayer } from "@/lib/player";
import { useSettings } from "@/lib/settings";

const suggestions = [
  "Comment acheter un beat ?",
  "Où sont mes favoris ?",
  "Comment filtrer par BPM ?",
  "Je cherche un beat drill à 140 BPM",
];

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  contactText?: string;
  actions?: AssistantAction[];
};

async function findBeats(text: string) {
  const { bpm, terms } = parseBeatSearch(text);
  let query = supabase
    .from("beats")
    .select(BEAT_COLUMNS)
    .eq("status", "published");

  if (terms.length) {
    const filters = terms.flatMap((word) => [
      `title.ilike.%${word}%`,
      `genre.ilike.%${word}%`,
      `mood.ilike.%${word}%`,
      `song_key.ilike.%${word}%`,
      `tags.cs.{${word}}`,
    ]);
    query = query.or(filters.join(","));
  }
  if (bpm) {
    query = query.gte("bpm", Math.max(20, bpm - 5)).lte("bpm", Math.min(400, bpm + 5));
  }

  query = query
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(4);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Beat[];
}

function answerFor(text: string, beats: Beat[]): Pick<ChatMessage, "text" | "contactText" | "actions"> {
  if (!beats.length) {
    return {
      text: "Je n'ai pas trouvé de beat correspondant. Essaie un autre style ou une autre plage de BPM, ou demande conseil au producteur.",
      contactText: text,
      actions: [
        { label: "Modifier ma recherche", href: "/beats" },
        { label: "Page de contact", href: "/contact" },
      ],
    };
  }
  return {
    text: `Voici ${beats.length > 1 ? "quelques beats" : "un beat"} proche${beats.length > 1 ? "s" : ""} de ta recherche. Écoute un extrait ou ouvre le catalogue pour affiner les filtres.`,
    actions: [{ label: "Voir tout le catalogue", href: "/beats" }],
  };
}

export function BeatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Salut ! Je peux t'aider à trouver un beat et répondre aux questions sur le rythme, les BPM, les tonalités, les styles et la production musicale. Pose-moi aussi tes questions sur le site.",
      actions: [
        { label: "Explorer les beats", href: "/beats" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ]);
  const [recommendations, setRecommendations] = useState<Beat[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(2);
  const navigate = useNavigate();
  const { current, playing, finished, toggle, play } = usePlayer();
  const { data: settings } = useSettings();
  const whatsappReady = !!settings?.whatsapp_number?.replace(/\D/g, "");
  const actionNavigators: Record<AssistantAction["href"], () => void> = {
    "/": () => void navigate({ to: "/" }),
    "/beats": () => void navigate({ to: "/beats" }),
    "/about": () => void navigate({ to: "/about" }),
    "/contact": () => void navigate({ to: "/contact" }),
    "/auth": () => void navigate({ to: "/auth" }),
    "/auth?redirect=%2Fprofile%23favorites": () =>
      void navigate({ to: "/auth", search: { redirect: "/profile#favorites" } }),
    "/auth?redirect=%2Fprofile%23cart": () =>
      void navigate({ to: "/auth", search: { redirect: "/profile#cart" } }),
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: open ? "smooth" : "auto" });
  }, [isFetching, messages, open, recommendations]);

  useEffect(() => {
    for (const beat of recommendations) {
      if (beat.preview_path) {
        void signedUrl("previews", beat.preview_path).catch((error: unknown) => {
          console.error("Impossible de préparer l'extrait recommandé.", error);
        });
      }
    }
  }, [recommendations]);

  async function send(value = input) {
    const text = value.trim();
    if (!text || isFetching) return;
    setInput("");
    const userMessageId = nextMessageId.current++;
    const assistantMessageId = nextMessageId.current++;
    setMessages((current) => [...current, { id: userMessageId, role: "user", text }]);

    const musicAnswer = answerMusicQuestion(text);
    if (musicAnswer) {
      setRecommendations([]);
      setMessages((current) => [
        ...current,
        { id: assistantMessageId, role: "assistant", ...musicAnswer },
      ]);
      return;
    }

    const answer = answerSiteQuestion(text);
    if (answer) {
      setRecommendations([]);
      setMessages((current) => [
        ...current,
        { id: assistantMessageId, role: "assistant", ...answer },
      ]);
      return;
    }

    if (!isBeatSearchRequest(text)) {
      setRecommendations([]);
      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: "Je ne veux pas inventer une réponse. Je peux aider sur le catalogue, les beats, le compte, les favoris, le panier et les achats. Pour une autre question, contacte le producteur.",
          contactText: text,
          actions: [
            { label: "Explorer les beats", href: "/beats" },
            { label: "Page de contact", href: "/contact" },
          ],
        },
      ]);
      return;
    }

    setIsFetching(true);
    try {
      const beats = await findBeats(text);
      setRecommendations(beats);
      setMessages((current) => [
        ...current,
        { id: assistantMessageId, role: "assistant", ...answerFor(text, beats) },
      ]);
    } catch (error) {
      console.error("Impossible de rechercher des beats pour l'assistant.", error);
      setRecommendations([]);
      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          text: "Je n'arrive pas à consulter le catalogue. Le producteur pourra t'aider directement sur WhatsApp.",
          contactText: text,
          actions: [{ label: "Page de contact", href: "/contact" }],
        },
      ]);
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <div className="fixed right-5 bottom-24 z-[70] sm:right-8 sm:bottom-8">
      {open ? (
        <section
          id="dany-beats-assistant-panel"
          className="assistant-panel mb-3 flex h-[min(36rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl bg-background shadow-2xl ring-1 ring-border"
        >
          <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
                <img src="/assistant-logo.svg" alt="" className="size-8" />
              </span>
              <div>
                <p className="text-sm font-semibold">ASSISTANT DANY BEATS</p>
                <p className="text-[11px] text-muted-foreground">Conseils musicaux et aide du site</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer l'assistant" className="button-contour grid size-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </header>
          <div
            className="flex-1 space-y-3 overflow-y-auto p-4"
            role="log"
            aria-label="Conversation avec l'assistante"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "ml-8 rounded-2xl rounded-br-sm bg-primary p-3 text-sm text-primary-foreground" : "mr-5 rounded-2xl rounded-bl-sm bg-surface p-3 text-sm text-foreground"}>
                {message.text}
                {message.actions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <Button
                        key={action.href}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={actionNavigators[action.href]}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                ) : null}
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
                      <Link
                        to="/beats/$slug"
                        params={{ slug: beat.slug }}
                        search={{ autoplay: false }}
                        className="block truncate text-xs font-medium hover:text-primary"
                      >
                        {beat.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{beat.bpm ?? "—"} BPM · {formatPrice(beat.price)}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={
                        current?.id === beat.id && playing
                          ? `Mettre ${beat.title} en pause`
                          : `Lire ${beat.title}`
                      }
                      className="button-contour grid size-8 place-items-center rounded-full bg-foreground text-background"
                      onClick={() => {
                        if (current?.id === beat.id) toggle();
                        else play(playerTrackFromBeat(beat), recommendations.map(playerTrackFromBeat));
                      }}
                    >
                      {current?.id === beat.id && playing ? (
                        <Pause className="size-3.5" />
                      ) : current?.id === beat.id && finished ? (
                        <RotateCcw className="size-3.5" />
                      ) : (
                        <Play className="size-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div ref={messageEndRef} />
          </div>
          <div className="border-t border-border p-3">
            <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isFetching}
                  onClick={() => void send(suggestion)}
                  className="assistant-chip shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11px] text-muted-foreground disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
            >
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Pose une question ou décris un beat"
                aria-label="Message à l'assistant"
                disabled={isFetching}
              />
              <Button type="submit" size="icon" aria-label="Envoyer" disabled={isFetching || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="dany-beats-assistant-panel"
        aria-label={open ? "Fermer l'assistant DANY BEATS" : "Ouvrir l'assistant DANY BEATS"}
        className="button-contour ml-auto grid size-14 place-items-center rounded-full bg-surface text-primary ring-2 ring-primary shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X /> : <img src="/assistant-logo.svg" alt="" className="size-11" />}
      </button>
    </div>
  );
}
