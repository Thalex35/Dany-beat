import { Link } from "@tanstack/react-router";
import { Ear, Pause, Play, Repeat, RotateCcw, Volume2, X } from "lucide-react";

import { Cover } from "@/components/site/Cover";
import { Spinner } from "@/components/ui/states";
import { formatTime } from "@/lib/beats";
import { usePlayer } from "@/lib/player";

export function PlayerBar() {
  const {
    current,
    playing,
    finished,
    loading,
    error,
    progress,
    duration,
    volume,
    loop,
    toggle,
    setLoop,
    seek,
    setVolume,
    stop,
  } = usePlayer();

  if (!current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-2 sm:px-4 sm:pb-5">
      <div className="mx-auto max-w-5xl rounded-2xl bg-surface/95 p-2 shadow-2xl ring-1 ring-border backdrop-blur-xl sm:p-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/beats/$slug"
            params={{ slug: current.slug }}
            className="shrink-0"
            aria-label={`Ouvrir ${current.title}`}
          >
            <Cover path={current.coverPath} alt="" className="size-8 rounded-lg sm:size-12" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium sm:text-sm">{current.title}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {current.bpm ? `${current.bpm} BPM • ` : ""}Extrait
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Volume2 className="size-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              aria-label="Volume"
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-20 accent-[var(--primary)]"
            />
          </div>
          <button
            onClick={() => toggle()}
            aria-label={
              finished
                ? "Rejouer l'extrait"
                : playing
                  ? "Mettre l'extrait en pause"
                  : "Écouter l'extrait"
            }
            className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105 sm:size-10"
          >
            {loading ? (
              <Spinner />
            ) : finished ? (
              <RotateCcw className="size-4" />
            ) : playing ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </button>
          <button
            onClick={() => setLoop(!loop)}
            aria-pressed={loop}
            aria-label={loop ? "Désactiver la lecture en boucle" : "Activer la lecture en boucle"}
            title={loop ? "Désactiver la boucle" : "Activer la boucle"}
            className={`hidden sm:block ${loop ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Repeat className="size-4" />
          </button>
          <button
            onClick={stop}
            aria-label="Fermer le player"
            className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground sm:size-8"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 sm:mt-3 sm:gap-3">
          <span className="w-7 text-[9px] tabular-nums text-muted-foreground sm:w-9 sm:text-[10px]">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={progress}
            aria-label="Position de lecture"
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1 flex-1 accent-[var(--primary)]"
          />
          <span className="w-7 text-right text-[9px] tabular-nums text-muted-foreground sm:w-9 sm:text-[10px]">
            {formatTime(duration)}
          </span>
        </div>
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
