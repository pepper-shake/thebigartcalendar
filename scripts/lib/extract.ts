import Anthropic from '@anthropic-ai/sdk';
import type { NewEvent } from '../../src/db/schema';
import { makeId } from './upsert';

export interface SiteContext {
  sourceName: string;
  defaultCity?: string;
  defaultCountry?: string;
  defaultVenue?: string;
  defaultAddress?: string;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    // Preserve image URLs inline before stripping tags so Claude can see them
    .replace(/<img\b[^>]*?(?:src|data-src)=["']([^"']+)["'][^>]*>/gi, (_, src) => {
      const absolute = src.startsWith('//') ? `https:${src}` : src;
      // Strip Shopify width params — the base URL is the canonical image
      const clean = absolute.split('?')[0];
      return ` [IMAGE: ${clean}] `;
    })
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function extractEventsFromHtml(
  html: string,
  context: SiteContext,
  { maxChars = 60_000 }: { maxChars?: number } = {},
): Promise<NewEvent[]> {
  const anthropic = new Anthropic();
  const today = new Date().toISOString().split('T')[0];
  const text = stripHtml(html).slice(0, maxChars);

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    // 4096 was too small for sources with many events — a full JSON array of
    // ~12+ events overflowed it and the truncated response failed to parse.
    // Haiku 4.5 allows up to 64K; 8192 is plenty of headroom here.
    max_tokens: 8192,
    system: `You are an event data extractor for an art calendar. Extract upcoming art events from website text and return a JSON array.

Today is ${today}. Only include events whose end date (or start date if no end date) is on or after today. Skip past events entirely.

Important: if the same event title appears on multiple dates (e.g. a festival listed day-by-day), merge them into ONE entry — use the earliest date as startDate and the latest date as endDate.

For each event return an object with these fields:
- title: string (required)
- type: one of "gallery" | "fair" | "workshop" | "performance" | "auction"
- startDate: "YYYY-MM-DD" (required)
- endDate: "YYYY-MM-DD" or null
- startTime: "HH:MM" 24-hour or null
- endTime: "HH:MM" 24-hour or null
- venue: venue name or null
- city: city name or null
- country: country name or null
- address: street address or null
- description: 1–2 sentence description or null
- imageUrl: absolute image URL or null (only if clearly an event image, not a logo)
- ticketsUrl: booking/tickets URL or null
- price: price string e.g. "€40", "Free", "from £15" or null
- tags: lowercase string array or null
- sourceUrl: URL of the specific event page (or the listing page URL if no individual page exists)

Use these defaults when the value is not found in the text:
city: ${context.defaultCity ?? 'null'}
country: ${context.defaultCountry ?? 'null'}
venue: ${context.defaultVenue ?? 'null'}
address: ${context.defaultAddress ?? 'null'}

Return ONLY valid JSON — a single array, no markdown, no explanation. Return [] if no upcoming events are found.`,
    messages: [
      {
        role: 'user',
        content: text,
      },
    ],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';

  // Strip any accidental markdown code fences
  const json = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');

  let drafts: Record<string, unknown>[];
  try {
    const parsed = JSON.parse(json);
    drafts = Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error(`[extract] JSON parse failed. Response snippet: ${raw.slice(0, 300)}`);
    return [];
  }

  return drafts
    .filter((d) => d.title && d.startDate && d.sourceUrl)
    // Enforce the "no past events" rule deterministically — the model is asked
    // to drop past events but occasionally keeps a recently-passed one. Compare
    // the event's end date (or start date) against today; ISO YYYY-MM-DD strings
    // sort lexicographically, so a plain string compare is correct.
    .filter((d) => ((d.endDate as string | null) ?? (d.startDate as string)) >= today)
    .map((d) => ({
      id: makeId(d.sourceUrl as string, d.title as string, d.startDate as string),
      title: d.title as string,
      type: (d.type as NewEvent['type']) ?? 'gallery',
      startDate: d.startDate as string,
      endDate: (d.endDate as string | null) ?? null,
      startTime: (d.startTime as string | null) ?? null,
      endTime: (d.endTime as string | null) ?? null,
      venue: (d.venue as string | null) ?? null,
      city: (d.city as string | null) ?? null,
      country: (d.country as string | null) ?? null,
      address: (d.address as string | null) ?? null,
      description: (d.description as string | null) ?? null,
      imageUrl: (d.imageUrl as string | null) ?? null,
      ticketsUrl: (d.ticketsUrl as string | null) ?? null,
      price: (d.price as string | null) ?? null,
      tags: (d.tags as string[] | null) ?? null,
      sourceUrl: d.sourceUrl as string,
      sourceName: context.sourceName,
      externalId: null,
      scrapedAt: new Date(),
    }));
}
