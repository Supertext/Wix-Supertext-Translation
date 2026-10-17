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
  "translate.noLanguage": "ancora nessuna lingua Supertext: ne scelga una in {settings}",
  "translate.noLanguage.settings": "Impostazioni → Lingue",
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
  "settings.invalidCodes": "Salvato, tranne questi codici lingua, che Supertext non offre: {codes}.",
  "settings.apiKey.heading": "Chiave API Supertext",
  "settings.apiKey.label": "Chiave API",
  "settings.apiKey.placeholder": "Incolli la Sua chiave API Supertext",
  "settings.apiKey.placeholderSaved":
    "Una chiave è salvata (cifrata). Ne inserisca una nuova per sostituirla.",
  "settings.apiKey.server": "Ancora nessuna chiave propria: l'app usa la chiave impostata sul server.",
  "settings.apiKey.remove": "Rimuovi la chiave salvata",
  "settings.test": "Verifica connessione",
  "settings.testing": "Verifica in corso…",
  "keyCheck.ok": "Chiave API verificata: la connessione a Supertext funziona.",
  "keyCheck.invalid":
    "Supertext ha rifiutato la chiave API. Verifichi di aver copiato l'intera chiave oppure ne generi una nuova su {apiKey} (richiede il ruolo Admin). Non ha ancora un account Supertext? Ne crei uno su {signup}.",
  "keyCheck.missing":
    "Non è ancora stata inserita alcuna chiave API. Non ha ancora un account Supertext? Ne crei uno su {signup}. Generi la Sua chiave API su {apiKey} (richiede il ruolo Admin).",
  "keyCheck.unreachable":
    "Non è stato possibile verificare la chiave API perché Supertext non è raggiungibile. Le impostazioni sono salvate; riprovi più tardi.",
  "keyCheck.error":
    "Non è stato possibile verificare la chiave API: Supertext ha risposto con un errore ({status}). Le impostazioni sono salvate; riprovi più tardi.",
  "keyCheck.signup": "supertext.com",
  "keyCheck.checkedAt": "Ultima verifica della chiave API: {time}",
  "settings.languages.heading": "Lingue",
  "settings.languages.text":
    "La lingua Supertext in cui viene tradotta ciascuna lingua del Suo sito (per la lingua principale: da cui si traduce). Ogni elenco preseleziona la scelta ovvia: lo stesso codice se Supertext lo offre (per esempio de-CH o es), altrimenti il valore predefinito abituale (tedesco → tedesco (Germania), inglese → inglese (Stati Uniti), cinese (Taiwan) → cinese (tradizionale)). La modifichi dove le serve un’altra variante, per esempio tedesco (Svizzera). Le lingue senza una scelta ovvia (per esempio inglese (Irlanda) o svizzero tedesco) sono contrassegnate con «Nessuna lingua Supertext» e vengono tradotte solo quando ne sceglie una.",
  "settings.languages.main": "lingua principale",
  "settings.languages.site": "Lingua del sito",
  "settings.languages.supertext": "Lingua Supertext",
  "settings.languages.choose": "— Non tradotta: scelga una lingua Supertext —",
  "settings.languages.missing": "Nessuna lingua Supertext",
  "settings.languages.unmapped":
    "Queste lingue non hanno ancora una lingua Supertext e non vengono tradotte finché non ne sceglie una: {languages}.",
  "settings.style.heading": "Traduzione",
  "settings.style.label": "Forma di cortesia",
  "settings.style.default": "Lascia decidere a Supertext",
  "settings.style.more": "Formale (p. es. «Lei»)",
  "settings.style.less": "Informale (p. es. «tu»)",
  "settings.style.noPoliteness":
    "Il registro formale o informale non è disponibile per {languages}; lì decide Supertext.",
  "settings.publish": "Segna le traduzioni come pronte per la pubblicazione",
  "settings.publishHint":
    "Disattivato: le traduzioni restano in Gestione traduzioni finché non le segna come pronte per la pubblicazione.",
  "settings.reports.heading": "Informazioni sulla versione",
  "settings.reports.label": "Inviare le informazioni sulla versione a Supertext",
  "settings.reports.help":
    "Invia a Supertext l'URL del sito e le versioni di questa app e dell'ambiente di esecuzione quando salva queste impostazioni e dopo un aggiornamento. In questo modo l'assistenza Supertext vede quale versione utilizza. Non vengono trasmessi contenuti, chiavi API né dati personali.",
  "settings.reports.forcedOff":
    "Disattivato per tutti i siti sul server dell'app (SUPERTEXT_VERSION_REPORTS).",
  "settings.reports.forcedOn": "Attivato per tutti i siti sul server dell'app (SUPERTEXT_VERSION_REPORTS).",
  "settings.save": "Salva",
  "settings.about.heading": "Informazioni",
  "settings.about.version": "Supertext Translation per Wix, versione {version}",

  "error.missing_api_key":
    "Nessuna chiave API Supertext configurata. La aggiunga in Impostazioni. Non ha ancora un account Supertext? Lo crei su https://www.supertext.com/person/en/account/signin. Generi la Sua chiave API su https://www.supertext.com/en/integrations/api (richiede il ruolo Admin).",
  "error.no_file_id": "Supertext non ha restituito un ID file.",
  "error.translation_error": "Supertext non è riuscito a tradurre il documento.",
  "error.quota_exceeded": "Il Suo limite di traduzione Supertext è stato superato.",
  "error.file_deleted": "Il file Supertext è stato eliminato prima di poter essere scaricato.",
  "error.timeout": "Tempo scaduto in attesa della traduzione Supertext.",
  "error.transport_error": "Impossibile raggiungere Supertext.",
  "error.authentication_failure":
    "Autenticazione non riuscita. Verifichi la chiave API Supertext. Non ha ancora un account Supertext? Lo crei su https://www.supertext.com/person/en/account/signin. Generi la Sua chiave API su https://www.supertext.com/en/integrations/api (richiede il ruolo Admin).",
  "error.not_found": "La risorsa Supertext richiesta non è stata trovata.",
  "error.payload_too_large": "Il contenuto è troppo grande per essere tradotto da Supertext in una sola volta.",
  "error.too_many_requests": "Troppe richieste a Supertext. Riprovi tra poco.",
  "error.service_unavailable": "Il servizio Supertext non è al momento disponibile.",
  "error.unexpected_status": "Supertext ha risposto con HTTP {status}.",
  "error.invalid_language_pair":
    "Supertext non traduce da «{source}» a «{target}». Scelga un'altra lingua Supertext per questa lingua in Impostazioni → Lingue.",
  "error.invalid_language_pair_unknown":
    "Supertext non traduce in questa lingua. Scelga un'altra lingua Supertext per questa lingua in Impostazioni → Lingue.",
  "error.unsupported_language":
    "«{language}» non ha ancora una lingua Supertext, quindi non è stato inviato nulla. Scelga la sua lingua Supertext in Impostazioni → Lingue.",
  "error.unsupported_feature":
    "Supertext non offre il registro formale o informale per «{target}». Scelga «Lascia decidere a Supertext» in Impostazioni → Traduzione.",
  "error.incomplete_response": "La traduzione Supertext è tornata incompleta; per questo elemento non è stato salvato nulla.",
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
