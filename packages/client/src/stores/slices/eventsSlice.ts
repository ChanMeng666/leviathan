import type { StateCreator } from 'zustand';
import type { GameEvent } from '@leviathan/shared';
import { GAME_EVENTS } from '@leviathan/shared';

export interface EventRecord {
  eventId: string;
  day: number;
  choiceId: string;
}

export interface EventsSlice {
  eventQueue: GameEvent[];
  activeEvent: GameEvent | null;
  activeEventFlavor: string | null;
  eventHistory: EventRecord[];
  eventCooldowns: Record<string, number>;  // eventId -> day when cooldown expires

  checkEvents: (day: number) => void;
  setActiveEvent: (event: GameEvent | null, flavor?: string | null) => void;
  resolveEvent: (eventId: string, choiceId: string, day: number) => void;
  loadEvents: (history: EventRecord[], cooldowns: Record<string, number>) => void;
  resetEvents: () => void;
}

export const createEventsSlice: StateCreator<EventsSlice, [], [], EventsSlice> = (set, get) => ({
  eventQueue: [],
  activeEvent: null,
  activeEventFlavor: null,
  eventHistory: [],
  eventCooldowns: {},

  checkEvents: (_day) =>
    set(() => {
      // Events are checked externally via useGameLoop which has access to nation state
      // This is a placeholder — the actual trigger check happens in the hook
      return {};
    }),

  setActiveEvent: (event, flavor = null) =>
    set({ activeEvent: event, activeEventFlavor: flavor ?? null }),

  resolveEvent: (eventId, choiceId, day) =>
    set((s) => ({
      activeEvent: null,
      activeEventFlavor: null,
      eventHistory: [...s.eventHistory, { eventId, day, choiceId }],
      eventCooldowns: {
        ...s.eventCooldowns,
        [eventId]: day + (GAME_EVENTS.find((e) => e.id === eventId)?.cooldown ?? 5),
      },
    })),

  loadEvents: (history, cooldowns) =>
    set({
      eventHistory: history,
      eventCooldowns: cooldowns,
      eventQueue: [],
      activeEvent: null,
      activeEventFlavor: null,
    }),

  resetEvents: () =>
    set({
      eventQueue: [],
      activeEvent: null,
      activeEventFlavor: null,
      eventHistory: [],
      eventCooldowns: {},
    }),
});
