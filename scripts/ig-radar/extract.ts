import { randomUUID } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import type { NewEventCandidate } from '../../src/db/schema-instagram';

// ig-radar — Phase 3: Extract.
//
// Turns an event post's caption into structured event facts. Text-only for now
// (caption carries the details); vision over the flyer image can be added later.
//
// Contract (see docs/exec-plans/active/ig-radar.md):
//   • Null over guess — never invent a missing field.
//   • Relative dates ("this Saturday") resolve against the POST'S publish date.
//   • description is PARAPHRASED in English — never a copy of the caption.
//   • Input may be any language; title/description are normalized to English.
//   • One post can yield MANY events (a "series" post) → return an array.

export const PROMPT_VERSION = 'extract-v1';
const MODEL = 'claude-haiku-4-5-20251001';

export interface ExtractInput {
  postId: string;
  caption: string;
  publishedAt: Date | null;
  defaultCity: string | null;
  defaultCountry: string | null;
  organizerName: string | null; // account display name — organizer fallback
}

function systemPrompt(input: ExtractInput): string {
  const posted = input.publishedAt?.toISOString().split('T')[0] ?? 'unknown';
  return `You extract structured creative-event data from a single Instagram caption for an art-events calendar.

The post was published on ${posted}. Resolve any relative dates ("this Saturday", "next Tuesday", "tomorrow") against THAT date, and output absolute dates.

The caption may be in any language (Ukrainian, Portuguese, English, …). Write the title and description in ENGLISH (translate if needed).

Return a JSON ARRAY. A caption may describe ONE event, MANY events (a "series"/season announcement — return one object each), or none (return []).

For each event, an object with these fields:
- title: short English title (required)
- organizer: string or null (default "${input.organizerName ?? 'null'}")
- venue: string or null
- type: one of "workshop" | "gallery" | "fair" | "performance" | "auction" or null
- technique: creative technique if any (e.g. "watercolor", "ceramics", "bookbinding") or null
- start_date: "YYYY-MM-DD" or null
- end_date: "YYYY-MM-DD" or null
- start_time: "HH:MM" 24h or null
- end_time: "HH:MM" 24h or null
- price: human string ("€40", "free", "from €15") or null
- tickets_url: registration/booking URL or null
- city: string or null (default "${input.defaultCity ?? 'null'}" if the caption doesn't state one)
- country: string or null. If not stated, infer it from the city (e.g. Lisbon → Portugal).
- description: neutral 1–2 sentence English summary IN YOUR OWN WORDS. State only facts (what, when, where, for whom). Do NOT copy phrases from the caption. No emojis, no marketing tone. Max ~300 chars.
- tags: lowercase English array — mix of technique, atmosphere (e.g. "beginner-friendly", "kids", "community", "wine", "relaxed"), and type. Or [].
- confidence: number 0-1, your confidence this is a real, well-specified event.

Rules:
- NULL over guessing. If a field is not stated, use null (except the city/country/organizer defaults above).
- A recurring event ("every Tuesday 18:30") is one event; put the time, leave start_date null if no concrete next date is given.
- Return ONLY valid JSON — a single array, no markdown, no commentary.`;
}

/** Extract 0..N event candidates from one post. */
export async function extractCandidates(input: ExtractInput): Promise<NewEventCandidate[]> {
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt(input),
    messages: [{ role: 'user', content: input.caption || '(no caption)' }],
  });

  const rawText = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';
  // Grab the JSON array wherever it sits — the model sometimes wraps it in code
  // fences or adds commentary after it. First '[' to last ']' is the top array.
  const match = rawText.match(/\[[\s\S]*\]/);
  const json = match ? match[0] : '[]';

  let drafts: Record<string, unknown>[];
  try {
    const parsed = JSON.parse(json);
    drafts = Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error(`[extract] JSON parse failed for post ${input.postId}: ${rawText.slice(0, 200)}`);
    return [];
  }

  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

  return drafts
    .filter((d) => str(d.title)) // a candidate with no title is useless
    .map((d): NewEventCandidate => ({
      id: randomUUID(),
      postId: input.postId,
      title: str(d.title),
      organizer: str(d.organizer) ?? input.organizerName,
      venue: str(d.venue),
      type: str(d.type),
      technique: str(d.technique),
      startDate: str(d.start_date),
      endDate: str(d.end_date),
      startTime: str(d.start_time),
      endTime: str(d.end_time),
      price: str(d.price),
      ticketsUrl: str(d.tickets_url),
      city: str(d.city) ?? input.defaultCity,
      country: str(d.country) ?? input.defaultCountry,
      description: str(d.description),
      tags: Array.isArray(d.tags) ? (d.tags as string[]) : null,
      confidence: typeof d.confidence === 'number' ? d.confidence : null,
      fieldConfidence: null,
      promptVersion: PROMPT_VERSION,
      model: MODEL,
    }));
}
