import { eq, and, desc } from "drizzle-orm";
import { db as configuredDb, dbProvider } from "./db";
import {
  users, buildings, categories, clubs, events,
  clubMemberships, eventSaves, reservations,
  announcements, notifications,
  type User, type InsertUser, type Building, type Category,
  type Club, type InsertClub, type Event, type InsertEvent,
  type ClubMembership, type EventSave, type Reservation,
  type Announcement, type InsertAnnouncement, type Notification,
} from "@shared/schema";
import { sql } from "drizzle-orm";
import { SqliteStorage, initializeSqliteDatabase } from "./sqlite";

const db = configuredDb as NonNullable<typeof configuredDb>;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfileImage(id: string, imageUrl: string): Promise<void>;

  getBuildings(): Promise<Building[]>;
  getCategories(): Promise<Category[]>;

  getClubs(): Promise<Club[]>;
  getClub(id: string): Promise<Club | undefined>;
  createClub(club: InsertClub): Promise<Club>;
  updateClubProfileImage(id: string, imageUrl: string): Promise<void>;
  updateClubCoverImage(id: string, imageUrl: string): Promise<void>;

  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEventCoverImage(id: string, imageUrl: string): Promise<void>;

  getMemberships(userId: string): Promise<ClubMembership[]>;
  joinClub(userId: string, clubId: string): Promise<ClubMembership>;
  leaveClub(userId: string, clubId: string): Promise<void>;

  getSaves(userId: string): Promise<EventSave[]>;
  saveEvent(userId: string, eventId: string): Promise<EventSave>;
  unsaveEvent(userId: string, eventId: string): Promise<void>;

  getReservations(userId: string): Promise<Reservation[]>;
  makeReservation(userId: string, eventId: string): Promise<Reservation | null>;
  cancelReservation(userId: string, eventId: string): Promise<void>;

  getAnnouncements(clubId?: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;

  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserProfileImage(id: string, imageUrl: string): Promise<void> {
    await db.update(users).set({ profileImage: imageUrl }).where(eq(users.id, id));
  }

  async getBuildings(): Promise<Building[]> {
    return db.select().from(buildings);
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getClubs(): Promise<Club[]> {
    return db.select().from(clubs);
  }

  async getClub(id: string): Promise<Club | undefined> {
    const [club] = await db.select().from(clubs).where(eq(clubs.id, id));
    return club;
  }

  async createClub(insertClub: InsertClub): Promise<Club> {
    const [club] = await db.insert(clubs).values(insertClub).returning();
    return club;
  }

  async updateClubProfileImage(id: string, imageUrl: string): Promise<void> {
    await db.update(clubs).set({ profileImage: imageUrl }).where(eq(clubs.id, id));
  }

  async updateClubCoverImage(id: string, imageUrl: string): Promise<void> {
    await db.update(clubs).set({ coverImage: imageUrl }).where(eq(clubs.id, id));
  }

  async getEvents(): Promise<Event[]> {
    return db.select().from(events);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async updateEventCoverImage(id: string, imageUrl: string): Promise<void> {
    await db.update(events).set({ coverImage: imageUrl }).where(eq(events.id, id));
  }

  async getMemberships(userId: string): Promise<ClubMembership[]> {
    return db.select().from(clubMemberships).where(eq(clubMemberships.userId, userId));
  }

  async joinClub(userId: string, clubId: string): Promise<ClubMembership> {
    const existing = await db.select().from(clubMemberships)
      .where(and(eq(clubMemberships.userId, userId), eq(clubMemberships.clubId, clubId)));
    if (existing.length > 0) return existing[0];

    const [membership] = await db.insert(clubMemberships)
      .values({ userId, clubId, role: "member" })
      .returning();

    await db.update(clubs)
      .set({ memberCount: sql`${clubs.memberCount} + 1` })
      .where(eq(clubs.id, clubId));

    return membership;
  }

  async leaveClub(userId: string, clubId: string): Promise<void> {
    const deleted = await db.delete(clubMemberships)
      .where(and(eq(clubMemberships.userId, userId), eq(clubMemberships.clubId, clubId)))
      .returning();

    if (deleted.length > 0) {
      await db.update(clubs)
        .set({ memberCount: sql`GREATEST(${clubs.memberCount} - 1, 0)` })
        .where(eq(clubs.id, clubId));
    }
  }

  async getSaves(userId: string): Promise<EventSave[]> {
    return db.select().from(eventSaves).where(eq(eventSaves.userId, userId));
  }

  async saveEvent(userId: string, eventId: string): Promise<EventSave> {
    const existing = await db.select().from(eventSaves)
      .where(and(eq(eventSaves.userId, userId), eq(eventSaves.eventId, eventId)));
    if (existing.length > 0) return existing[0];

    const [save] = await db.insert(eventSaves)
      .values({ userId, eventId })
      .returning();
    return save;
  }

  async unsaveEvent(userId: string, eventId: string): Promise<void> {
    await db.delete(eventSaves)
      .where(and(eq(eventSaves.userId, userId), eq(eventSaves.eventId, eventId)));
  }

  async getReservations(userId: string): Promise<Reservation[]> {
    return db.select().from(reservations)
      .where(and(eq(reservations.userId, userId), eq(reservations.status, "confirmed")));
  }

  async makeReservation(userId: string, eventId: string): Promise<Reservation | null> {
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) return null;

    if (event.hasLimitedCapacity && event.maxCapacity !== null && event.currentReservations >= event.maxCapacity) {
      return null;
    }

    const existing = await db.select().from(reservations)
      .where(and(
        eq(reservations.userId, userId),
        eq(reservations.eventId, eventId),
        eq(reservations.status, "confirmed")
      ));
    if (existing.length > 0) return existing[0];

    const [reservation] = await db.insert(reservations)
      .values({ userId, eventId, status: "confirmed" })
      .returning();

    await db.update(events)
      .set({ currentReservations: sql`${events.currentReservations} + 1` })
      .where(eq(events.id, eventId));

    return reservation;
  }

  async cancelReservation(userId: string, eventId: string): Promise<void> {
    const deleted = await db.update(reservations)
      .set({ status: "cancelled" })
      .where(and(
        eq(reservations.userId, userId),
        eq(reservations.eventId, eventId),
        eq(reservations.status, "confirmed")
      ))
      .returning();

    if (deleted.length > 0) {
      await db.update(events)
        .set({ currentReservations: sql`GREATEST(${events.currentReservations} - 1, 0)` })
        .where(eq(events.id, eventId));
    }
  }

  async getAnnouncements(clubId?: string): Promise<Announcement[]> {
    if (clubId) {
      return db.select().from(announcements)
        .where(eq(announcements.clubId, clubId))
        .orderBy(desc(announcements.createdAt));
    }
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements)
      .values(announcement)
      .returning();
    return created;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

if (dbProvider === "sqlite") {
  initializeSqliteDatabase();
}

export const storage: IStorage =
  dbProvider === "sqlite" ? (new SqliteStorage() as IStorage) : new DatabaseStorage();
