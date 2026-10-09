import type { Messages } from "./en.js";

// German, with the terms of Wix's German dashboard (Website, Hauptsprache, Übersetzungsmanager).
export const de: Messages = {
  "nav.translate": "Übersetzen",
  "nav.settings": "Einstellungen",

  "apiKeyHelp.text":
    "Noch kein Supertext-Konto? {signup}. Generieren Sie Ihren API-Schlüssel unter {apiKey} (erfordert die Admin-Rolle).",
  "apiKeyHelp.signup": "Erstellen Sie eines auf supertext.com",
  "apiKeyHelp.apiKey": "supertext.com → Integrations → API",

  "translate.heading": "Mit Supertext übersetzen",
  "translate.intro":
    "Übersetzen Sie die Inhalte Ihrer Website mit Supertext AI in deren weitere Sprachen. Die Übersetzungen werden in Wix Multilingual gespeichert, wo Sie sie im Übersetzungsmanager prüfen können.",
  "translate.noKey.heading": "Supertext-API-Schlüssel hinzufügen",
  "translate.noKey.text":
    "Die App benötigt einen Supertext-API-Schlüssel, bevor sie übersetzen kann. Geben Sie ihn unter {settings} ein.",
  "translate.noKey.settings": "Einstellungen",
  "translate.oneLanguage.heading": "Zweite Sprache hinzufügen",
  "translate.oneLanguage.text":
    "Ihre Website hat nur eine Sprache. Fügen Sie in der Verwaltung Ihrer Website mit Wix Multilingual weitere Sprachen hinzu und kehren Sie dann hierher zurück.",
  "translate.noSchemas": "Wix Multilingual hat auf dieser Website noch keine übersetzbaren Inhalte.",
  "translate.step1": "1. Inhalte auswählen",
  "translate.type": "Inhaltstyp",
  "translate.otherApps": "Weitere",
  "translate.empty": "Noch nichts von diesem Typ vorhanden.",
  "translate.item": "Element",
  "translate.selectAll": "Alle auf dieser Seite auswählen ({count})",
  "translate.firstPage": "Erste Seite",
  "translate.nextPage": "Nächste Seite",
  "translate.step2": "2. Sprachen auswählen",
  "translate.from": "Übersetzt wird aus {language}, der Hauptsprache Ihrer Website.",
  "translate.hidden": "auf der Website ausgeblendet",
  "translate.overwrite": "Vorhandene Übersetzungen überschreiben",
  "translate.overwriteHint": "Ohne diese Option bleiben bereits übersetzte Felder unverändert.",
  "translate.overwriteWarning":
    "Bereits übersetzte Felder werden ersetzt, auch Änderungen, die im Übersetzungsmanager von Hand gemacht wurden.",
  "translate.submit": "Mit Supertext übersetzen",
  "translate.submitCount.one": "{count} Element mit Supertext übersetzen",
  "translate.submitCount.other": "{count} Elemente mit Supertext übersetzen",
  "translate.selectSomething": "Wählen Sie mindestens ein Element und eine Sprache aus.",
  "translate.starting": "Wird gestartet …",

  "state.none": "Nicht übersetzt",
  "state.partial": "Teilweise übersetzt",
  "state.done": "Übersetzt",

  "job.heading": "Übersetzung",
  "job.running": "Wird übersetzt … {completed} von {total}",
  "job.done": "Fertig: {translated} übersetzt, {unchanged} unverändert, {failed} fehlgeschlagen.",
  "job.failed": "Die Übersetzung wurde abgebrochen: {reason}",
  "job.translated.one": "Übersetzt ({count} Feld)",
  "job.translated.other": "Übersetzt ({count} Felder)",
  "job.kept": "{count} beibehalten",
  "job.tooLong": "{count} zu lang für Wix, nicht gespeichert",
  "job.unchanged": "Bereits übersetzt, unverändert",
  "job.review": "Prüfen Sie die Übersetzungen im {manager}.",
  "job.manager": "Übersetzungsmanager",

  "settings.heading": "Supertext-Einstellungen",
  "settings.saved": "Einstellungen gespeichert.",
  "settings.invalidCodes":
    "Gespeichert, außer diesen Sprachcodes, die keine gültigen Codes wie de-CH sind: {codes}.",
  "settings.apiKey.heading": "Supertext-API-Schlüssel",
  "settings.apiKey.label": "API-Schlüssel",
  "settings.apiKey.placeholder": "Fügen Sie Ihren Supertext-API-Schlüssel ein",
  "settings.apiKey.placeholderSaved":
    "Ein Schlüssel ist gespeichert (verschlüsselt). Geben Sie einen neuen ein, um ihn zu ersetzen.",
  "settings.apiKey.server": "Noch kein eigener Schlüssel: Die App verwendet den auf dem Server hinterlegten Schlüssel.",
  "settings.apiKey.remove": "Gespeicherten Schlüssel entfernen",
  "settings.test": "Verbindung testen",
  "settings.testing": "Wird getestet …",
  "settings.testOk": "Verbunden. Der API-Schlüssel funktioniert.",
  "settings.languages.heading": "Sprachen",
  "settings.languages.text":
    "Der Sprachcode, in den Supertext für jede Sprache Ihrer Website übersetzt. Supertext benötigt eine Region, zum Beispiel de-CH für Schweizerdeutsch oder fr-FR für das Französisch Frankreichs.",
  "settings.languages.main": "Hauptsprache",
  "settings.style.heading": "Übersetzung",
  "settings.style.label": "Anrede",
  "settings.style.default": "Supertext entscheiden lassen",
  "settings.style.more": "Formell (z. B. „Sie“)",
  "settings.style.less": "Informell (z. B. „du“)",
  "settings.publish": "Übersetzungen als bereit zur Veröffentlichung markieren",
  "settings.publishHint":
    "Aus: Die Übersetzungen warten im Übersetzungsmanager, bis Sie sie zur Veröffentlichung freigeben.",
  "settings.save": "Speichern",
  "settings.about.heading": "Info",
  "settings.about.version": "Supertext Translation für Wix, Version {version}",

  "error.noApiKey":
    "Kein Supertext-API-Schlüssel konfiguriert. Fügen Sie ihn unter Einstellungen hinzu. Noch kein Supertext-Konto? Erstellen Sie eines auf https://www.supertext.com/person/en/account/signin. Generieren Sie Ihren API-Schlüssel unter https://www.supertext.com/en/integrations/api (erfordert die Admin-Rolle).",
  "error.noFileId": "Supertext hat keine Datei-ID zurückgegeben.",
  "error.translationFailed": "Supertext konnte das Dokument nicht übersetzen.",
  "error.limitExceeded": "Ihr Supertext-Übersetzungslimit ist überschritten.",
  "error.fileDeleted": "Die Supertext-Datei wurde gelöscht, bevor sie heruntergeladen werden konnte.",
  "error.timeout": "Zeitüberschreitung beim Warten auf die Supertext-Übersetzung.",
  "error.emptyTranslation": "Das übersetzte Dokument war leer.",
  "error.unreachable": "Supertext ist nicht erreichbar: {reason}",
  "error.auth":
    "Authentifizierung fehlgeschlagen. Bitte prüfen Sie den Supertext-API-Schlüssel. Noch kein Supertext-Konto? Erstellen Sie eines auf https://www.supertext.com/person/en/account/signin. Generieren Sie Ihren API-Schlüssel unter https://www.supertext.com/en/integrations/api (erfordert die Admin-Rolle).",
  "error.notFound": "Die angeforderte Supertext-Ressource wurde nicht gefunden.",
  "error.tooLarge": "Der Inhalt ist zu groß, um von Supertext in einem Durchgang übersetzt zu werden.",
  "error.rateLimited": "Zu viele Anfragen an Supertext. Bitte versuchen Sie es gleich nochmals.",
  "error.unavailable": "Der Supertext-Dienst ist derzeit nicht verfügbar.",
  "error.http": "Supertext hat mit HTTP {status} geantwortet.",
  "error.languagePair":
    "Supertext übersetzt nicht aus „{source}“ in „{target}“. Legen Sie den Supertext-Code für diese Sprache unter Einstellungen → Sprachen fest, mit einer Region (z. B. de-CH, fr-FR, en-US).",
  "error.languagePairUnknown":
    "Supertext übersetzt nicht in diese Sprache. Legen Sie den Supertext-Code für diese Sprache unter Einstellungen → Sprachen fest, mit einer Region (z. B. de-CH, fr-FR, en-US).",
  "error.incomplete":
    "Supertext hat {received} von {sent} Texten zurückgegeben; für dieses Element wurde nichts gespeichert.",
  "error.sourceMissing": "Der Originaltext dieses Elements wurde nicht gefunden.",
  "error.schemaMissing": "Dieser Inhaltstyp existiert auf der Website nicht mehr.",
  "error.multilingualMissing":
    "Wix Multilingual ist auf dieser Website nicht eingerichtet. Fügen Sie zuerst die App Wix Multilingual und eine zweite Sprache hinzu.",
  "error.wixAuth":
    "Wix hat die Anfrage abgelehnt. Installieren Sie die App erneut, um ihr die nötigen Berechtigungen zu erteilen.",
  "error.wixNotConfigured": "Der App fehlen ihre Wix-Zugangsdaten (WIX_APP_ID, WIX_APP_SECRET).",
  "error.wixUnreachable": "Wix ist nicht erreichbar: {reason}",
  "error.wixUnavailable": "Wix ist derzeit nicht verfügbar. Bitte versuchen Sie es gleich nochmals.",
  "error.wixHttp": "Wix hat mit HTTP {status} geantwortet.",
  "error.wixRejected": "Wix hat die Übersetzung abgelehnt.",
  "error.interrupted":
    "Die App wurde während der Übersetzung neu gestartet. Starten Sie sie erneut; fertige Elemente bleiben erhalten.",
  "error.session": "Diese Seite ist abgelaufen. Laden Sie sie aus der Verwaltung Ihrer Wix-Website neu.",
};
