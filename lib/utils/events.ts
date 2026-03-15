import type { Event } from "@/lib/types";

/** Sort events by start time ascending, then by end time as tiebreaker. Front-end only; does not mutate. */
export function sortEventsByDateAndTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const tA = new Date(a.startTime).getTime();
    const tB = new Date(b.startTime).getTime();
    if (tA !== tB) return tA - tB;
    return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
  });
}
