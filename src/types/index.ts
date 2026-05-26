export type EventType = 'gallery' | 'performance' | 'fair' | 'auction' | 'workshop';

export interface AgendaItem {
  time: string;
  description: string;
}

export interface ArtEvent {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime?: string;
  venue: string;
  city: string;
  country: string;
  address: string;
  description: string;
  image?: string;
  ticketsUrl?: string;
  price?: string;
  participants?: string[];
  agenda?: AgendaItem[];
  tags?: string[];
}

export interface CalendarFilters {
  type: EventType | 'all';
  city: string | 'all';
}
