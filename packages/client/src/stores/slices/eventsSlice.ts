import type { StateCreator } from 'zustand';
import type { GameEvent, EventRecord } from '@leviathan/shared';

export interface EventsSlice {
  activeEvent: GameEvent | null;
  activeEventFlavor: string | null;
  eventHistory: EventRecord[];

  setActiveEvent: (event: GameEvent | null, flavor?: string | null) => void;
  resolveEvent: (eventId: string, choiceId: string, era: number) => void;
  loadEvents: (history: EventRecord[]) => void;
  resetEvents: () => void;
}

export const createEventsSlice: StateCreator<EventsSlice, [], [], EventsSlice> = (set) => ({
  activeEvent: null,
  activeEventFlavor: null,
  eventHistory: [],

  setActiveEvent: (event, flavor = null) =>
    set({ activeEvent: event, activeEventFlavor: flavor ?? null }),

  resolveEvent: (eventId, choiceId, era) =>
    set((s) => ({
      activeEvent: null,
      activeEventFlavor: null,
      eventHistory: [...s.eventHistory, { eventId, era, choiceId }],
    })),

  loadEvents: (history) =>
    set({ eventHistory: history, activeEvent: null, activeEventFlavor: null }),

  resetEvents: () =>
    set({ activeEvent: null, activeEventFlavor: null, eventHistory: [] }),
});
