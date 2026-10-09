# Working on this repository

Part of Supertext's translation plugins project: Supertext AI translation for the top open source CMS, PIM and shop systems. Each system has its own repo named `Supertext/<System>-Supertext-Translation`.

This repo is a **Wix app** (self-hosted): a dashboard page extension whose iFrame points at this Node.js/TypeScript service (Hono, server-rendered pages), which reads and writes translations through the **Wix Multilingual** REST APIs (Locales, Translation Schema, Translation Content) and is hosted on Railway. See `docs/DEVELOPER.md`.

## Documentation rule (always)

Every plugin repo keeps three guides, and **every change that affects behaviour, settings, installation or the code structure updates them in the same commit**:

| File | Audience | Must cover |
| --- | --- | --- |
| `docs/INSTALLATION.md` | Administrators | Requirements, install/update/uninstall, API key, language setup, all settings, troubleshooting |
| `docs/USER_GUIDE.md` | Editors | How to translate and review in the CMS's own UI, what is and isn't translated, what errors mean |
| `docs/DEVELOPER.md` | Developers | Architecture, Supertext API protocol, local setup, tests, CI/deploy, releasing, known limitations/roadmap |

Also: `README.md` stays a short overview linking the three guides, and `CHANGELOG.md` gets an entry under *Unreleased* for every user-visible change. Before finishing any task, check the docs still match the code.

## Supertext account and API key links (always)

Everywhere an administrator enters or is told about the API key — the settings field's help text, the "no API key" / "authentication failed" messages, `docs/INSTALLATION.md`, `README.md` and `.env.example` — show both links (same as the WordPress plugin):

- Create a Supertext account (or log in): https://www.supertext.com/person/en/account/signin
- Generate the AI API key: https://www.supertext.com/en/integrations/api (supertext.com → Integrations → API; requires the **Admin** role)

Wording: "No Supertext account yet? Create one at supertext.com. Generate your API key at supertext.com → Integrations → API (requires the Admin role)." In the UI, links open in a new tab (`target="_blank" rel="noopener"`); where the CMS shows plain text only, use the bare URLs. New screens or messages that mention the key get the links too.

## UI languages (always)

The app's pages are in English, German, French and Italian, following the `locale` parameter Wix passes to the dashboard page. Strings live in `src/i18n/{en,de,fr,it}.ts` (typed: a missing key fails `npm run typecheck`; `tests/i18n.test.ts` checks placeholders, URLs, "Supertext" and "Wix"). **New or changed strings get all four languages in the same commit.** Formal address (Sie, vous, Lei), Wix's own terms in each language, "Supertext", placeholders and URLs never translated. Errors shown in the UI are `LocalizedError`s with a `code` (`error.<code>`).

## Plugin version on the settings screen (always)

The settings page shows the version from `package.json` (read at runtime by `src/version.ts`, never a second copy) and links it to the GitHub release.

## Plugin list (always)

`README.md` ends with the shared list of all Supertext plugins (between the `<!-- supertext-plugins:start -->` and `<!-- supertext-plugins:end -->` markers). It is identical in every Supertext plugin repo: when a plugin is added, renamed or its description changes, update the list in **all** repos, not just this one. Wix is listed as *In development* until it has been tested on a real Wix site.

## Releases (always)

Releases are published by `.github/workflows/release.yml`: never tag or create a GitHub release by hand. To release, follow `docs/DEVELOPER.md` → *Releasing* (new version section in `CHANGELOG.md`, same number in `package.json`) and push to `main`. A push without a new version releases nothing. A Wix app has no installable file: Railway deploys the code, permissions and extensions are published in the Wix app dashboard.

## Repo setup (always)

Every Supertext plugin repo has, and a new one gets from the start:

- `LICENSE` matching the license its manifest declares (`composer.json`, `package.json`, `pyproject.toml`, `.csproj`, plugin header).
- `SECURITY.md`: report vulnerabilities privately through GitHub's private vulnerability reporting or support@supertext.com, never in public issues.
- `.github/dependabot.yml`: weekly updates for its package ecosystem and GitHub Actions, minor and patch updates grouped into one pull request.
- On GitHub: the About box filled in (one-sentence description, website https://www.supertext.com, topics), `main` protected against force-pushes and deletion, Wiki and Projects off, Dependabot alerts and private vulnerability reporting on, and the Supertext social preview image.
- A row in the plugin list (see *Plugin list*) and in the org profile (`Supertext/.github` → `profile/README.md`).

Claude sessions can't change GitHub repo settings (HTTP 403): add a new repo to Remy's setup script (`set-github-about`) instead of trying.

## Demo accounts rule (always)

The demo is a Wix site set up by hand (see `docs/DEVELOPER.md` → *Demo*): Wix accounts are personal and created by Wix, so the `DEMO_*` accounts are Wix collaborators (admin for Supertext staff, an editor-level role that can use apps for tests and screenshots), invited by hand. Values never go in the repo, in chat or in logs.

## Screenshots rule (always)

The user guide and installation guide include screenshots, taken by `npm run docs:screenshots` (Playwright, `tests/docs/screenshots.ts`) against the stand-in Wix and Supertext APIs, which return real translations of the sample site (`tests/standin/samples.json`), stored in `docs/images/` at 1× scale with alt text, and regenerated in the same commit whenever the UI they show changes. Screenshots of Wix's own screens (language setup, Translation Manager) are added from the demo site once it exists. No secrets, no customer data, no local URLs.

## Shared Supertext protocol

AI file translation API v1, same as the WordPress plugin: POST HTML file → poll status → GET translation → DELETE. Details in `docs/DEVELOPER.md`. Never commit API keys or the Wix app secret; use environment variables (`SUPERTEXT_API_KEY`, `WIX_APP_SECRET`) or the app's settings (stored encrypted).

Lessons from the live API, apply them here: header `Authorization: Supertext-Auth-Key <key>` (strip a pasted prefix), retry HTTP 429 (per-second rate limit), and keep a whole text in one `data-st-id` element (each one is translated on its own): one segment per text field, HTML field or Ricos text block.

## This repo

- Before committing: `npm run typecheck`, `npm test`, `npm run build`. CI also runs the built app against the stand-ins (`tests/standin/server.ts`).
- Every request must verify Wix's signed instance (`src/auth/instance.ts`); never trust an instance ID sent in plain text. The instance ID is the site's key in the store.
- Translated fields are decided by the schema (`src/translation/fields.ts`): `SHORT_TEXT`, `LONG_TEXT`, `HTML`, `RICH_CONTENT`; keep "What is translated" in `docs/USER_GUIDE.md` and the flow in `docs/DEVELOPER.md` in sync.
- New settings go in `src/store/store.ts` (and the Postgres table in `src/store/postgres.ts`), `src/views/settings.tsx`, the form handler in `src/app.ts` **and** the settings table in `docs/INSTALLATION.md`.
- Changes to the Wix calls go through `src/wix/client.ts` and the stand-in (`tests/standin/wix.ts`) together. Check real Wix behaviour with `npm run wix:probe` (read-only) before relying on it.
- Hosting: Railway service *Wix* in *supertext-cms-demos*, building the `Dockerfile` (set on the service; Railway ignores `railway.json`), health check `/health`, its own database `wix_supertext` on the shared Postgres. Don't export-ignore anything the Dockerfile copies.
