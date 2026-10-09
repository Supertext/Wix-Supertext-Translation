// English: the source language and the fallback for missing keys.
// Placeholders in braces ({count}, {settings}) are filled in by the code;
// never translate them. Keys ending in .one / .other are plural forms.

export const en = {
  // Navigation
  "nav.translate": "Translate",
  "nav.settings": "Settings",

  // API key help (shown wherever the key is mentioned)
  "apiKeyHelp.text":
    "No Supertext account yet? {signup}. Generate your API key at {apiKey} (requires the Admin role).",
  "apiKeyHelp.signup": "Create one at supertext.com",
  "apiKeyHelp.apiKey": "supertext.com → Integrations → API",

  // Translate page
  "translate.heading": "Translate with Supertext",
  "translate.intro":
    "Translate your site's content into its other languages with Supertext AI. Translations are saved in Wix Multilingual, where you can review them in the Translation Manager.",
  "translate.noKey.heading": "Add your Supertext API key",
  "translate.noKey.text": "The app needs a Supertext API key before it can translate. Enter it under {settings}.",
  "translate.noKey.settings": "Settings",
  "translate.oneLanguage.heading": "Add a second language",
  "translate.oneLanguage.text":
    "Your site has only one language. Add languages with Wix Multilingual in your site's dashboard, then come back here.",
  "translate.noSchemas": "Wix Multilingual has no translatable content on this site yet.",
  "translate.step1": "1. Choose what to translate",
  "translate.type": "Content type",
  "translate.otherApps": "Other",
  "translate.empty": "Nothing of this type yet.",
  "translate.item": "Item",
  "translate.selectAll": "Select all on this page ({count})",
  "translate.firstPage": "First page",
  "translate.nextPage": "Next page",
  "translate.step2": "2. Choose the languages",
  "translate.from": "Translating from {language}, your site's main language.",
  "translate.hidden": "hidden on the site",
  "translate.overwrite": "Overwrite existing translations",
  "translate.overwriteHint": "Without this option, fields that are translated already are kept.",
  "translate.overwriteWarning":
    "Fields that are translated already will be replaced, including changes made by hand in the Translation Manager.",
  "translate.submit": "Translate with Supertext",
  "translate.submitCount.one": "Translate {count} item with Supertext",
  "translate.submitCount.other": "Translate {count} items with Supertext",
  "translate.selectSomething": "Select at least one item and one language.",
  "translate.starting": "Starting…",

  // Item states
  "state.none": "Not translated",
  "state.partial": "Partly translated",
  "state.done": "Translated",

  // Progress and results
  "job.heading": "Translation",
  "job.running": "Translating… {completed} of {total}",
  "job.done": "Done: {translated} translated, {unchanged} unchanged, {failed} failed.",
  "job.failed": "The translation stopped: {reason}",
  "job.translated.one": "Translated ({count} field)",
  "job.translated.other": "Translated ({count} fields)",
  "job.kept": "{count} kept",
  "job.tooLong": "{count} too long for Wix, not saved",
  "job.unchanged": "Already translated, unchanged",
  "job.review": "Review the translations in the {manager}.",
  "job.manager": "Translation Manager",

  // Settings page
  "settings.heading": "Supertext settings",
  "settings.saved": "Settings saved.",
  "settings.invalidCodes": "Saved, except these language codes, which aren't valid codes like de-CH: {codes}.",
  "settings.apiKey.heading": "Supertext API key",
  "settings.apiKey.label": "API key",
  "settings.apiKey.placeholder": "Paste your Supertext API key",
  "settings.apiKey.placeholderSaved": "A key is saved (stored encrypted). Enter a new one to replace it.",
  "settings.apiKey.server": "No key of your own yet: the app uses the key set on the server.",
  "settings.apiKey.remove": "Remove the saved key",
  "settings.test": "Test connection",
  "settings.testing": "Testing…",
  "settings.testOk": "Connected. The API key works.",
  "settings.languages.heading": "Languages",
  "settings.languages.text":
    "The language code Supertext translates into for each of your site's languages. Supertext needs a region, for example de-CH for Swiss German or fr-FR for French as spoken in France.",
  "settings.languages.main": "main language",
  "settings.style.heading": "Translation",
  "settings.style.label": "Form of address",
  "settings.style.default": "Let Supertext decide",
  "settings.style.more": "Formal (e.g. German “Sie”)",
  "settings.style.less": "Informal (e.g. German “du”)",
  "settings.publish": "Mark translations as ready to publish",
  "settings.publishHint":
    "Off: translations wait in the Translation Manager until you mark them ready to publish.",
  "settings.save": "Save",
  "settings.about.heading": "About",
  "settings.about.version": "Supertext Translation for Wix, version {version}",

  // Errors from Supertext and Wix (codes set by LocalizedError)
  "error.noApiKey":
    "No Supertext API key configured. Add it under Settings. No Supertext account yet? Create one at https://www.supertext.com/person/en/account/signin. Generate your API key at https://www.supertext.com/en/integrations/api (requires the Admin role).",
  "error.noFileId": "Supertext did not return a file id.",
  "error.translationFailed": "Supertext failed to translate the document.",
  "error.limitExceeded": "Your Supertext translation limit is exceeded.",
  "error.fileDeleted": "The Supertext file was deleted before it could be downloaded.",
  "error.timeout": "Timed out waiting for the Supertext translation.",
  "error.emptyTranslation": "The translated document was empty.",
  "error.unreachable": "Could not reach Supertext: {reason}",
  "error.auth":
    "Authentication failed. Please check the Supertext API key. No Supertext account yet? Create one at https://www.supertext.com/person/en/account/signin. Generate your API key at https://www.supertext.com/en/integrations/api (requires the Admin role).",
  "error.notFound": "The requested Supertext resource was not found.",
  "error.tooLarge": "The content is too large for Supertext to translate in one go.",
  "error.rateLimited": "Too many requests to Supertext. Please try again shortly.",
  "error.unavailable": "The Supertext service is currently unavailable.",
  "error.http": "Supertext answered with HTTP {status}.",
  "error.languagePair":
    "Supertext doesn't translate from \"{source}\" into \"{target}\". Set the Supertext code for this language under Settings → Languages, with a region (e.g. de-CH, fr-FR, en-US).",
  "error.languagePairUnknown":
    "Supertext doesn't translate into this language. Set the Supertext code for this language under Settings → Languages, with a region (e.g. de-CH, fr-FR, en-US).",
  "error.incomplete": "Supertext returned {received} of {sent} texts; nothing was saved for this item.",
  "error.sourceMissing": "The original text of this item was not found.",
  "error.schemaMissing": "This content type no longer exists on the site.",
  "error.multilingualMissing":
    "Wix Multilingual isn't set up on this site. Add the Wix Multilingual app and a second language first.",
  "error.wixAuth": "Wix refused the request. Reinstall the app to grant it the permissions it needs.",
  "error.wixNotConfigured": "The app is missing its Wix credentials (WIX_APP_ID, WIX_APP_SECRET).",
  "error.wixUnreachable": "Could not reach Wix: {reason}",
  "error.wixUnavailable": "Wix is currently unavailable. Please try again shortly.",
  "error.wixHttp": "Wix answered with HTTP {status}.",
  "error.wixRejected": "Wix rejected the translation.",
  "error.interrupted": "The app restarted during the translation. Start it again; finished items are kept.",
  "error.session": "This page has expired. Reload it from the Wix dashboard.",
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
