// Shared by the server and the browser (no server-only code here).

export type MessageParams = Record<string, string | number>;

/**
 * An error whose English `message` goes to logs, while `code` and `params`
 * let the UI show it in the merchant's admin language (`error.<code>` in the
 * message files). `detail` is extra text from Supertext or Wix; it is
 * shown as it is, untranslated.
 */
export class LocalizedError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly params: MessageParams = {},
    public readonly detail?: string,
  ) {
    super(message);
    this.name = "LocalizedError";
  }
}

/** An error in a form the UI can translate: plain data, so it survives JSON and the database. */
export interface ErrorInfo {
  message: string;
  code?: string;
  params?: MessageParams;
  detail?: string;
}

/**
 * The Supertext SDK's errors (SupertextError: a stable `code` shared by all
 * Supertext SDKs, plus `status`, `detail`, `sourceLang`/`targetLang`), without
 * importing the SDK here: this file is also used by the browser.
 */
interface SdkError {
  name: string;
  message: string;
  code: string;
  status?: number;
  detail?: string;
  sourceLang?: string;
  targetLang?: string;
}

const isSdkError = (error: unknown): error is SdkError =>
  error instanceof Error && error.name === "SupertextError" && typeof (error as { code?: unknown }).code === "string";

export function errorInfo(error: unknown): ErrorInfo {
  if (isSdkError(error)) {
    const pair = error.code === "invalid_language_pair";
    const known = pair && error.sourceLang && error.targetLang;
    const code = pair && !known ? "invalid_language_pair_unknown" : error.code;
    const params: MessageParams = {};
    if (error.status !== undefined) params.status = error.status;
    if (known) Object.assign(params, { source: error.sourceLang, target: error.targetLang });
    if (error.code === "unsupported_language") params.language = error.targetLang ?? error.sourceLang ?? "?";
    if (error.code === "unsupported_feature") params.target = error.targetLang ?? "?";
    // Language errors are fully explained by the message; others keep the API's own text.
    const language = pair || error.code === "unsupported_language" || error.code === "unsupported_feature";
    const detail = language ? undefined : error.detail;
    return { message: error.message, code, params, ...(detail ? { detail } : {}) };
  }
  if (error instanceof LocalizedError) {
    return {
      message: error.message,
      code: error.code,
      params: error.params,
      ...(error.detail ? { detail: error.detail } : {}),
    };
  }
  return { message: error instanceof Error ? error.message : String(error) };
}
