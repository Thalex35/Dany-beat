export type AssistantHref =
  | "/"
  | "/beats"
  | "/about"
  | "/contact"
  | "/auth"
  | "/auth?redirect=%2Fprofile%23favorites"
  | "/auth?redirect=%2Fprofile%23cart";

export type AssistantAction = {
  label: string;
  href: AssistantHref;
};

export type AssistantAnswer = {
  text: string;
  actions?: AssistantAction[];
};

const catalogAction = { label: "Explorer les beats", href: "/beats" } satisfies AssistantAction;
const contactAction = { label: "Page de contact", href: "/contact" } satisfies AssistantAction;
const accountAction = { label: "Se connecter / créer un compte", href: "/auth" } satisfies AssistantAction;

function normalizeMessage(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\br\s*&\s*b\b/g, " rnb ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\br\s+b\b/g, "rnb")
    .replace(/\s+/g, " ")
    .trim();
}

export function answerSiteQuestion(input: string): AssistantAnswer | null {
  const text = normalizeMessage(input);

  if (
    /^(hi|hello|hey|hiya|howdy|yo|good morning|good afternoon|good evening|whats up|salut|bonjour|bonsoir|coucou|cc|wesh)( there| dany| assistant)?( ca va| comment ca va| how are you)?$/.test(
      text,
    )
  ) {
    return {
      text: "Salut ! Je peux t'aider à trouver un beat, utiliser le catalogue, gérer tes favoris ou ton panier, et contacter le producteur.",
      actions: [catalogAction, contactAction],
    };
  }

  if (/^(thanks|thank you|merci|merci beaucoup|je te remercie|je vous remercie)$/.test(text)) {
    return { text: "Avec plaisir ! Tu peux me demander de l'aide sur n'importe quelle rubrique du site." };
  }

  if (/^(qui es tu|who are you|what are you|es tu une ia|are you an ai)$/.test(text)) {
    return {
      text: "Je suis l'assistante locale de DANY BEATS. Je réponds aux questions courantes du site et je peux chercher des beats dans le catalogue; pour une demande particulière, je te mets en contact avec le producteur.",
      actions: [catalogAction, contactAction],
    };
  }

  if (/\b(que propose dany beats|what is dany beats|a quoi sert ce site|what is this site)\b/.test(text)) {
    return {
      text: "DANY BEATS te permet de découvrir et écouter des instrumentales, consulter leurs BPM, prix et licences, puis contacter le producteur pour demander un achat.",
      actions: [catalogAction, contactAction],
    };
  }

  if (
    /^(help|help me|i need help|aide|aide moi|besoin d aide|j ai besoin d aide|que peux tu faire|what can you do|comment ca marche( le site)?|comment utiliser( le site)?|how to use( the site)?)$/.test(
      text,
    )
  ) {
    return {
      text: "Je peux t'aider à rechercher et écouter des beats, comprendre les licences et l'achat, retrouver tes favoris ou ton panier, gérer ton compte et trouver les coordonnées du producteur.",
      actions: [catalogAction, accountAction, contactAction],
    };
  }

  if (/\b(panier|cart|checkout)\b/.test(text)) {
    return {
      text: "Pour ajouter un beat au panier, connecte-toi puis ouvre sa fiche et utilise l'icône panier. Retrouve tes articles dans Mon compte → Panier. Pour finaliser, choisis les licences puis envoie la demande préremplie sur WhatsApp.",
      actions: [
        { label: "Ouvrir mon panier", href: "/auth?redirect=%2Fprofile%23cart" },
        catalogAction,
      ],
    };
  }

  if (
    /\b(favoris?|favorites?|coeur|mes likes|my likes|liked beats|aimer les beats|beats aimes)\b/.test(
      text,
    )
  ) {
    return {
      text: "Connecte-toi puis touche le cœur sur la fiche d'un beat pour l'ajouter à tes favoris. Tu les retrouveras dans Mon compte → Beats favoris.",
      actions: [{ label: "Voir mes favoris", href: "/auth?redirect=%2Fprofile%23favorites" }, catalogAction],
    };
  }

  if (
    /\b(supprimer|effacer|delete|erase|close)\b/.test(text) &&
    /\b(compte|account|profil|profile)\b/.test(text)
  ) {
    return {
      text: "Je ne vois pas d'option pour supprimer un compte depuis le profil. Contacte le producteur pour qu'il t'indique la marche à suivre.",
      actions: [contactAction],
    };
  }

  if (
    /\b(compte|profile|profil|connexion|connecter|login|log in|sign in|sign up|signin|signup|inscription|inscrire|register|mot de passe|password)\b/.test(
      text,
    )
  ) {
    return {
      text: "La page de connexion permet de te connecter ou de créer un compte avec ton e-mail, ou avec Google. Un compte est nécessaire pour aimer des beats, commenter et utiliser le panier.",
      actions: [accountAction],
    };
  }

  if (
    /\b(acheter|achat|buy|purchase|payer|pay|paiement|payment|prix|tarif|price|cost|licence|license|carte|card|online|combien|how much|coute|expensive|cheap)\b/.test(
      text,
    )
  ) {
    return {
      text: "Les prix et licences sont indiqués sur chaque fiche de beat. Choisis une licence, puis clique sur « Demander l'achat par WhatsApp » : un message sera préparé pour le producteur. Le site ne traite pas de paiement par carte.",
      actions: [catalogAction, contactAction],
    };
  }

  if (
    /\b(commentaire|commentaires|commenter|comments|repondre|reply|leave a comment|post a comment|write a comment|comment on)\b/.test(
      text,
    )
  ) {
    return {
      text: "Ouvre la fiche du beat puis descends jusqu'à la section Commentaires. Il faut être connecté pour publier un commentaire ou une réponse.",
      actions: [catalogAction, accountAction],
    };
  }

  if (/\b(telecharger|download|extrait telechargeable)\b/.test(text)) {
    return {
      text: "Quand un extrait audio est disponible, son bouton de téléchargement apparaît sur la carte du beat ou sur sa fiche. Tu peux aussi écouter l'extrait avec le lecteur du site.",
      actions: [catalogAction],
    };
  }

  if (
    /\b(indisponible|bloque|bloquee|blocked|erreur|error|ne fonctionne pas|ne marche pas|doesnt work|doesn t work|doesn t play|cannot play|cant play|unavailable|private|removed|deleted)\b/.test(
      text,
    ) &&
    /\b(beat|audio|youtube|lecteur|player|video|lecture)\b/.test(text)
  ) {
    return {
      text: "Vérifie que le beat a bien un extrait ou un lien YouTube valide. Certaines vidéos sont privées, supprimées ou bloquent la lecture intégrée par leur propriétaire. Essaie un autre beat ou contacte le producteur si le problème persiste.",
      actions: [catalogAction, contactAction],
    };
  }

  if (
    /\b(ecouter|ecoute|lire|lecture|play|playback|audio|preview|extrait|youtube|lecteur|player|volume|repeat|repeter|loop|boucle)\b/.test(
      text,
    )
  ) {
    return {
      text: "Clique sur Lecture sur une carte ou sur la fiche d'un beat. Le lecteur fixe en bas affiche la pochette, le titre, le BPM, la progression, le volume et la répétition. Les vidéos indisponibles sur YouTube peuvent être bloquées par leur propriétaire.",
      actions: [catalogAction],
    };
  }

  if (
    /\b(bpm signifie|signification du bpm|what is bpm|what does bpm mean|bpm veut dire|que signifie bpm|que veut dire bpm)\b/.test(
      text,
    )
  ) {
    return {
      text: "Le BPM indique le tempo d'un beat (battements par minute). Il est affiché sur les cartes et les fiches; tu peux aussi filtrer le catalogue par BPM minimum et maximum.",
      actions: [catalogAction],
    };
  }

  if (
    /\b(filtre|filtrer|filters|filter|recherche|search|genre|ambiance|mood|tonalite|key|trier|tri|sort|bpm)\b/.test(
      text,
    ) &&
    parseBeatSearch(text).bpm === null
  ) {
    return {
      text: "Dans le catalogue, tu peux rechercher par titre, genre ou ambiance, puis filtrer par genre, tonalité, BPM min/max et prix maximum. Le tri permet d'afficher les beats les plus récents ou les prix croissants/décroissants.",
      actions: [catalogAction],
    };
  }

  if (/\b(naviguer|navigation|menu|site web|website|pages du site|where is the catalog|ou trouver le catalogue)\b/.test(text)) {
    return {
      text: "Le menu du site donne accès à l'accueil, au catalogue, à la page À propos et au contact. Si tu es connecté, il permet aussi d'ouvrir ton compte, tes favoris et ton panier.",
      actions: [
        { label: "Accueil", href: "/" },
        catalogAction,
        { label: "À propos", href: "/about" },
        contactAction,
      ],
    };
  }

  if (
    /\b(contact|contacter|whatsapp|email|e mail|mail|joindre|write to|sur mesure|personnalise|custom beat)\b/.test(
      text,
    )
  ) {
    return {
      text: "Pour une question ou une demande de beat sur mesure, utilise la page Contact. Le formulaire te permet d'envoyer ton message par e-mail ou WhatsApp selon les coordonnées configurées.",
      actions: [contactAction],
    };
  }

  if (/\b(qui est|a propos|about|producteur|producer|dany)\b/.test(text)) {
    return {
      text: "La page À propos présente le producteur, son parcours et ses styles de production.",
      actions: [{ label: "À propos du producteur", href: "/about" }, contactAction],
    };
  }

  return null;
}

