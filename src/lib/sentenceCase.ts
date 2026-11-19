// Sentence case for event titles (docs/design/style.md → "Capitalisation"):
// only the first letter is capital, plus names. Scraped titles arrive in any
// casing ("Introduction to Screenprinting Workshop"); this is applied at read
// time in getPublishedEvents, so stored data is untouched and a human
// `title_override` is always shown exactly as typed.

/**
 * Names that keep their capitals wherever they appear in a title. Matched as
 * whole words/phrases, case-sensitively. Add series and brand names here when
 * a title comes out wrong; one-off fixes can use `title_override` instead.
 * Place names, venues, organisers and cities are protected automatically.
 */
export const PROPER_NOUNS = [
  // Months and weekdays
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  // Holidays
  'Christmas', 'Easter', 'Halloween', 'New Year', 'Valentine’s Day', "Valentine's Day",
  // Nationalities and languages
  'Chinese', 'Japanese', 'Korean', 'Israeli', 'Portuguese', 'Spanish', 'French',
  'Italian', 'German', 'English', 'British', 'Dutch', 'Polish', 'Lithuanian', 'Ukrainian',
  'European', 'African', 'Brazilian', 'Indian', 'Mexican',
  // Series, festivals and brands seen in the data
  'Biennale Danza', 'Biennale Musica', 'Biennale Teatro', 'Biennale Arte', 'Biennale',
  'Art Camp Lisbon', 'Collage Club', 'RIBA North', 'Discovery Day', 'Human Design', 'Ikigai',
  'Alfaiate do Livro', 'Israeli Pavilion',
  'Lego', 'Tetrapak', 'Tetrapack', 'Nerikomi', 'Matcha',
  'The Writer’s Hour', "The Writer's Hour",
  // People (artists, hosts) named in titles
  'Ema Gonçalves',
];

// A capitalised word that is otherwise lower case, e.g. "Workshop", "Cerâmica".
// At least two letters: single capitals ("I" in "Level I") are kept.
const TITLE_WORD = /^\p{Lu}[\p{Ll}\p{M}’']+$/u;
// Words, with apostrophes and hyphens inside them.
const WORD = /[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}’'-]*/gu;
// After these the next word starts a new part of the title, so it keeps its capital.
const BREAK = /(?:^|[:(]|\s[-–—]\s)\s*\S*$/u;

// Compiled once per name: this runs over every event on every render.
const nameRes = new Map<string, RegExp>();
function nameRe(name: string): RegExp {
  let re = nameRes.get(name);
  if (!re) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    re = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'gu');
    nameRes.set(name, re);
  }
  return re;
}

/**
 * "Introduction to Screenprinting Workshop" → "Introduction to screenprinting workshop".
 * Keeps capitals on: the first word of the title and of each part (after ":",
 * "(", " - ", " – ", " — "); words with capitals inside or all caps
 * ("PosterLab", "RIBA", "II"); and `names` plus PROPER_NOUNS.
 */
export function sentenceCase(title: string, names: string[] = []): string {
  if (!title) return title;

  // Mark the characters covered by protected names.
  const keep = new Uint8Array(title.length);
  for (const name of [...names, ...PROPER_NOUNS]) {
    const n = name?.trim();
    if (!n || n.length < 2 || !title.includes(n)) continue;
    for (const m of title.matchAll(nameRe(n))) keep.fill(1, m.index, m.index + m[0].length);
  }

  return title.replace(WORD, (word, offset: number) => {
    if (keep[offset]) return word;
    // First word of the title or of a new part.
    if (BREAK.test(title.slice(0, offset))) return word;
    // Lower-case only plain capitalised words; each part of a hyphenated word
    // is checked on its own ("Hand-Built" → "hand-built", "POP-UP" stays).
    return word
      .split('-')
      .map((part) => (TITLE_WORD.test(part) ? part.toLocaleLowerCase() : part))
      .join('-');
  });
}
