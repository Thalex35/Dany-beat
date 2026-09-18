/**
 * Fond vidéo du hero : la vidéo de l'utilisateur joue en boucle, sans son,
 * derrière le contenu. Un poster (première image) s'affiche pendant le
 * chargement, et un voile sombre garde le texte lisible par-dessus.
 */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/hero-bg.mp4"
        poster="/video/hero-bg-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      {/* Voile pour garder le texte lisible par-dessus la vidéo */}
      <div className="absolute inset-0 bg-background/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-transparent" />
    </div>
  );
}
