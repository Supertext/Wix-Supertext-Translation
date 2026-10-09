# Changelog

All notable changes to Supertext Translation for Wix.

## Unreleased

## 0.1.0 — 2026-10-09

First version (in development: tested against a stand-in of the Wix APIs, not yet on a real Wix site).

- Wix app with a dashboard page: choose a content type (Wix Stores products and categories, Wix Blog posts and any other content Wix Multilingual can translate), select items and languages, translate with Supertext AI, see each item's result.
- Reads the original texts from Wix Multilingual and writes the translations back there, field by field, marked as translated by an external app and, by default, ready to publish.
- Rich text (Ricos) keeps headings, lists, bold, italics, underline and links; HTML fields keep their markup; images and other media aren't sent.
- Existing translations are kept unless *Overwrite existing translations* is ticked, with a warning.
- Settings per site: Supertext API key (stored encrypted, with account and API key links), *Test connection*, form of address, whether translations are marked ready to publish, the Supertext language code per site language, and the app version linked to its release.
- Interface in English, German, French and Italian, following the Wix dashboard language.
- Signed Wix instance checked on every request; Supertext's per-second limit (HTTP 429) and Wix's are retried.