const SEARCH_STOP_WORDS = new Set(
  "a about all am an and are as at avec au aux be been beat beats because but by can ce cette could des de did do does doing du en est et for from get gets give got had have has he her here him his how i if in into is it its je la le les me moi mon my need nor not of on or our out please peux pouvez pour recommander recommande recherche rechercher she so than that the them then there these they this through to trop tu un une up us veux voulez voudrais was we were what when where which who why with would you your trouver trouve chercher cherche cherchez find searching search looking recommend see show want wanna bpm instrumental instrumentale instrumentales".split(
    " ",
  ),
);

const BEAT_SEARCH_CONTEXT =
  /\b(beat|beats|instrumental|instrumentale|instrumentales|rap|trap|drill|afro|rnb|sad|sombre|dark|chill|love|amapiano|hip hop|boom bap)\b/;
const SEARCH_ACTION =
  /\b(cherche|chercher|trouve|trouver|recommande|recommander|suggest|suggestion|find|search|recommend|looking for)\b/;

export function parseBeatSearch(input: string) {
  const text = normalizeMessage(input);
  const bpmMatch = text.match(/\b(\d{2,3})\s*bpm\b|\bbpm\s*(\d{2,3})\b/);
  const bpm = Number(bpmMatch?.[1] ?? bpmMatch?.[2]) || null;
  const terms = text
    .replace(/\b\d{2,3}\s*bpm\b|\bbpm\s*\d{2,3}\b/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !SEARCH_STOP_WORDS.has(word))
    .slice(0, 8);

  return { bpm, terms };
}

export function isBeatSearchRequest(input: string) {
  const text = normalizeMessage(input);
  const { bpm } = parseBeatSearch(input);
  const terms = parseBeatSearch(input).terms;
  const shortKeywordSearch =
    terms.length > 0 &&
    text.split(/\s+/).length <= 3 &&
    !/\b(what|where|when|which|who|why|how|can|could|do|does|is|are|comment|ou|quand|quel|quelle|qui|pourquoi|est|sont)\b/.test(
      text,
    );
  return (
    bpm !== null ||
    SEARCH_ACTION.test(text) ||
    BEAT_SEARCH_CONTEXT.test(text) ||
    shortKeywordSearch
  );
}
