import { parse, HTMLElement, TextNode, type Node } from 'node-html-parser';
import { escapeHtml } from '../supertext/html.js';
import type { RichContent, RicosDecoration, RicosNode } from './client.js';

/**
 * Wix rich text (Ricos) ↔ the HTML Supertext translates.
 *
 * Each text block (paragraph, heading, list item paragraph, quote, caption,
 * table cell paragraph …) becomes one segment: its text runs with their
 * formatting as inline tags (<b>, <i>, <u>, <a href>, or <span> for other
 * styles), each tag carrying `data-st-d` = the index of its decoration set.
 * After translation the runs are rebuilt from the tags, so formatting and
 * links survive even when the translation reorders words. Button labels and
 * image alt texts are plain-text segments. Code blocks aren't translated.
 */

export interface RicosSegment {
  /** Inline HTML for text blocks, plain text for labels. */
  text: string;
  html: boolean;
}

interface Target {
  segment: RicosSegment;
  apply(translated: string): void;
}

export interface RicosExtraction {
  segments: RicosSegment[];
  /** A copy of the document with the translations (by segment index) applied. */
  rebuild(translations: Map<number, string>): RichContent;
}

const SKIP_BLOCKS = new Set(['CODE_BLOCK']);

export function extractRicos(document: RichContent): RicosExtraction {
  const copy = structuredClone(document);
  const decorationSets: RicosDecoration[][] = [];
  const targets: Target[] = [];

  const visit = (node: RicosNode) => {
    if (SKIP_BLOCKS.has(node.type)) return;
    const children = node.nodes ?? [];
    const textChildren = children.filter((child) => child.type === 'TEXT');
    if (textChildren.length > 0 && textChildren.length === children.length) {
      const html = textChildren.map((child) => runHtml(child, decorationSets)).join('');
      if (html.replace(/<[^>]*>|\s|&nbsp;/g, '') !== '') {
        const template = textChildren[0];
        targets.push({
          segment: { text: html, html: true },
          apply: (translated) => {
            const runs = parseRuns(translated, decorationSets);
            if (runs.length > 0) {
              node.nodes = runs.map((run) => ({
                ...template,
                nodes: [],
                textData: { ...template.textData, text: run.text, decorations: run.decorations },
              }));
            }
          },
        });
      }
    } else {
      children.forEach(visit);
    }
    const button = node.buttonData as { text?: string } | undefined;
    if (button?.text?.trim()) {
      targets.push({ segment: { text: button.text, html: false }, apply: (value) => (button.text = value) });
    }
    const image = node.imageData as { altText?: string } | undefined;
    if (image?.altText?.trim()) {
      targets.push({ segment: { text: image.altText, html: false }, apply: (value) => (image.altText = value) });
    }
  };
  copy.nodes.forEach(visit);

  return {
    segments: targets.map((target) => target.segment),
    rebuild(translations) {
      translations.forEach((value, index) => {
        if (value.trim() !== '') targets[index]?.apply(value);
      });
      return copy;
    },
  };
}

/** One text run as inline HTML. */
function runHtml(node: RicosNode, sets: RicosDecoration[][]): string {
  const text = escapeHtml(node.textData?.text ?? '').replace(/\n/g, '<br>');
  const decorations = node.textData?.decorations ?? [];
  if (decorations.length === 0) return text;
  const key = JSON.stringify(decorations);
  let index = sets.findIndex((set) => JSON.stringify(set) === key);
  if (index < 0) index = sets.push(decorations) - 1;
  const types = decorations.map((decoration) => decoration.type);
  const link = decorations.find((decoration) => decoration.type === 'LINK') as
    | { linkData?: { link?: { url?: string } } }
    | undefined;
  if (link) {
    const href = link.linkData?.link?.url ?? '';
    return `<a href="${escapeHtml(href)}" data-st-d="${index}">${text}</a>`;
  }
  const tag = types.length === 1 ? ({ BOLD: 'b', ITALIC: 'i', UNDERLINE: 'u' } as Record<string, string>)[types[0]] : undefined;
  const name = tag ?? 'span';
  return `<${name} data-st-d="${index}">${text}</${name}>`;
}

interface Run {
  text: string;
  decorations: RicosDecoration[];
}

/** Text runs from translated inline HTML; decorations come back from the data-st-d indexes. */
export function parseRuns(html: string, sets: RicosDecoration[][]): Run[] {
  const root = parse(`<div>${html}</div>`, { comment: false });
  const runs: Run[] = [];
  const push = (text: string, decorations: RicosDecoration[]) => {
    if (text === '') return;
    const last = runs[runs.length - 1];
    if (last && JSON.stringify(last.decorations) === JSON.stringify(decorations)) {
      last.text += text;
    } else {
      runs.push({ text, decorations });
    }
  };
  const walk = (node: Node, decorations: RicosDecoration[]) => {
    if (node instanceof TextNode) {
      push(node.text.replace(/\s+/g, ' '), decorations);
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.rawTagName?.toLowerCase() === 'br') {
      push('\n', decorations);
      return;
    }
    let current = decorations;
    const index = node.getAttribute('data-st-d');
    if (index !== undefined && sets[Number(index)]) {
      current = mergeDecorations(decorations, sets[Number(index)]);
    }
    node.childNodes.forEach((child) => walk(child, current));
  };
  (root.firstChild as HTMLElement).childNodes.forEach((child) => walk(child, []));
  // Trim the outer whitespace Supertext may add around the block.
  if (runs.length > 0) {
    runs[0].text = runs[0].text.replace(/^ +/, '');
    runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/ +$/, '');
  }
  return runs.filter((run) => run.text !== '');
}

function mergeDecorations(outer: RicosDecoration[], inner: RicosDecoration[]): RicosDecoration[] {
  const types = new Set(inner.map((decoration) => decoration.type));
  return [...outer.filter((decoration) => !types.has(decoration.type)), ...inner];
}

/** The plain text of a Ricos document (for previews and "is it empty?" checks). */
export function ricosText(document: RichContent | undefined): string {
  const parts: string[] = [];
  const visit = (node: RicosNode) => {
    if (node.textData?.text) parts.push(node.textData.text);
    node.nodes?.forEach(visit);
  };
  document?.nodes?.forEach(visit);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
