import { getApiUrl } from "@/lib/api/query-client";
import { fetch } from "expo/fetch";

const api = (path: string, options?: RequestInit) => {
  const baseUrl = getApiUrl();
  const url = new URL(path, baseUrl);
  return fetch(url.toString(), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

async function getErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return data?.message || fallback;
  } catch {
    try {
      const text = await res.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
}

export async function initializeStore(): Promise<void> {}

export async function resetStore(): Promise<void> {}

export async function login(
  email: string,
  password: string,
  name?: string
): Promise<any | null> {
  const res = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, ...(name?.trim() ? { name: name.trim() } : {}) }),
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Login failed"));
  }
  return res.json();
}

export async function register(name: string, email: string, password: string): Promise<any> {
  const res = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Registration failed"));
  }
  return res.json();
}

export async function getAuthUser(): Promise<any | null> {
  try {
    const res = await api("/api/auth/me");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const res = await api("/api/auth/logout", { method: "POST" });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Logout failed"));
  }
}

export async function getBuildings(): Promise<any[]> {
  const res = await api("/api/buildings");
  return res.json();
}

export async function getCategories(): Promise<any[]> {
  const res = await api("/api/categories");
  return res.json();
}

export async function getClubs(): Promise<any[]> {
  const res = await api("/api/clubs");
  return res.json();
}

export async function getClub(id: string): Promise<any | undefined> {
  const res = await api(`/api/clubs/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function getEvents(): Promise<any[]> {
  const res = await api("/api/events");
  const data = await res.json();
  return data.map((e: any) => ({
    ...e,
    startTime: e.startTime,
    endTime: e.endTime,
    tags: e.tags || [],
  }));
}

export async function getEvent(id: string): Promise<any | undefined> {
  const res = await api(`/api/events/${id}`);
  if (!res.ok) return undefined;
  const e = await res.json();
  return { ...e, tags: e.tags || [] };
}

export async function getMemberships(userId: string): Promise<any[]> {
  const res = await api("/api/memberships");
  if (!res.ok) return [];
  return res.json();
}

export async function joinClub(userId: string, clubId: string): Promise<any> {
  const res = await api("/api/memberships", {
    method: "POST",
    body: JSON.stringify({ clubId }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to join club"));
  }
  return res.json();
}

export async function leaveClub(userId: string, clubId: string): Promise<void> {
  const res = await api(`/api/memberships/${clubId}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to leave club"));
  }
}

export async function getSaves(userId: string): Promise<any[]> {
  const res = await api("/api/saves");
  if (!res.ok) return [];
  return res.json();
}

export async function saveEvent(userId: string, eventId: string): Promise<any> {
  const res = await api("/api/saves", {
    method: "POST",
    body: JSON.stringify({ eventId }),
  });
  return res.json();
}

export async function unsaveEvent(userId: string, eventId: string): Promise<void> {
  await api(`/api/saves/${eventId}`, { method: "DELETE" });
}

export async function getReservations(userId: string): Promise<any[]> {
  const res = await api("/api/reservations");
  if (!res.ok) return [];
  return res.json();
}

export async function makeReservation(userId: string, eventId: string): Promise<any | null> {
  const res = await api("/api/reservations", {
    method: "POST",
    body: JSON.stringify({ eventId }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function cancelReservation(userId: string, eventId: string): Promise<void> {
  await api(`/api/reservations/${eventId}`, { method: "DELETE" });
}

export async function getAnnouncements(clubId?: string): Promise<any[]> {
  const path = clubId ? `/api/announcements?clubId=${clubId}` : "/api/announcements";
  const res = await api(path);
  return res.json();
}

export async function createAnnouncement(clubId: string, title: string, body: string): Promise<any> {
  const res = await api("/api/announcements", {
    method: "POST",
    body: JSON.stringify({ clubId, title, body }),
  });
  return res.json();
}

export async function getNotifications(userId: string): Promise<any[]> {
  const res = await api("/api/notifications");
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await api(`/api/notifications/${notifId}/read`, { method: "PATCH" });
}

export async function createEvent(event: any): Promise<any> {
  const res = await api("/api/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to create event"));
  }
  return res.json();
}

export async function updateEvent(
  eventId: string,
  body: {
    title?: string;
    description?: string;
    buildingId?: string;
    categoryId?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    hasLimitedCapacity?: boolean;
    maxCapacity?: number | null;
    hasFood?: boolean;
    foodDescription?: string | null;
    tags?: string[];
    isCancelled?: boolean;
  },
): Promise<any> {
  const res = await api(`/api/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to update event"));
  }
  return res.json();
}

export async function updateEventCoverImage(eventId: string, imageUri: string): Promise<void> {
  await api(`/api/events/${eventId}/cover-image`, {
    method: "PATCH",
    body: JSON.stringify({ imageUrl: imageUri }),
  });
}

export async function updateClubCoverImage(clubId: string, imageUri: string): Promise<void> {
  const res = await api(`/api/clubs/${clubId}/cover-image`, {
    method: "PATCH",
    body: JSON.stringify({ imageUrl: imageUri }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to update cover image"));
  }
}

export async function updateClubProfileImage(clubId: string, imageUri: string): Promise<void> {
  const res = await api(`/api/clubs/${clubId}/profile-image`, {
    method: "PATCH",
    body: JSON.stringify({ imageUrl: imageUri }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to update profile image"));
  }
}

export async function updateClubDetails(
  clubId: string,
  body: {
    name?: string;
    description?: string;
    contactEmail?: string;
    website?: string;
    instagram?: string;
  },
): Promise<any> {
  const res = await api(`/api/clubs/${clubId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, "Failed to update club"));
  }
  return res.json();
}
