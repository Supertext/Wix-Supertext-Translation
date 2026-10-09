import type { Messages } from "./en.js";

// Italian (formal "Lei"), with the terms of Wix's Italian dashboard (sito, lingua principale,
// Gestione traduzioni).
export const it: Messages = {
  "nav.translate": "Traduci",
  "nav.settings": "Impostazioni",

  "apiKeyHelp.text":
    "Non ha ancora un account Supertext? {signup}. Generi la Sua chiave API su {apiKey} (richiede il ruolo Admin).",
  "apiKeyHelp.signup": "Lo crei su supertext.com",
  "apiKeyHelp.apiKey": "supertext.com → Integrations → API",

  "translate.heading": "Traduci con Supertext",
  "translate.intro":
    "Traduca i contenuti del Suo sito nelle altre lingue con Supertext AI. Le traduzioni vengono salvate in Wix Multilingual, dove può controllarle in Gestione traduzioni.",
  "translate.noKey.heading": "Aggiunga la Sua chiave API Supertext",
  "translate.noKey.text":
    "L'app ha bisogno di una chiave API Supertext per poter tradurre. La inserisca in {settings}.",
  "translate.noKey.settings": "Impostazioni",
  "translate.oneLanguage.heading": "Aggiunga una seconda lingua",
  "translate.oneLanguage.text":
    "Il Suo sito ha una sola lingua. Aggiunga altre lingue con Wix Multilingual nel pannello di controllo del sito, poi torni qui.",
  "translate.noSchemas": "Wix Multilingual non ha ancora contenuti traducibili su questo sito.",
  "translate.step1": "1. Scelga i contenuti",
  "translate.type": "Tipo di contenuto",
  "translate.otherApps": "Altro",
  "translate.empty": "Ancora nessun elemento di questo tipo.",
  "translate.item": "Elemento",
  "translate.selectAll": "Seleziona tutto in questa pagina ({count})",
  "translate.firstPage": "Prima pagina",
  "translate.nextPage": "Pagina successiva",
  "translate.step2": "2. Scelga le lingue",
  "translate.from": "Si traduce da {language}, la lingua principale del Suo sito.",
  "translate.hidden": "nascosta sul sito",
  "translate.overwrite": "Sovrascrivi le traduzioni esistenti",
  "translate.overwriteHint": "Senza questa opzione, i campi già tradotti restano invariati.",
  "translate.overwriteWarning":
    "I campi già tradotti verranno sostituiti, comprese le modifiche fatte a mano in Gestione traduzioni.",
  "translate.submit": "Traduci con Supertext",
  "translate.submitCount.one": "Traduci {count} elemento con Supertext",
  "translate.submitCount.other": "Traduci {count} elementi con Supertext",
  "translate.selectSomething": "Selezioni almeno un elemento e una lingua.",
  "translate.starting": "Avvio…",

  "state.none": "Non tradotto",
  "state.partial": "Tradotto in parte",
  "state.done": "Tradotto",

  "job.heading": "Traduzione",
  "job.running": "Traduzione in corso… {completed} di {total}",
  "job.done": "Fatto: {translated} tradotti, {unchanged} invariati, {failed} non riusciti.",
  "job.failed": "La traduzione si è interrotta: {reason}",
  "job.translated.one": "Tradotto ({count} campo)",
  "job.translated.other": "Tradotto ({count} campi)",
  "job.kept": "{count} mantenuti",
  "job.tooLong": "{count} troppo lunghi per Wix, non salvati",
  "job.unchanged": "Già tradotto, invariato",
  "job.review": "Controlli le traduzioni in {manager}.",
  "job.manager": "Gestione traduzioni",

  "settings.heading": "Impostazioni Supertext",
  "settings.saved": "Impostazioni salvate.",
  "settings.invalidCodes":
    "Salvato, tranne questi codici lingua, che non sono codici validi come de-CH: {codes}.",
  "settings.apiKey.heading": "Chiave API Supertext",
  "settings.apiKey.label": "Chiave API",
  "settings.apiKey.placeholder": "Incolli la Sua chiave API Supertext",
  "settings.apiKey.placeholderSaved":
    "Una chiave è salvata (cifrata). Ne inserisca una nuova per sostituirla.",
  "settings.apiKey.server": "Ancora nessuna chiave propria: l'app usa la chiave impostata sul server.",
  "settings.apiKey.remove": "Rimuovi la chiave salvata",
  "settings.test": "Verifica connessione",
  "settings.testing": "Verifica in corso…",
  "settings.testOk": "Connesso. La chiave API funziona.",
  "settings.languages.heading": "Lingue",
  "settings.languages.text":
    "Il codice lingua in cui Supertext traduce per ciascuna lingua del Suo sito. Supertext ha bisogno di una regione, per esempio de-CH per il tedesco svizzero o fr-FR per il francese di Francia.",
  "settings.languages.main": "lingua principale",
  "settings.style.heading": "Traduzione",
  "settings.style.label": "Forma di cortesia",
  "settings.style.default": "Lascia decidere a Supertext",
  "settings.style.more": "Formale (p. es. «Lei»)",
  "settings.style.less": "Informale (p. es. «tu»)",
  "settings.publish": "Segna le traduzioni come pronte per la pubblicazione",
  "settings.publishHint":
    "Disattivato: le traduzioni restano in Gestione traduzioni finché non le segna come pronte per la pubblicazione.",
  "settings.save": "Salva",
  "settings.about.heading": "Informazioni",
  "settings.about.version": "Supertext Translation per Wix, versione {version}",

  "error.noApiKey":
    "Nessuna chiave API Supertext configurata. La aggiunga in Impostazioni. Non ha ancora un account Supertext? Lo crei su https://www.supertext.com/person/en/account/signin. Generi la Sua chiave API su https://www.supertext.com/en/integrations/api (richiede il ruolo Admin).",
  "error.noFileId": "Supertext non ha restituito un ID file.",
  "error.translationFailed": "Supertext non è riuscito a tradurre il documento.",
  "error.limitExceeded": "Il Suo limite di traduzione Supertext è stato superato.",
  "error.fileDeleted": "Il file Supertext è stato eliminato prima di poter essere scaricato.",
  "error.timeout": "Tempo scaduto in attesa della traduzione Supertext.",
  "error.emptyTranslation": "Il documento tradotto era vuoto.",
  "error.unreachable": "Impossibile raggiungere Supertext: {reason}",
  "error.auth":
    "Autenticazione non riuscita. Verifichi la chiave API Supertext. Non ha ancora un account Supertext? Lo crei su https://www.supertext.com/person/en/account/signin. Generi la Sua chiave API su https://www.supertext.com/en/integrations/api (richiede il ruolo Admin).",
  "error.notFound": "La risorsa Supertext richiesta non è stata trovata.",
  "error.tooLarge": "Il contenuto è troppo grande per essere tradotto da Supertext in una sola volta.",
  "error.rateLimited": "Troppe richieste a Supertext. Riprovi tra poco.",
  "error.unavailable": "Il servizio Supertext non è al momento disponibile.",
  "error.http": "Supertext ha risposto con HTTP {status}.",
  "error.languagePair":
    "Supertext non traduce da «{source}» a «{target}». Imposti il codice Supertext di questa lingua in Impostazioni → Lingue, con una regione (p. es. de-CH, fr-FR, en-US).",
  "error.languagePairUnknown":
    "Supertext non traduce in questa lingua. Imposti il codice Supertext di questa lingua in Impostazioni → Lingue, con una regione (p. es. de-CH, fr-FR, en-US).",
  "error.incomplete":
    "Supertext ha restituito {received} testi su {sent}; per questo elemento non è stato salvato nulla.",
  "error.sourceMissing": "Il testo originale di questo elemento non è stato trovato.",
  "error.schemaMissing": "Questo tipo di contenuto non esiste più sul sito.",
  "error.multilingualMissing":
    "Wix Multilingual non è configurato su questo sito. Aggiunga prima l'app Wix Multilingual e una seconda lingua.",
  "error.wixAuth": "Wix ha rifiutato la richiesta. Reinstalli l'app per concederle le autorizzazioni necessarie.",
  "error.wixNotConfigured": "All'app mancano le credenziali Wix (WIX_APP_ID, WIX_APP_SECRET).",
  "error.wixUnreachable": "Impossibile raggiungere Wix: {reason}",
  "error.wixUnavailable": "Wix non è al momento disponibile. Riprovi tra poco.",
  "error.wixHttp": "Wix ha risposto con HTTP {status}.",
  "error.wixRejected": "Wix ha rifiutato la traduzione.",
  "error.interrupted":
    "L'app è stata riavviata durante la traduzione. La avvii di nuovo; gli elementi completati vengono mantenuti.",
  "error.session": "Questa pagina è scaduta. La ricarichi dal pannello di controllo Wix.",
};
