import { Link } from "@tanstack/react-router";
import { Pause, Play, RotateCcw, Volume2, X } from "lucide-react";

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
    toggle,
    seek,
    setVolume,
    registerYoutubeControls,
    setYoutubePlaying,
    setYoutubeProgress,
    setYoutubeError,
    finishYoutube,
    stop,
  } = usePlayer();

  if (!current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-2 sm:px-4">
      <div className="mx-auto flex h-22 max-w-5xl items-center gap-2 rounded-xl bg-surface/95 p-1 shadow-2xl ring-1 ring-border backdrop-blur-xl sm:gap-3">
          {current.mediaSource === "youtube" && current.youtubeUrl ? (
            <YoutubeEmbed
              key={current.id}
              url={current.youtubeUrl}
              title={current.title}
              autoPlay
              hideVideo
              hideControls
              onControls={registerYoutubeControls}
              onPlay={() => setYoutubePlaying(true)}
              onPause={() => setYoutubePlaying(false)}
              onEnded={finishYoutube}
              onProgress={setYoutubeProgress}
              onError={setYoutubeError}
            />
          ) : null}
          <Link
            to="/beats/$slug"
            params={{ slug: current.slug }}
            className="size-20 shrink-0 overflow-hidden rounded-lg"
            aria-label={`Ouvrir ${current.title}`}
          >
            <Cover
              path={current.coverPath}
              alt=""
              className="size-20 rounded-lg"
              youtubeUrl={current.youtubeUrl}
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-baseline gap-2">
              <p className="truncate text-xs font-medium sm:text-sm" title={current.title}>
                {current.title}
              </p>
              {current.bpm ? (
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {current.bpm} BPM
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex items-center gap-1.5 sm:gap-2">
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
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1" title="Volume">
              <Volume2 className="size-3.5 text-muted-foreground sm:size-4" aria-hidden="true" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                aria-label="Volume"
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1 w-9 accent-(--primary) sm:w-16"
              />
            </div>
            <button
              onClick={() => toggle()}
              aria-label={finished ? "Rejouer" : playing ? "Mettre en pause" : "Lire"}
              className="button-contour grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background sm:size-9"
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
              onClick={stop}
              aria-label="Fermer le player"
              className="button-contour grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground sm:size-8"
            >
              <X className="size-4" />
            </button>
          </div>
          {error ? <span className="sr-only" role="status">{error}</span> : null}
      </div>
    </div>
  );
}
