/**
 * A heuristic approximation of GPT-style BPE tokenization.
 *
 * This is NOT the real cl100k_base vocabulary — shipping that would add ~1.7MB
 * to the bundle. It mimics the observable behaviour of BPE tokenizers:
 *   · leading whitespace attaches to the following word
 *   · common words stay whole
 *   · long/rare words fracture into subword pieces
 *   · punctuation and digits split off
 * Counts land close to real tokenizers but are explicitly labelled as estimates.
 */

/** High-frequency words a real BPE vocab would keep as single tokens. */
const COMMON = new Set([
  "the","be","to","of","and","a","in","that","have","i","it","for","not","on",
  "with","he","as","you","do","at","this","but","his","by","from","they","we",
  "say","her","she","or","an","will","my","one","all","would","there","their",
  "what","so","up","out","if","about","who","get","which","go","me","when",
  "make","can","like","time","no","just","him","know","take","people","into",
  "year","your","good","some","could","them","see","other","than","then","now",
  "look","only","come","its","over","think","also","back","after","use","two",
  "how","our","work","first","well","way","even","new","want","because","any",
  "these","give","day","most","us","is","are","was","were","has","had","been",
  "model","data","code","build","learn","train","text","token","word","test",
]);

/** Suffixes a BPE merge table almost always carries as their own token. */
const SUFFIXES = [
  "tions","ition","ating","ation","ments","ingly","ness","ment","ings","able",
  "ible","ally","ical","ance","ence","tion","sion","ings","ing","ers","est",
  "ies","ive","ous","ful","ity","ize","ise","ed","er","ly","es","al","ic","s",
];

export type Token = { text: string; kind: "word" | "sub" | "punct" | "num" | "space" };

const MAX_PIECE = 5;

function splitLongWord(word: string): string[] {
  if (word.length <= 6) return [word];

  const lower = word.toLowerCase();
  if (COMMON.has(lower.trim())) return [word];

  // Peel a recognizable suffix off the end.
  for (const suf of SUFFIXES) {
    if (lower.length > suf.length + 3 && lower.endsWith(suf)) {
      const stem = word.slice(0, word.length - suf.length);
      return [...splitLongWord(stem), word.slice(word.length - suf.length)];
    }
  }

  // Otherwise fracture into BPE-sized chunks, preferring breaks before vowels.
  const pieces: string[] = [];
  let i = 0;
  while (i < word.length) {
    let len = Math.min(MAX_PIECE, word.length - i);
    if (word.length - i > MAX_PIECE) {
      for (let probe = len; probe >= 3; probe--) {
        if (/[aeiou]/i.test(word[i + probe] ?? "")) {
          len = probe;
          break;
        }
      }
    }
    pieces.push(word.slice(i, i + len));
    i += len;
  }
  return pieces;
}

export function tokenize(input: string): Token[] {
  if (!input) return [];
  const tokens: Token[] = [];

  // Chunk into: leading-space+word | number | punctuation | whitespace
  const re = /(\s*)([A-Za-z']+)|(\s*)(\d+)|(\s*)([^\sA-Za-z\d]+)|(\s+)/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(input)) !== null) {
    const [, wsW, word, wsN, num, wsP, punct, ws] = m;

    if (word !== undefined) {
      const lead = wsW ?? "";
      const pieces = splitLongWord(word);
      pieces.forEach((p, idx) => {
        tokens.push({
          text: idx === 0 ? lead + p : p,
          kind: pieces.length === 1 ? "word" : "sub",
        });
      });
    } else if (num !== undefined) {
      // Real tokenizers chunk digits in groups of up to 3.
      const lead = wsN ?? "";
      const groups = num.match(/\d{1,3}/g) ?? [num];
      groups.forEach((g, idx) => {
        tokens.push({ text: idx === 0 ? lead + g : g, kind: "num" });
      });
    } else if (punct !== undefined) {
      const lead = wsP ?? "";
      [...punct].forEach((ch, idx) => {
        tokens.push({ text: idx === 0 ? lead + ch : ch, kind: "punct" });
      });
    } else if (ws !== undefined) {
      tokens.push({ text: ws, kind: "space" });
    }
  }

  return tokens;
}

export const SAMPLES = [
  "Fine-tuning transformers for semantic search.",
  "I build backend systems that think.",
  "embeddings, retrieval augmentation, and vector databases",
  "FastAPI + PostgreSQL + PyTorch = production AI",
];
