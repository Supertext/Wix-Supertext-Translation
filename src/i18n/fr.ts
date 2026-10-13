import type { Messages } from "./en.js";

// French (formal "vous"), with the terms of Wix's French dashboard (site, langue principale,
// Gestionnaire de traduction). A no-break space ( ) goes before ? ! : ;
export const fr: Messages = {
  "nav.translate": "Traduire",
  "nav.settings": "Paramètres",

  "apiKeyHelp.text":
    "Pas encore de compte Supertext ? {signup}. Générez votre clé API sur {apiKey} (rôle Admin requis).",
  "apiKeyHelp.signup": "Créez-en un sur supertext.com",
  "apiKeyHelp.apiKey": "supertext.com → Integrations → API",

  "translate.heading": "Traduire avec Supertext",
  "translate.intro":
    "Traduisez le contenu de votre site dans ses autres langues avec Supertext AI. Les traductions sont enregistrées dans Wix Multilingual, où vous pouvez les vérifier dans le Gestionnaire de traduction.",
  "translate.noKey.heading": "Ajoutez votre clé API Supertext",
  "translate.noKey.text": "L'application a besoin d'une clé API Supertext pour traduire. Saisissez-la sous {settings}.",
  "translate.noKey.settings": "Paramètres",
  "translate.oneLanguage.heading": "Ajoutez une deuxième langue",
  "translate.oneLanguage.text":
    "Votre site n'a qu'une seule langue. Ajoutez des langues avec Wix Multilingual dans le tableau de bord de votre site, puis revenez ici.",
  "translate.noSchemas": "Wix Multilingual n'a pas encore de contenu traduisible sur ce site.",
  "translate.step1": "1. Choisissez le contenu",
  "translate.type": "Type de contenu",
  "translate.otherApps": "Autres",
  "translate.empty": "Rien de ce type pour l'instant.",
  "translate.item": "Élément",
  "translate.selectAll": "Tout sélectionner sur cette page ({count})",
  "translate.firstPage": "Première page",
  "translate.nextPage": "Page suivante",
  "translate.step2": "2. Choisissez les langues",
  "translate.from": "Traduction depuis {language}, la langue principale de votre site.",
  "translate.hidden": "masquée sur le site",
  "translate.overwrite": "Remplacer les traductions existantes",
  "translate.overwriteHint": "Sans cette option, les champs déjà traduits sont conservés.",
  "translate.overwriteWarning":
    "Les champs déjà traduits seront remplacés, y compris les modifications faites à la main dans le Gestionnaire de traduction.",
  "translate.submit": "Traduire avec Supertext",
  "translate.submitCount.one": "Traduire {count} élément avec Supertext",
  "translate.submitCount.other": "Traduire {count} éléments avec Supertext",
  "translate.selectSomething": "Sélectionnez au moins un élément et une langue.",
  "translate.starting": "Démarrage…",

  "state.none": "Non traduit",
  "state.partial": "Partiellement traduit",
  "state.done": "Traduit",

  "job.heading": "Traduction",
  "job.running": "Traduction en cours… {completed} sur {total}",
  "job.done": "Terminé : {translated} traduits, {unchanged} inchangés, {failed} en échec.",
  "job.failed": "La traduction s'est arrêtée : {reason}",
  "job.translated.one": "Traduit ({count} champ)",
  "job.translated.other": "Traduit ({count} champs)",
  "job.kept": "{count} conservés",
  "job.tooLong": "{count} trop longs pour Wix, non enregistrés",
  "job.unchanged": "Déjà traduit, inchangé",
  "job.review": "Vérifiez les traductions dans le {manager}.",
  "job.manager": "Gestionnaire de traduction",

  "settings.heading": "Paramètres Supertext",
  "settings.saved": "Paramètres enregistrés.",
  "settings.invalidCodes":
    "Enregistré, sauf ces codes de langue, qui ne sont pas des codes valides comme de-CH : {codes}.",
  "settings.apiKey.heading": "Clé API Supertext",
  "settings.apiKey.label": "Clé API",
  "settings.apiKey.placeholder": "Collez votre clé API Supertext",
  "settings.apiKey.placeholderSaved":
    "Une clé est enregistrée (chiffrée). Saisissez-en une nouvelle pour la remplacer.",
  "settings.apiKey.server": "Pas encore de clé propre : l'application utilise la clé définie sur le serveur.",
  "settings.apiKey.remove": "Supprimer la clé enregistrée",
  "settings.test": "Tester la connexion",
  "settings.testing": "Test en cours…",
  "settings.testOk": "Connecté. La clé API fonctionne.",
  "settings.languages.heading": "Langues",
  "settings.languages.text":
    "Le code de langue vers lequel Supertext traduit pour chacune des langues de votre site. Supertext a besoin d'une région, par exemple de-CH pour l'allemand de Suisse ou fr-FR pour le français de France.",
  "settings.languages.main": "langue principale",
  "settings.style.heading": "Traduction",
  "settings.style.label": "Forme d'adresse",
  "settings.style.default": "Laisser Supertext décider",
  "settings.style.more": "Formelle (p. ex. « vous »)",
  "settings.style.less": "Informelle (p. ex. « tu »)",
  "settings.publish": "Marquer les traductions comme prêtes à être publiées",
  "settings.publishHint":
    "Désactivé : les traductions attendent dans le Gestionnaire de traduction jusqu'à ce que vous les marquiez comme prêtes à être publiées.",
  "settings.save": "Enregistrer",
  "settings.about.heading": "À propos",
  "settings.about.version": "Supertext Translation pour Wix, version {version}",

  "error.missing_api_key":
    "Aucune clé API Supertext n'est configurée. Ajoutez-la sous Paramètres. Pas encore de compte Supertext ? Créez-en un sur https://www.supertext.com/person/en/account/signin. Générez votre clé API sur https://www.supertext.com/en/integrations/api (rôle Admin requis).",
  "error.no_file_id": "Supertext n'a pas renvoyé d'identifiant de fichier.",
  "error.translation_error": "Supertext n'a pas pu traduire le document.",
  "error.quota_exceeded": "Votre limite de traduction Supertext est dépassée.",
  "error.file_deleted": "Le fichier Supertext a été supprimé avant d'avoir pu être téléchargé.",
  "error.timeout": "Délai dépassé en attendant la traduction Supertext.",
  "error.transport_error": "Impossible de joindre Supertext.",
  "error.authentication_failure":
    "L'authentification a échoué. Veuillez vérifier la clé API Supertext. Pas encore de compte Supertext ? Créez-en un sur https://www.supertext.com/person/en/account/signin. Générez votre clé API sur https://www.supertext.com/en/integrations/api (rôle Admin requis).",
  "error.not_found": "La ressource Supertext demandée est introuvable.",
  "error.payload_too_large": "Le contenu est trop volumineux pour être traduit en une fois par Supertext.",
  "error.too_many_requests": "Trop de requêtes envoyées à Supertext. Veuillez réessayer dans un instant.",
  "error.service_unavailable": "Le service Supertext est actuellement indisponible.",
  "error.unexpected_status": "Supertext a répondu avec HTTP {status}.",
  "error.invalid_language_pair":
    "Supertext ne traduit pas de « {source} » vers « {target} ». Définissez le code Supertext de cette langue sous Paramètres → Langues, avec une région (p. ex. de-CH, fr-FR, en-US).",
  "error.invalid_language_pair_unknown":
    "Supertext ne traduit pas vers cette langue. Définissez le code Supertext de cette langue sous Paramètres → Langues, avec une région (p. ex. de-CH, fr-FR, en-US).",
  "error.incomplete_response": "La traduction Supertext est revenue incomplète\u00a0; rien n'a été enregistré pour cet élément.",
  "error.sourceMissing": "Le texte original de cet élément est introuvable.",
  "error.schemaMissing": "Ce type de contenu n'existe plus sur le site.",
  "error.multilingualMissing":
    "Wix Multilingual n'est pas configuré sur ce site. Ajoutez d'abord l'application Wix Multilingual et une deuxième langue.",
  "error.wixAuth":
    "Wix a refusé la requête. Réinstallez l'application pour lui accorder les autorisations nécessaires.",
  "error.wixNotConfigured": "Il manque à l'application ses identifiants Wix (WIX_APP_ID, WIX_APP_SECRET).",
  "error.wixUnreachable": "Impossible de joindre Wix : {reason}",
  "error.wixUnavailable": "Wix est actuellement indisponible. Veuillez réessayer dans un instant.",
  "error.wixHttp": "Wix a répondu avec HTTP {status}.",
  "error.wixRejected": "Wix a refusé la traduction.",
  "error.interrupted":
    "L'application a redémarré pendant la traduction. Relancez-la ; les éléments terminés sont conservés.",
  "error.session": "Cette page a expiré. Rechargez-la depuis le tableau de bord Wix.",
};
