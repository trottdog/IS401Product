export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface Building {
  id: string;
  name: string;
  abbreviation: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  memberCount: number;
  imageColor: string;
  contactEmail: string;
  website: string;
  instagram: string;
  coverImage?: string;
}

export interface ClubMembership {
  id: string;
  userId: string;
  clubId: string;
  role: "member" | "admin" | "president";
  joinedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  clubId: string;
  buildingId: string;
  categoryId: string;
  startTime: string;
  endTime: string;
  room: string;
  hasLimitedCapacity: boolean;
  maxCapacity: number | null;
  currentReservations: number;
  hasFood: boolean;
  foodDescription: string | null;
  tags: string[];
  isCancelled: boolean;
  coverImage?: string;
}

export interface EventSave {
  id: string;
  userId: string;
  eventId: string;
  savedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  eventId: string;
  reservedAt: string;
  status: "confirmed" | "cancelled";
}

export interface Announcement {
  id: string;
  clubId: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "event_change" | "reservation" | "announcement" | "membership";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  relatedId: string | null;
}

export type TimeLabel = "Now" | "Soon" | "Today" | "Tomorrow" | "This Week" | "Upcoming";

export function getTimeLabel(startTime: string, endTime: string): TimeLabel {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now >= start && now <= end) return "Now";

  const diffMs = start.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours > 0 && diffHours <= 2) return "Soon";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dayDiff = (startDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Tomorrow";
  if (dayDiff <= 7) return "This Week";
  return "Upcoming";
}

export function getTimeLabelColor(label: TimeLabel): string {
  switch (label) {
    case "Now": return "#10B981";
    case "Soon": return "#F59E0B";
    case "Today": return "#0062B8";
    case "Tomorrow": return "#6366F1";
    case "This Week": return "#8B5CF6";
    case "Upcoming": return "#9CA3AF";
  }
}

export function formatEventTime(startTime: string): string {
  const d = new Date(startTime);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  const m = minutes < 10 ? `0${minutes}` : minutes;
  return `${h}:${m} ${ampm}`;
}

export function formatEventDate(startTime: string): string {
  const d = new Date(startTime);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}
