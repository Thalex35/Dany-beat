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

function isHaitianCreole(text: string) {
  return /\b(mwen|ou|nou|mizik|ki|kijan|kisa|cheche|chache|bezwen|vle|tanpri|bonjou|konpa)\b/.test(text);
}

const DEFINITION_QUESTION =
  /\b(what is|what does|meaning of|define|explain|que signifie|que veut dire|c est quoi|qu est ce que|explique|ki sa|kisa|sa vle di|kisa yo rele|kijan)\b/;

export function answerSiteQuestion(input: string): AssistantAnswer | null {
  const text = normalizeMessage(input);

  if (
    /^(hi|hello|hey|hiya|howdy|yo|good morning|good afternoon|good evening|whats up|salut|bonjour|bonsoir|bonjou|coucou|cc|wesh)( there| dany| assistant)?( ca va| comment ca va| kijan ou ye| how are you)?$/.test(
      text,
    )
  ) {
    if (isHaitianCreole(text)) {
      return {
        text: "Bonjou! Mwen ka ede w jwenn yon beat, konprann BPM, estil ak anbyans mizik, oswa sèvi ak katalòg la. Kisa w ap chèche?",
        actions: [catalogAction, contactAction],
      };
    }
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
    /\b(acheter|achat|buy|purchase|payer|pay|paiement|payment|prix|tarif|price|cost|licence|license|lisans|carte|card|online|combien|how much|coute|expensive|cheap)\b/.test(
      text,
    )
  ) {
    if (isHaitianCreole(text)) {
      return {
        text: "Pri ak kondisyon lisans yo parèt sou chak fich beat. Chwazi lisans ki koresponn ak jan w ap itilize mizik la, epi kontakte pwodiktè a sou WhatsApp pou mande acha a. Sit la pa pran peman pa kat.",
        actions: [catalogAction, contactAction],
      };
    }
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
    /\b(bpm signifie|signification du bpm|what is bpm|what does bpm mean|bpm veut dire|que signifie bpm|que veut dire bpm|ki sa bpm|kisa bpm|kijan bpm|bpm sa vle di)\b/.test(
      text,
    )
  ) {
    if (isHaitianCreole(text)) {
      return {
        text: "BPM vle di batman pa minit; se vitès ritm mizik la. Yon BPM ba sonnen pi dousman, yon BPM wo sonnen pi vit. Ou ka chèche beat selon BPM nan katalòg la.",
        actions: [catalogAction],
      };
    }
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

export function answerMusicQuestion(input: string): AssistantAnswer | null {
  const text = normalizeMessage(input);
  const asksForDefinition =
    (DEFINITION_QUESTION.test(text) &&
      !(/\bkijan\b/.test(text) && SEARCH_ACTION.test(text))) ||
    text.split(/\s+/).length === 1;
  if (!asksForDefinition) return null;

  const creole = isHaitianCreole(text);
  if (/\b(bpm|tempo)\b/.test(text)) {
    return {
      text: creole
        ? "BPM vle di batman pa minit; se vitès ritm mizik la. Yon BPM ba sonnen pi dousman, yon BPM wo sonnen pi vit. Ou ka chèche beat selon BPM nan katalòg la."
        : "Le BPM (battements par minute) mesure le tempo d'un morceau. Un BPM bas donne une sensation plus lente; un BPM élevé, plus rapide. Tu peux filtrer le catalogue par BPM.",
      actions: [catalogAction],
    };
  }
  if (/\b(tonalite|key|musical key)\b/.test(text)) {
    return {
      text: creole
        ? "Tonalite a se nòt prensipal yon mizik bati sou li. Lè vwa a ak enstrimantal la nan menm tonalite, yo mache pi byen ansanm; ou ka wè tonalite yon beat sou fich li si enfòmasyon an disponib."
        : "La tonalité indique la note et la gamme qui servent de base à un morceau. Une voix et une instrumentale dans des tonalités compatibles s'accordent mieux; la tonalité d'un beat peut être indiquée sur sa fiche.",
      actions: [catalogAction],
    };
  }
  if (/\b(melodie|melody|harmonie|harmony|accord|accords|chord|chords|gamme|scale)\b/.test(text)) {
    return {
      text: creole
        ? "Melodi se pati mizik ou ka chante oswa sonje fasil; amoni se nòt ak akò ki akonpaye l. Akò yo fòme koulè amoni an, epi yo ka bay yon mizik yon santiman lajwa, tristès oswa tansyon."
        : "La mélodie est la suite de notes que l'on peut chanter ou retenir; l'harmonie est l'ensemble des notes et accords qui l'accompagnent. Les accords donnent sa couleur et son émotion à la musique.",
    };
  }
  if (/\b(groove|rythme|rhythm|mesure|measure|bar|bars|barres)\b/.test(text)) {
    return {
      text: creole
        ? "Ritm se fason tan yo ak aksan yo òganize nan mizik. Yon mezi se yon gwoup batman; nan rap, yon bar souvan koresponn ak yon mezi, epi groove la se sansasyon mouvman ritm nan bay."
        : "Le rythme organise les temps et les accents. Une mesure regroupe plusieurs temps; en rap, une barre correspond souvent à une mesure, tandis que le groove désigne la sensation de mouvement créée par le rythme.",
    };
  }
  if (/\b(stems|pistes separees)\b/.test(text)) {
    return {
      text: creole
        ? "Stems yo se diferan pati odyo yon mizik separe, tankou tanbou, bas ak melodi. Yo itil pou fè remix oswa ajiste miks la; disponiblite yo depann de lisans beat la."
        : "Les stems sont les différentes parties audio séparées d'un morceau, comme la batterie, la basse et la mélodie. Ils servent au remix ou à un mixage personnalisé; leur disponibilité dépend de la licence du beat.",
    };
  }
  if (/\b(sample|sampling)\b/.test(text)) {
    return {
      text: creole
        ? "Sampling se lè yo pran yon ti pati nan yon anrejistreman pou sèvi avè l nan yon lòt mizik. Anvan piblikasyon, fòk dwa sou echantiyon an otorize oswa echantiyon an lib pou itilize."
        : "Le sampling consiste à réutiliser un extrait d'un enregistrement dans un autre morceau. Avant toute publication, il faut vérifier que l'échantillon est autorisé ou libre de droits.",
    };
  }
  if (
    /\b(mixage|mixing|mastering|masterisation|compression|egalisation|equalization|equalisation)\b/.test(
      text,
    )
  ) {
    return {
      text: creole
        ? "Mixaj la balanse vwa ak enstriman yo nan menm mizik la. Mastering la se dènye ajisteman ki bay mizik la yon son regilye ak yon nivo apwopriye sou diferan aparèy."
        : "Le mixage équilibre les voix et les instruments dans le morceau. Le mastering est l'étape finale qui donne un son cohérent et un niveau adapté aux différents appareils.",
    };
  }
  if (/\b(mood|ambiance|anbyans|emotion|emotions)\b/.test(text)) {
    return {
      text: creole
        ? "Anbyans lan se santiman oswa atmosfè mizik la bay, tankou tris, nwa, kalm oswa enèjik. Li ede w chwazi yon beat ki mache ak emosyon chante w la."
        : "L'ambiance (ou le mood) décrit l'émotion ou l'atmosphère d'un morceau, par exemple triste, sombre, calme ou énergique. Elle aide à choisir un beat qui correspond à l'intention d'une chanson.",
      actions: [catalogAction],
    };
  }
  if (
    DEFINITION_QUESTION.test(text) &&
    /\b(trap|drill|afrobeats|afrobeat|amapiano|konpa|kompa|zouk|reggae|dancehall|boom bap|hip hop|rnb|house|techno|jazz|gospel)\b/.test(
      text,
    )
  ) {
    if (/\b(konpa|kompa)\b/.test(text)) {
      return {
        text: creole
          ? "Konpa se yon estil mizik ak dans ki soti Ayiti, ak ritm pa li ak anpil enfliyans nan mizik Karayib la."
          : "Le konpa est un style de musique et de danse originaire d'Haïti, reconnaissable à son rythme et à ses influences caribéennes.",
      };
    }
    if (/\b(drill|trap|afrobeats|afrobeat|amapiano|boom bap|hip hop|rnb|house|techno)\b/.test(text)) {
      return {
        text: creole
          ? "Se yon estil oswa sou-estil mizik ki gen pwòp ritm, son ak enstriman pa li. Si w di m ki non an oswa ki anbyans ou renmen, m ap ede w jwenn yon beat ki mache avè l."
          : "C'est un genre ou sous-genre musical avec ses propres rythmes, sons et instruments. Dis-moi le style ou l'ambiance que tu aimes et je t'aiderai à trouver un beat correspondant.",
        actions: [catalogAction],
      };
    }
    return {
      text: creole
        ? "Se yon estil mizik ki gen pwòp ritm ak enstriman pa li. Di m ki kalite son w ap chèche a pou m ka ede w jwenn yon beat ki mache avè l."
        : "C'est un genre musical avec ses propres rythmes et instruments. Décris le son que tu cherches et je t'aiderai à trouver un beat correspondant.",
      actions: [catalogAction],
    };
  }

  if (
    DEFINITION_QUESTION.test(text) &&
    /\b(mizik|music|musique|chanson|song|instrumental|beat|rap|vocal|voix|chant|lyrics|paroles|flow|production)\b/.test(
      text,
    )
  ) {
    return {
      text: creole
        ? "Mwen ka ede w konprann estil mizik, ritm, BPM, tonalite, melodi, miksaj ak lisans beat. Di m ki konsèp oswa ki son ou vle dekouvri."
        : "Je peux expliquer les styles, le rythme, le BPM, la tonalité, la mélodie, le mixage et les licences de beats. Dis-moi le concept ou le son que tu veux découvrir.",
      actions: [catalogAction],
    };
  }

  if (
    !isBeatSearchRequest(input) &&
    /\b(mizik|music|musique|chanson|song|instrumental|beat|rap|vocal|voix|chant|lyrics|paroles|flow|production)\b/.test(
      text,
    )
  ) {
    return {
      text: creole
        ? "Mwen ka ede w sou estil mizik, ekriti chante, vwa, pwodiksyon beat, ritm, BPM ak lisans. Poze m yon kesyon presi oswa dekri son w ap chèche a."
        : "Je peux t'aider sur les styles, l'écriture, la voix, la production de beats, le rythme, le BPM et les licences. Pose une question précise ou décris le son que tu cherches.",
      actions: [catalogAction],
    };
  }

  return null;
}

const SEARCH_STOP_WORDS = new Set(
  "a about all am an and are as at avec au aux be been because but by can ce cette could des de did do does doing du en est et for from get gets give got had have has he her here him his how i if in into is it its je la le les me moi mon my need nor not of on or our out please peux pouvez pour recommander recommande recherche rechercher she so than that the them then there these they this through to trop tu un une up us veux voulez voudrais was we were what when where which who why with would you your trouver trouve chercher cherche cherchez find searching search looking recommend see show want wanna bpm instrumental instrumentale instrumentales a an ap avek byen chak depi di e epi eske gen k ap ka ke ki la li lot mwen nan ni nou oswa pa pral sa se sou tan te tout yon yo mizik music musique chanson song bezwen chache cheche jwenn".split(
    " ",
  ),
);

const BEAT_SEARCH_CONTEXT =
  /\b(beat|beats|instrumental|instrumentale|instrumentales|rap|trap|drill|afro|afrobeats|rnb|sad|sombre|dark|chill|love|amapiano|hip hop|boom bap|konpa|kompa|zouk|reggae|dancehall|gospel|jazz|soul|funk|house|techno|pop|rock|lofi|lo fi|reggaeton)\b/;
const SEARCH_ACTION =
  /\b(cherche|chercher|trouve|trouver|recommande|recommander|suggest|suggestion|find|search|recommend|looking for|chache|cheche|jwenn|rekomande|konsey)\b/;

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
    !/\b(what|where|when|which|who|why|how|can|could|do|does|is|are|comment|ou|quand|quel|quelle|qui|pourquoi|est|sont|ki|kisa|kijan|poukisa)\b/.test(
      text,
    );
  return (
    bpm !== null ||
    SEARCH_ACTION.test(text) ||
    BEAT_SEARCH_CONTEXT.test(text) ||
    shortKeywordSearch
  );
}
