# Installation guide — Supertext Translation for Wix

For site owners and administrators setting up Supertext Translation on a Wix site.

> **Status: in development.** The app is tested against a stand-in of the Wix APIs. It isn't in the Wix App Market yet, and it hasn't been tried on a real Wix Stores site. Ask Supertext before using it on a live site.

## How it works

Supertext Translation is a Wix app. It adds a **Translate with Supertext** page to your site's dashboard. The app runs on Supertext's servers: it reads the texts to translate from **Wix Multilingual**, has Supertext AI translate them, and saves the translations back to Wix Multilingual. You review and publish them there, as with translations you make by hand.

Nothing is installed on your site except the app itself, and the app only changes translations, never your original content.

## Requirements

| | |
| --- | --- |
| Wix site | Any Wix or Wix Studio site with the content you want to translate, for example a Wix Stores shop or a Wix Blog |
| Wix Multilingual | Added to the site, with at least one language besides the main language (step 2) |
| Supertext | An account with an API key, see [Get a Supertext account and API key](#1-get-a-supertext-account-and-api-key) |
| Permissions | Adding apps to the site (site owner or an admin collaborator) |

## 1. Get a Supertext account and API key

1. **Account:** no Supertext account yet? [Log in or create one](https://www.supertext.com/person/en/account/signin) with your email address.
2. **API key:** generate it at [supertext.com → Integrations → API](https://www.supertext.com/en/integrations/api). Only users with the **Admin** role in the Supertext account can do this; otherwise ask your Supertext account admin for a key.

The app's settings page links to both, next to the API key field.

## 2. Set up your languages in Wix Multilingual

The app translates into the languages your site has in Wix Multilingual, from the site's main language.

1. In your site's dashboard, open **Wix Multilingual** (search the dashboard for "Multilingual" if you don't see it; add it if it isn't on the site yet).
2. Add each language you want, with its region where it matters (for example *German (Switzerland)*). A language can stay hidden from visitors while you translate; the app translates hidden languages too.
3. In the app's **Settings → Languages**, check that every language has a Supertext language (see [Languages](#languages) below).

Wix Multilingual decides which content can be translated: what it lists in its Translation Manager (Wix Stores products and categories, Wix Blog posts and other apps' content) is what the app offers.

## 3. Install the app

The app isn't in the Wix App Market yet. Supertext sends you an install link for your site; open it while logged in to Wix, choose the site and confirm the permissions:

| Permission (as Wix shows it) | Why |
| --- | --- |
| Wix Multilingual – read translation content | Read the original texts and existing translations |
| Wix Multilingual – write translation content | Save the translations |
| Wix Multilingual – manage translations | Read the site's languages |

After installing, the app appears in your dashboard's sidebar under **Apps** as **Supertext Translation**.

## 4. Enter the API key

Open **Supertext Translation → Settings** in the dashboard:

1. Paste your key into **API key** and click **Save**. You can paste it exactly as Supertext shows it, with the leading `Supertext-Auth-Key`, or without it. The key is stored encrypted.
2. Saving checks the key with Supertext right away (without translating anything) and shows the result: *API key checked: the connection to Supertext works.* means everything is in place. **Test connection** runs the same check again, also for a key you typed but haven't saved yet.

No Supertext account yet? Create one at [supertext.com](https://www.supertext.com/person/en/account/signin). Generate your API key at [supertext.com → Integrations → API](https://www.supertext.com/en/integrations/api) (requires the Admin role).

<img src="images/settings.png" alt="Supertext settings in the Wix dashboard: the saved API key with links to create a Supertext account and generate the key, the message API key checked: the connection to Supertext works. with the time of the last check, Test connection, form of address, Mark translations as ready to publish, the Supertext language for English (main language), German, French and Italian (Switzerland), Send version information to Supertext, and the app version 0.1.0" width="720">

Until a key is saved, the translate page asks for one:

<img src="images/no-api-key.png" alt="Add your Supertext API key: The app needs a Supertext API key before it can translate. Enter it under Settings, with links to create a Supertext account and generate the API key" width="720">

## All settings

All settings are per site, in **Supertext Translation → Settings**.

| Setting | Default | Purpose |
| --- | --- | --- |
| API key | – | Your Supertext key, with or without the `Supertext-Auth-Key` prefix; stored encrypted. *Remove the saved key* deletes it. |
| Test connection | – | Checks the key (entered or saved) with Supertext, without translating anything. Saving the settings runs the same check; the page shows the last result and when it ran. |
| Form of address | Let Supertext decide | *Formal* (German "Sie", French "vous") or *Informal* ("du", "tu"). Sent only for languages where Supertext offers it; for English, Swiss German, Romansh, Albanian and Serbian Supertext decides (the page names them). |
| Mark translations as ready to publish | On | On: translations go live on the site's language versions right away. Off: they wait in the Translation Manager until you mark them ready to publish. |
| Languages | the site language's own code, if Supertext offers it | The Supertext language each site language is translated into (and, for the main language, translated from). See [Languages](#languages). |
| Send version information to Supertext | On | See [Version information](#version-information). |

The settings page also shows the app's version, linked to its release notes.

### Languages

Supertext offers each language in one exact form: `de-CH`, `de-DE`, `de-AT`, `fr-CH`, `fr-FR`, `it-CH`, `it-IT`, `en-US`, `en-GB`, `pt-BR`, `pt-PT` (with region), `zh-Hans`, `zh-Hant`, `sr-Latn`, `sr-Cyrl`, Swiss German (Zurich, Bern), and without region for all others (`es`, `nl`, `ja` …). The app never guesses a region:

- A site language whose code is one of these (for example *German (Switzerland)*, `de-CH`, or *Spanish*, `es`) is used as it is: its select shows *Same code: de-CH*.
- Every other language needs a choice. Wix sites often have languages without region (*German*, `de`): choose *German (Switzerland)*, *German (Germany)* or *German (Austria)* for it. Until you do, the page lists it as *No Supertext language*, it isn't translated, and editors who choose it get a message that sends them here.
- For the main language you choose the language Supertext translates from (`en`, `de` …); its own code is used if Supertext has it (`en-US` → `en`).

<img src="images/settings-languages.png" alt="Languages on the Supertext settings page: English (main language) with Same code: en, German, French and Italian (Switzerland) with their same codes, and Portuguese marked No Supertext language with the choice Not translated: choose a Supertext language, under the warning These languages have no Supertext language yet and aren't translated until you choose one: Portuguese." width="720">

### Version information

**Send version information to Supertext** (on by default) sends a short report to Supertext's Commando Center when you save the settings and when the app or its runtime was updated, so Supertext support can see which version your site runs:

- the site's URL (its published address; for an unpublished site its Wix dashboard address `https://manage.wix.com/dashboard/<site ID>`),
- the app (`Wix-Supertext-Translation`) and its version, `Wix` as the system, the Node.js version the app runs on, and the version of the Supertext SDK,
- whether an API key is set and the result of the last key check (*ok*, *invalid*, *missing*, *unreachable* or *error*, with its time and Supertext's HTTP status).

No content, no API key and no personal data are sent. As a hosted app it has no callback address (no ping). Turn the checkbox off and save to stop the reports for your site; the key check on saving still runs. Supertext can also turn reports off for all sites on the app's server (`SUPERTEXT_VERSION_REPORTS=0`); the setting then says so.

## Who can translate

Everyone who can open the app's pages in the site's dashboard: the site owner and collaborators whose role gives access to apps. The app checks on every request that it comes from the Wix dashboard of that site (Wix's signed app instance).

## Updating

Nothing to do: the app runs on Supertext's servers and is updated there. The settings page shows the current version.

## Uninstalling

In your site's dashboard, open **Apps → Manage Apps**, find **Supertext Translation** and remove it. Translations made so far stay in Wix Multilingual. The app deletes your settings (including the stored API key) when Wix tells it the app was removed.

## Troubleshooting

| Message | Cause / fix |
| --- | --- |
| *This page has expired. Reload it from the Wix dashboard.* | The app's page was opened outside the dashboard or the link is too old. Open it again from the sidebar. |
| *Add your Supertext API key* / *No Supertext API key configured* | Enter the key under Settings (step 4). |
| *Authentication failed* / *Supertext rejected the API key* | The key is wrong or revoked. Check that you copied the whole key, or generate a new one at [supertext.com → Integrations → API](https://www.supertext.com/en/integrations/api) (Admin role required). No Supertext account yet? Create one at [supertext.com](https://www.supertext.com/person/en/account/signin). |
| *No API key is set yet* | Enter the key and save (step 4). |
| *The API key couldn't be checked because Supertext can't be reached* | The settings are saved; Supertext or the network was down. Click **Test connection** later. |
| *The API key couldn't be checked: Supertext answered with an error (…)* | The settings are saved; Supertext answered unexpectedly (HTTP status in brackets). Try **Test connection** later; if it stays, contact Supertext support. |
| *"…" has no Supertext language yet, so nothing was sent* / *No Supertext language* | That site language has no exact Supertext code (for example *German*, `de`, or `zh-CN`). Choose its Supertext language under Settings → [Languages](#languages). |
| *Saved, except these language codes, which Supertext doesn't offer* | Only the languages in the select can be saved; choose one of them. |
| *Supertext doesn't offer formal or informal address for …* | Choose *Let Supertext decide* under Settings → Translation (normally the app doesn't send the form of address for such languages). |
| *Add a second language* | Wix Multilingual has only the main language. Add languages (step 2). |
| *Wix Multilingual isn't set up on this site* | Add Wix Multilingual and a second language (step 2). |
| *Wix Multilingual has no translatable content on this site yet* | Nothing on the site uses Wix Multilingual's translation yet (for example no products). Add content in the main language. |
| *Wix refused the request* | The app lacks a permission, for example after Wix added a new one. Reinstall the app to grant it. |
| *Supertext doesn't translate from … into …* | Supertext doesn't offer that pair. Choose another Supertext language for it under Settings → [Languages](#languages). |
| *… too long for Wix, not saved* | The translation is longer than Wix allows for that field (e.g. a product name). Shorten it by hand in the Translation Manager. |
| *Too many requests to Supertext* | Supertext's per-second limit was still exceeded after 4 automatic retries. Wait a moment and translate again. |
| *Your Supertext translation limit is exceeded* | Your Supertext plan's volume is used up. |
| *The app restarted during the translation* | Start the translation again; items already done are kept (they show *Already translated, unchanged*). |

## Privacy and security

- The texts you translate are sent to Supertext (api.supertext.com) and deleted there right after download (they expire after 24 hours anyway).
- The app stores per site: the Supertext API key (encrypted), the settings above, the last API key check and version report (no key, only a fingerprint to notice a changed key), and the list of recent translations (item names and results). It doesn't store your content.
- Version information: see [Version information](#version-information).
- The app never changes your site's original texts; it only writes translations.
