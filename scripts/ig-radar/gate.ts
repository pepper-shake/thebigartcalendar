import Anthropic from '@anthropic-ai/sdk';

// ig-radar — Phase 2: Filter (the "gate").
//
// A cheap, text-only classifier: does this post announce a FUTURE, attendable
// creative event? It only decides yes/no — extraction (Phase 3) does the real
// work. Its job is to kill the ~70–80% of posts that are recaps, promos, or
// filler before we spend on full extraction.
//
// Deliberately multilingual and tense-aware: the first real account posts in
// Ukrainian/Portuguese/English, and mixes event announcements with "thank you
// for the class" recaps that keyword filters would wrongly flag.

export interface GateResult {
  isEvent: boolean;
  confidence: number;        // 0–1
  typeGuess: string | null;  // rough hint, not authoritative
  reason: string;            // one short line, for debugging/tuning
}

export interface GateInput {
  caption: string;
  publishedAt: Date | null;
  accountName?: string;
}

const SYSTEM = `You classify Instagram posts for an ART & CREATIVE events calendar.

Decide ONE thing: does this post announce a FUTURE, attendable CREATIVE/ARTISTIC
event — something a person could show up to that is about art or creative making?

Answer regardless of the caption's language (Ukrainian, Portuguese, English, etc.).

Count as an event (is_event = true) — CREATIVE/ARTISTIC and attendable:
- Art/craft workshops or classes: painting, watercolor, drawing, ceramics/pottery,
  printmaking, collage, sculpture, bookbinding, jewelry, textiles, calligraphy, etc.
- Exhibitions, gallery openings, art fairs, open studios, art markets.
- Live creative performance: concerts, music, dance, theatre, singing circles.
- Creative courses, art camps, or creative meetups.
- Counts whether it has a specific future date OR is recurring ("every Tuesday 18:30"),
  OR is an announced series/season of upcoming creative events.

Do NOT count (is_event = false):
- NON-creative events, even if attendable: public-speaking/debate clubs, language
  lessons, business/networking, fitness/yoga, therapy or support groups, religious
  or political gatherings, generic community meetups, daycare.
- Recaps or thank-you posts about something that ALREADY happened ("thank you for
  the wonderful clay class") — past tense.
- Generic promotion, branding, discounts or price lists with no specific event.
- Testimonials, staff intros, or activity photos with no attendable event.

If unsure whether it is creative, or whether it is attendable, answer false.

Return ONLY valid JSON, no markdown:
{"is_event": boolean, "confidence": number 0-1, "type_guess": string|null, "reason": "short"}`;

/** Classify a single post. Cheap Haiku call. */
export async function gatePost(input: GateInput): Promise<GateResult> {
  const anthropic = new Anthropic();
  const today = new Date().toISOString().split('T')[0];
  const posted = input.publishedAt?.toISOString().split('T')[0] ?? 'unknown';

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Today: ${today}. Post published: ${posted}. Account: ${input.accountName ?? 'unknown'}.

Caption:
${input.caption || '(no caption)'}`,
      },
    ],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
  const json = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');

  try {
    const p = JSON.parse(json) as Record<string, unknown>;
    return {
      isEvent: Boolean(p.is_event),
      confidence: typeof p.confidence === 'number' ? p.confidence : 0,
      typeGuess: (p.type_guess as string | null) ?? null,
      reason: (p.reason as string | null) ?? '',
    };
  } catch {
    // A parse failure shouldn't crash the batch; treat as "unsure, not an event".
    console.error(`[gate] JSON parse failed: ${raw.slice(0, 200)}`);
    return { isEvent: false, confidence: 0, typeGuess: null, reason: 'parse-failed' };
  }
}
