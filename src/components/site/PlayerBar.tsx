import { Link } from "@tanstack/react-router";
import {
  Pause,
  Play,
  Repeat,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from "lucide-react";

import { Cover } from "@/components/site/Cover";
import { YoutubeEmbed } from "@/components/site/YoutubeEmbed";
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
    autoPlayNext,
    toggle,
    seek,
    setVolume,
    setLoop,
    setAutoPlayNext,
    next,
    previous,
    registerYoutubeControls,
    setYoutubePlaying,
    setYoutubeProgress,
    setYoutubeVolume,
    setYoutubeError,
    finishYoutube,
    stop,
  } = usePlayer();

  if (!current) return null;
  const isYoutube = current.mediaSource === "youtube" && Boolean(current.youtubeUrl);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-2 sm:px-4">
      {isYoutube && current.youtubeUrl ? (
        <div className="mx-auto mb-2 w-full max-w-[480px] overflow-hidden rounded-xl ring-1 ring-border shadow-2xl">
          <YoutubeEmbed
            url={current.youtubeUrl}
            title={current.title}
            onControls={registerYoutubeControls}
            onPlay={() => setYoutubePlaying(true)}
            onPause={() => setYoutubePlaying(false)}
            onEnded={finishYoutube}
            onProgress={setYoutubeProgress}
            onVolume={setYoutubeVolume}
            onError={setYoutubeError}
          />
        </div>
      ) : null}
      <div
        className="mx-auto grid h-24 max-w-5xl grid-cols-[48px_minmax(0,1fr)] grid-rows-[20px_28px_24px] items-center gap-x-2 gap-y-1 rounded-xl bg-surface/95 p-2 shadow-2xl ring-1 ring-border backdrop-blur-xl sm:flex sm:h-22 sm:gap-3 sm:p-1"
      >
        <Link
          to="/beats/$slug"
          params={{ slug: current.slug }}
          className="row-span-3 size-12 shrink-0 overflow-hidden rounded-lg sm:row-span-1 sm:size-20"
          aria-label={`Ouvrir ${current.title}`}
        >
          <Cover
            path={current.coverPath}
            alt=""
            className="size-full rounded-lg"
            youtubeUrl={current.youtubeUrl ?? null}
          />
        </Link>
        <div className="contents sm:flex sm:min-w-0 sm:flex-1 sm:flex-col sm:justify-center">
          <div className="col-start-2 row-start-1 flex min-w-0 items-baseline gap-2 sm:col-auto sm:row-auto">
            <p className="truncate text-xs font-medium sm:text-sm" title={current.title}>
              {current.title}
            </p>
            {current.bpm ? (
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {current.bpm} BPM
              </span>
            ) : null}
          </div>
          <div className="col-start-2 row-start-3 flex min-w-0 items-center gap-1 sm:col-auto sm:row-auto sm:mt-2 sm:gap-2">
            <span className="w-7 shrink-0 text-[9px] tabular-nums text-muted-foreground">
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
              className="h-1 min-w-0 flex-1 accent-(--primary)"
            />
            <span className="w-7 shrink-0 text-right text-[9px] tabular-nums text-muted-foreground">
              {formatTime(duration)}
            </span>
            <div className="flex shrink-0 items-center gap-1" title="Volume">
              <Volume2 className="size-3 text-muted-foreground sm:size-4" aria-hidden="true" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                aria-label="Volume"
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1 w-8 accent-(--primary) sm:w-16"
              />
            </div>
          </div>
        </div>
        <div className="col-start-2 row-start-2 flex shrink-0 items-center justify-end gap-1 sm:col-auto sm:row-auto sm:gap-2">
          {error ? (
            <p
              className="hidden min-w-0 flex-1 truncate text-[10px] text-destructive sm:block"
              role="status"
              title={error}
            >
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={previous}
            aria-label="Beat précédent"
            title="Beat précédent"
            className="button-contour grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground sm:size-8"
          >
            <SkipBack className="size-3.5 sm:size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setLoop(!loop)}
            aria-label={loop ? "Désactiver la lecture en boucle" : "Activer la lecture en boucle"}
            aria-pressed={loop}
            title={loop ? "Désactiver la lecture en boucle" : "Lire en boucle"}
            className={`button-contour grid size-6 shrink-0 place-items-center rounded-full transition-colors sm:size-8 ${
              loop
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Repeat className="size-3.5 sm:size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setAutoPlayNext(!autoPlayNext)}
            aria-label={
              autoPlayNext
                ? "Désactiver la lecture automatique du beat suivant"
                : "Activer la lecture automatique du beat suivant"
            }
            aria-pressed={autoPlayNext}
            title={autoPlayNext ? "Lecture automatique activée" : "Activer la lecture automatique"}
            className={`button-contour h-6 shrink-0 rounded-full px-1.5 text-[9px] font-medium transition-colors sm:h-8 sm:px-2 sm:text-[10px] ${
              autoPlayNext
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => toggle()}
            aria-label={
              error
                ? "Réessayer la lecture"
                : finished
                  ? "Rejouer"
                  : playing
                    ? "Mettre en pause"
                    : "Lire"
            }
            className="button-contour grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-background sm:size-9"
          >
            {loading ? (
              <Spinner />
            ) : error ? (
              <Play className="size-3.5 sm:size-4" />
            ) : finished ? (
              <RotateCcw className="size-3.5 sm:size-4" />
            ) : playing ? (
              <Pause className="size-3.5 sm:size-4" />
            ) : (
              <Play className="size-3.5 sm:size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Beat suivant"
            title="Beat suivant"
            className="button-contour grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground sm:size-8"
          >
            <SkipForward className="size-3.5 sm:size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={stop}
            aria-label="Fermer le player"
            className="button-contour grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground sm:size-8"
          >
            <X className="size-3.5 sm:size-4" aria-hidden="true" />
          </button>
        </div>
        {error ? <span className="sr-only" role="status">{error}</span> : null}
      </div>
    </div>
  );
}
