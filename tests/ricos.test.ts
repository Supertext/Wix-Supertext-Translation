import { describe, expect, it } from 'vitest';
import type { RichContent, RicosDecoration, RicosNode } from '../src/wix/client.js';
import { extractRicos, ricosText } from '../src/wix/ricos.js';

const text = (value: string, decorations: RicosDecoration[] = []): RicosNode => ({ type: 'TEXT', id: '', nodes: [], textData: { text: value, decorations } });

const document: RichContent = {
  nodes: [
    { type: 'HEADING', id: 'h', headingData: { level: 2 }, nodes: [text('Made in Bern')] },
    {
      type: 'PARAGRAPH',
      id: 'p',
      nodes: [
        text('Buy '),
        text('fresh', [{ type: 'BOLD', fontWeightValue: 700 }]),
        text(' chocolate at '),
        text('our shop', [{ type: 'LINK', linkData: { link: { url: 'https://example.com/?a=1&b=2' } } }]),
        text('.\nSee you!'),
      ],
    },
    { type: 'CODE_BLOCK', id: 'c', nodes: [text('const x = 1;')] },
    { type: 'BUTTON', id: 'b', nodes: [], buttonData: { text: 'Order now' } },
    { type: 'IMAGE', id: 'i', nodes: [], imageData: { altText: 'A praline' } },
    { type: 'PARAGRAPH', id: 'empty', nodes: [text('  ')] },
  ],
  metadata: { version: 1 },
};

describe('Ricos rich content', () => {
  it('sends each text block as one segment with its formatting as inline tags', () => {
    const { segments } = extractRicos(document);
    expect(segments).toEqual([
      { text: 'Made in Bern', html: true },
      {
        text: 'Buy <b data-st-d="0">fresh</b> chocolate at <a href="https://example.com/?a=1&amp;b=2" data-st-d="1">our shop</a>.<br>See you!',
        html: true,
      },
      { text: 'Order now', html: false },
      { text: 'A praline', html: false },
    ]);
  });

  it('rebuilds the runs from the translation, even when words move, and leaves the original alone', () => {
    const extraction = extractRicos(document);
    const result = extraction.rebuild(
      new Map([
        [0, 'Hergestellt in Bern'],
        [1, 'Kaufen Sie in <a href="https://example.com/?a=1&amp;b=2" data-st-d="1">unserem Laden</a> <b data-st-d="0">frische</b> Schokolade.<br>Bis bald!'],
        [2, 'Jetzt bestellen'],
        [3, 'Eine Praline'],
      ]),
    );
    expect(result.nodes[0].nodes![0].textData!.text).toBe('Hergestellt in Bern');
    const runs = result.nodes[1].nodes!.map((node) => [node.textData!.text, node.textData!.decorations!.map((d) => d.type)]);
    expect(runs).toEqual([
      ['Kaufen Sie in ', []],
      ['unserem Laden', ['LINK']],
      [' ', []],
      ['frische', ['BOLD']],
      [' Schokolade.\nBis bald!', []],
    ]);
    expect(result.nodes[1].nodes![1].textData!.decorations![0]).toEqual({
      type: 'LINK',
      linkData: { link: { url: 'https://example.com/?a=1&b=2' } },
    });
    expect(result.nodes[2].nodes![0].textData!.text).toBe('const x = 1;');
    expect((result.nodes[3].buttonData as { text: string }).text).toBe('Jetzt bestellen');
    expect((result.nodes[4].imageData as { altText: string }).altText).toBe('Eine Praline');
    expect(document.nodes[0].nodes![0].textData!.text).toBe('Made in Bern');
  });

  it('keeps a block as it was when its translation is missing or empty', () => {
    const result = extractRicos(document).rebuild(new Map([[0, '  ']]));
    expect(result.nodes[0].nodes![0].textData!.text).toBe('Made in Bern');
  });

  it('nests translated tags into combined decorations', () => {
    const doc: RichContent = { nodes: [{ type: 'PARAGRAPH', nodes: [text('a', [{ type: 'BOLD' }]), text('b', [{ type: 'ITALIC' }])] }] };
    const result = extractRicos(doc).rebuild(new Map([[0, '<b data-st-d="0">x <i data-st-d="1">y</i></b>']]));
    expect(result.nodes[0].nodes!.map((n) => [n.textData!.text, n.textData!.decorations!.map((d) => d.type)])).toEqual([
      ['x ', ['BOLD']],
      ['y', ['BOLD', 'ITALIC']],
    ]);
  });

  it('reads plain text for previews', () => {
    expect(ricosText(document)).toContain('Buy fresh chocolate');
  });
});
