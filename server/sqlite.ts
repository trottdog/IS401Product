import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import session from "express-session";
import type { SessionData } from "express-session";
import { getTableName } from "drizzle-orm";
import {
  announcements,
  buildings,
  categories,
  clubs,
  clubMemberships,
  events,
  eventSaves,
  notifications,
  reservations,
  users,
  type Announcement,
  type Building,
  type Category,
  type Club,
  type ClubMembership,
  type Event,
  type EventSave,
  type InsertAnnouncement,
  type InsertClub,
  type InsertEvent,
  type InsertUser,
  type Notification,
  type Reservation,
  type User,
} from "@shared/schema";
import {
  BUILDINGS,
  CATEGORIES,
  CLUBS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_MEMBERSHIPS,
  DEFAULT_USER,
  EVENTS,
} from "../lib/data/seed-data";

const sqlitePath =
  process.env.SQLITE_DB_PATH ||
  path.resolve(process.cwd(), ".local", "byuconnect.sqlite");

fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });

export const sqlite = new Database(sqlitePath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const tableNames = {
  users: getTableName(users),
  buildings: getTableName(buildings),
  categories: getTableName(categories),
  clubs: getTableName(clubs),
  events: getTableName(events),
  clubMemberships: getTableName(clubMemberships),
  eventSaves: getTableName(eventSaves),
  reservations: getTableName(reservations),
  announcements: getTableName(announcements),
  notifications: getTableName(notifications),
  sessions: "sessions",
};

type SessionRow = {
  sid: string;
  sess: string;
  expiresAt: string;
};

function toDate(value: string | null | undefined) {
  if (!value) return undefined;
  return new Date(value);
}

function toBoolean(value: number | boolean | null | undefined) {
  return Boolean(value);
}

function parseTags(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeUser(row: any): User {
  return {
    ...row,
    profileImage: row.profileImage ?? undefined,
    createdAt: toDate(row.createdAt)!,
  };
}

function normalizeClub(row: any): Club {
  return {
    ...row,
    profileImage: row.profileImage ?? undefined,
    coverImage: row.coverImage ?? undefined,
  };
}

function normalizeEvent(row: any): Event {
  return {
    ...row,
    startTime: toDate(row.startTime)!,
    endTime: toDate(row.endTime)!,
    hasLimitedCapacity: toBoolean(row.hasLimitedCapacity),
    hasFood: toBoolean(row.hasFood),
    isCancelled: toBoolean(row.isCancelled),
    tags: parseTags(row.tags),
    coverImage: row.coverImage ?? undefined,
  };
}

function normalizeMembership(row: any): ClubMembership {
  return {
    ...row,
    joinedAt: toDate(row.joinedAt)!,
  };
}

function normalizeSave(row: any): EventSave {
  return {
    ...row,
    savedAt: toDate(row.savedAt)!,
  };
}

function normalizeReservation(row: any): Reservation {
  return {
    ...row,
    reservedAt: toDate(row.reservedAt)!,
  };
}

function normalizeAnnouncement(row: any): Announcement {
  return {
    ...row,
    createdAt: toDate(row.createdAt)!,
  };
}

function normalizeNotification(row: any): Notification {
  return {
    ...row,
    read: toBoolean(row.read),
    createdAt: toDate(row.createdAt)!,
  };
}

export function initializeSqliteDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS ${tableNames.users} (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      profile_image TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.buildings} (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      abbreviation TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.categories} (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.clubs} (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id TEXT NOT NULL,
      member_count INTEGER NOT NULL DEFAULT 0,
      image_color TEXT NOT NULL,
      contact_email TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      instagram TEXT NOT NULL DEFAULT '',
      profile_image TEXT,
      cover_image TEXT
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.events} (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      club_id TEXT NOT NULL,
      building_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT NOT NULL,
      has_limited_capacity INTEGER NOT NULL DEFAULT 0,
      max_capacity INTEGER,
      current_reservations INTEGER NOT NULL DEFAULT 0,
      has_food INTEGER NOT NULL DEFAULT 0,
      food_description TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      is_cancelled INTEGER NOT NULL DEFAULT 0,
      cover_image TEXT
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.clubMemberships} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      club_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, club_id)
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.eventSaves} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id)
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.reservations} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      reserved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'confirmed'
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.announcements} (
      id TEXT PRIMARY KEY,
      club_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.notifications} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      related_id TEXT
    );

    CREATE TABLE IF NOT EXISTS ${tableNames.sessions} (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
    ON ${tableNames.sessions} (expires_at);
  `);

  pruneExpiredSessions();

  const existingUsers = sqlite
    .prepare(`SELECT COUNT(*) as count FROM ${tableNames.users}`)
    .get() as { count: number };

  if (existingUsers.count > 0) {
    return;
  }

  const seed = sqlite.transaction(() => {
    sqlite
      .prepare(
        `INSERT INTO ${tableNames.users} (id, email, name, password, created_at) VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        DEFAULT_USER.id,
        DEFAULT_USER.email,
        DEFAULT_USER.name,
        DEFAULT_USER.password,
        DEFAULT_USER.createdAt,
      );

    const buildingStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.buildings} (id, name, abbreviation, latitude, longitude, address) VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const building of BUILDINGS) {
      buildingStmt.run(
        building.id,
        building.name,
        building.abbreviation,
        building.latitude,
        building.longitude,
        building.address,
      );
    }

    const categoryStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.categories} (id, name, icon) VALUES (?, ?, ?)`,
    );
    for (const category of CATEGORIES) {
      categoryStmt.run(category.id, category.name, category.icon);
    }

    const clubStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.clubs} (id, name, description, category_id, member_count, image_color, contact_email, website, instagram, profile_image, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const club of CLUBS) {
      clubStmt.run(
        club.id,
        club.name,
        club.description,
        club.categoryId,
        club.memberCount,
        club.imageColor,
        club.contactEmail,
        club.website,
        club.instagram,
        club.profileImage ?? null,
        club.coverImage ?? null,
      );
    }

    const eventStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.events} (id, title, description, club_id, building_id, category_id, start_time, end_time, room, has_limited_capacity, max_capacity, current_reservations, has_food, food_description, tags, is_cancelled, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const event of EVENTS) {
      eventStmt.run(
        event.id,
        event.title,
        event.description,
        event.clubId,
        event.buildingId,
        event.categoryId,
        event.startTime,
        event.endTime,
        event.room,
        event.hasLimitedCapacity ? 1 : 0,
        event.maxCapacity,
        event.currentReservations,
        event.hasFood ? 1 : 0,
        event.foodDescription,
        JSON.stringify(event.tags),
        event.isCancelled ? 1 : 0,
        event.coverImage ?? null,
      );
    }

    const membershipStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.clubMemberships} (id, user_id, club_id, role, joined_at) VALUES (?, ?, ?, ?, ?)`,
    );
    for (const membership of DEFAULT_MEMBERSHIPS) {
      membershipStmt.run(
        membership.id,
        membership.userId,
        membership.clubId,
        membership.role,
        membership.joinedAt,
      );
    }

    const announcementStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.announcements} (id, club_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)`,
    );
    for (const announcement of DEFAULT_ANNOUNCEMENTS) {
      announcementStmt.run(
        announcement.id,
        announcement.clubId,
        announcement.title,
        announcement.body,
        announcement.createdAt,
      );
    }
  });

  seed();
}

function getSessionExpiry(sessionData: SessionData) {
  const cookieExpiry = sessionData.cookie?.expires;
  if (cookieExpiry instanceof Date) {
    return cookieExpiry;
  }

  if (typeof cookieExpiry === "string") {
    const parsedExpiry = new Date(cookieExpiry);
    if (!Number.isNaN(parsedExpiry.getTime())) {
      return parsedExpiry;
    }
  }

  const maxAge = sessionData.cookie?.maxAge;
  if (typeof maxAge === "number") {
    return new Date(Date.now() + maxAge);
  }

  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export function pruneExpiredSessions() {
  sqlite
    .prepare(`DELETE FROM ${tableNames.sessions} WHERE expires_at <= ?`)
    .run(new Date().toISOString());
}

export class SqliteSessionStore extends session.Store {
  constructor() {
    super();
    pruneExpiredSessions();
  }

  override get(
    sid: string,
    callback: (err?: unknown, sessionData?: SessionData | null) => void,
  ) {
    try {
      const row = sqlite
        .prepare(
          `SELECT sid, sess, expires_at as expiresAt
           FROM ${tableNames.sessions}
           WHERE sid = ? AND expires_at > ?`,
        )
        .get(sid, new Date().toISOString()) as SessionRow | undefined;

      if (!row) {
        callback(undefined, null);
        return;
      }

      callback(undefined, JSON.parse(row.sess) as SessionData);
    } catch (error) {
      callback(error);
    }
  }

  override set(
    sid: string,
    sessionData: SessionData,
    callback?: (err?: unknown) => void,
  ) {
    try {
      const expiresAt = getSessionExpiry(sessionData).toISOString();
      sqlite
        .prepare(
          `INSERT INTO ${tableNames.sessions} (sid, sess, expires_at)
           VALUES (?, ?, ?)
           ON CONFLICT(sid) DO UPDATE SET
             sess = excluded.sess,
             expires_at = excluded.expires_at`,
        )
        .run(sid, JSON.stringify(sessionData), expiresAt);

      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  override destroy(sid: string, callback?: (err?: unknown) => void) {
    try {
      sqlite
        .prepare(`DELETE FROM ${tableNames.sessions} WHERE sid = ?`)
        .run(sid);

      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  override touch(
    sid: string,
    sessionData: SessionData,
    callback?: () => void,
  ) {
    const expiresAt = getSessionExpiry(sessionData).toISOString();
    sqlite
      .prepare(
        `UPDATE ${tableNames.sessions}
         SET sess = ?, expires_at = ?
         WHERE sid = ?`,
      )
      .run(JSON.stringify(sessionData), expiresAt, sid);

    callback?.();
  }
}

export class SqliteStorage {
  async getUser(id: string) {
    const row = sqlite
      .prepare(
        `SELECT id, email, name, password, profile_image as profileImage, created_at as createdAt FROM ${tableNames.users} WHERE id = ?`,
      )
      .get(id);
    return row ? normalizeUser(row) : undefined;
  }

  async getUserByEmail(email: string) {
    const row = sqlite
      .prepare(
        `SELECT id, email, name, password, profile_image as profileImage, created_at as createdAt FROM ${tableNames.users} WHERE email = ?`,
      )
      .get(email);
    return row ? normalizeUser(row) : undefined;
  }

  async createUser(insertUser: InsertUser) {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    sqlite
      .prepare(
        `INSERT INTO ${tableNames.users} (id, email, name, password, created_at) VALUES (?, ?, ?, ?, ?)`,
      )
      .run(id, insertUser.email, insertUser.name, insertUser.password, createdAt);
    return normalizeUser({
      id,
      ...insertUser,
      createdAt,
      profileImage: null,
    });
  }

  async updateUserProfileImage(id: string, imageUrl: string) {
    sqlite
      .prepare(`UPDATE ${tableNames.users} SET profile_image = ? WHERE id = ?`)
      .run(imageUrl, id);
  }

  async getBuildings() {
    return sqlite
      .prepare(
        `SELECT id, name, abbreviation, latitude, longitude, address FROM ${tableNames.buildings}`,
      )
      .all() as Building[];
  }

  async getCategories() {
    return sqlite
      .prepare(`SELECT id, name, icon FROM ${tableNames.categories}`)
      .all() as Category[];
  }

  async getClubs() {
    return sqlite
      .prepare(
        `SELECT id, name, description, category_id as categoryId, member_count as memberCount, image_color as imageColor, contact_email as contactEmail, website, instagram, profile_image as profileImage, cover_image as coverImage FROM ${tableNames.clubs}`,
      )
      .all()
      .map(normalizeClub);
  }

  async getClub(id: string) {
    const row = sqlite
      .prepare(
        `SELECT id, name, description, category_id as categoryId, member_count as memberCount, image_color as imageColor, contact_email as contactEmail, website, instagram, profile_image as profileImage, cover_image as coverImage FROM ${tableNames.clubs} WHERE id = ?`,
      )
      .get(id);
    return row ? normalizeClub(row) : undefined;
  }

  async createClub(insertClub: InsertClub) {
    const id = randomUUID();
    sqlite
      .prepare(
        `INSERT INTO ${tableNames.clubs} (id, name, description, category_id, member_count, image_color, contact_email, website, instagram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        insertClub.name,
        insertClub.description,
        insertClub.categoryId,
        0,
        insertClub.imageColor,
        insertClub.contactEmail,
        insertClub.website,
        insertClub.instagram,
      );
    return normalizeClub({
      id,
      ...insertClub,
      memberCount: 0,
      profileImage: null,
      coverImage: null,
    });
  }

  async updateClubProfileImage(id: string, imageUrl: string) {
    sqlite
      .prepare(`UPDATE ${tableNames.clubs} SET profile_image = ? WHERE id = ?`)
      .run(imageUrl, id);
  }

  async updateClubCoverImage(id: string, imageUrl: string) {
    sqlite
      .prepare(`UPDATE ${tableNames.clubs} SET cover_image = ? WHERE id = ?`)
      .run(imageUrl, id);
  }

  async getEvents() {
    return sqlite
      .prepare(
        `SELECT id, title, description, club_id as clubId, building_id as buildingId, category_id as categoryId, start_time as startTime, end_time as endTime, room, has_limited_capacity as hasLimitedCapacity, max_capacity as maxCapacity, current_reservations as currentReservations, has_food as hasFood, food_description as foodDescription, tags, is_cancelled as isCancelled, cover_image as coverImage FROM ${tableNames.events}`,
      )
      .all()
      .map(normalizeEvent);
  }

  async getEvent(id: string) {
    const row = sqlite
      .prepare(
        `SELECT id, title, description, club_id as clubId, building_id as buildingId, category_id as categoryId, start_time as startTime, end_time as endTime, room, has_limited_capacity as hasLimitedCapacity, max_capacity as maxCapacity, current_reservations as currentReservations, has_food as hasFood, food_description as foodDescription, tags, is_cancelled as isCancelled, cover_image as coverImage FROM ${tableNames.events} WHERE id = ?`,
      )
      .get(id);
    return row ? normalizeEvent(row) : undefined;
  }

  async createEvent(insertEvent: InsertEvent) {
    const id = randomUUID();
    sqlite
      .prepare(
        `INSERT INTO ${tableNames.events} (id, title, description, club_id, building_id, category_id, start_time, end_time, room, has_limited_capacity, max_capacity, current_reservations, has_food, food_description, tags, is_cancelled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        insertEvent.title,
        insertEvent.description,
        insertEvent.clubId,
        insertEvent.buildingId,
        insertEvent.categoryId,
        insertEvent.startTime.toISOString(),
        insertEvent.endTime.toISOString(),
        insertEvent.room,
        insertEvent.hasLimitedCapacity ? 1 : 0,
        insertEvent.maxCapacity,
        0,
        insertEvent.hasFood ? 1 : 0,
        insertEvent.foodDescription,
        JSON.stringify(insertEvent.tags),
        0,
      );

    return normalizeEvent({
      id,
      ...insertEvent,
      startTime: insertEvent.startTime.toISOString(),
      endTime: insertEvent.endTime.toISOString(),
      currentReservations: 0,
      isCancelled: 0,
      coverImage: null,
      tags: JSON.stringify(insertEvent.tags),
    });
  }

  async updateEventCoverImage(id: string, imageUrl: string) {
    sqlite
      .prepare(`UPDATE ${tableNames.events} SET cover_image = ? WHERE id = ?`)
      .run(imageUrl, id);
  }

  async getMemberships(userId: string) {
    return sqlite
      .prepare(
        `SELECT id, user_id as userId, club_id as clubId, role, joined_at as joinedAt FROM ${tableNames.clubMemberships} WHERE user_id = ?`,
      )
      .all(userId)
      .map(normalizeMembership);
  }

  async joinClub(userId: string, clubId: string) {
    const transaction = sqlite.transaction(() => {
      const existing = sqlite
        .prepare(
          `SELECT id, user_id as userId, club_id as clubId, role, joined_at as joinedAt FROM ${tableNames.clubMemberships} WHERE user_id = ? AND club_id = ?`,
        )
        .get(userId, clubId);

      if (existing) {
        return normalizeMembership(existing);
      }

      const id = randomUUID();
      const joinedAt = new Date().toISOString();
      sqlite
        .prepare(
          `INSERT INTO ${tableNames.clubMemberships} (id, user_id, club_id, role, joined_at) VALUES (?, ?, ?, ?, ?)`,
        )
        .run(id, userId, clubId, "member", joinedAt);
      sqlite
        .prepare(
          `UPDATE ${tableNames.clubs} SET member_count = member_count + 1 WHERE id = ?`,
        )
        .run(clubId);

      return normalizeMembership({ id, userId, clubId, role: "member", joinedAt });
    });

    return transaction();
  }

  async leaveClub(userId: string, clubId: string) {
    const transaction = sqlite.transaction(() => {
      const result = sqlite
        .prepare(
          `DELETE FROM ${tableNames.clubMemberships} WHERE user_id = ? AND club_id = ?`,
        )
        .run(userId, clubId);

      if (result.changes > 0) {
        sqlite
          .prepare(
            `UPDATE ${tableNames.clubs} SET member_count = MAX(member_count - 1, 0) WHERE id = ?`,
          )
          .run(clubId);
      }
    });

    transaction();
  }

  async getSaves(userId: string) {
    return sqlite
      .prepare(
        `SELECT id, user_id as userId, event_id as eventId, saved_at as savedAt FROM ${tableNames.eventSaves} WHERE user_id = ?`,
      )
      .all(userId)
      .map(normalizeSave);
  }

  async saveEvent(userId: string, eventId: string) {
    const existing = sqlite
      .prepare(
        `SELECT id, user_id as userId, event_id as eventId, saved_at as savedAt FROM ${tableNames.eventSaves} WHERE user_id = ? AND event_id = ?`,
      )
      .get(userId, eventId);
    if (existing) {
      return normalizeSave(existing);
    }

    const id = randomUUID();
    const savedAt = new Date().toISOString();
    sqlite
      .prepare(
        `INSERT INTO ${tableNames.eventSaves} (id, user_id, event_id, saved_at) VALUES (?, ?, ?, ?)`,
      )
      .run(id, userId, eventId, savedAt);
    return normalizeSave({ id, userId, eventId, savedAt });
  }

  async unsaveEvent(userId: string, eventId: string) {
    sqlite
      .prepare(
        `DELETE FROM ${tableNames.eventSaves} WHERE user_id = ? AND event_id = ?`,
      )
      .run(userId, eventId);
  }

  async getReservations(userId: string) {
    return sqlite
      .prepare(
        `SELECT id, user_id as userId, event_id as eventId, reserved_at as reservedAt, status FROM ${tableNames.reservations} WHERE user_id = ? AND status = 'confirmed'`,
      )
      .all(userId)
      .map(normalizeReservation);
  }

  async makeReservation(userId: string, eventId: string) {
    const transaction = sqlite.transaction(() => {
      const event = sqlite
        .prepare(
          `SELECT id, has_limited_capacity as hasLimitedCapacity, max_capacity as maxCapacity, current_reservations as currentReservations FROM ${tableNames.events} WHERE id = ?`,
        )
        .get(eventId) as
        | { id: string; hasLimitedCapacity: number; maxCapacity: number | null; currentReservations: number }
        | undefined;

      if (!event) return null;
      if (
        toBoolean(event.hasLimitedCapacity) &&
        event.maxCapacity !== null &&
        event.currentReservations >= event.maxCapacity
      ) {
        return null;
      }

      const existing = sqlite
        .prepare(
          `SELECT id, user_id as userId, event_id as eventId, reserved_at as reservedAt, status FROM ${tableNames.reservations} WHERE user_id = ? AND event_id = ? AND status = 'confirmed'`,
        )
        .get(userId, eventId);
      if (existing) {
        return normalizeReservation(existing);
      }

      const id = randomUUID();
      const reservedAt = new Date().toISOString();
      sqlite
        .prepare(
          `INSERT INTO ${tableNames.reservations} (id, user_id, event_id, reserved_at, status) VALUES (?, ?, ?, ?, ?)`,
        )
        .run(id, userId, eventId, reservedAt, "confirmed");
      sqlite
        .prepare(
          `UPDATE ${tableNames.events} SET current_reservations = current_reservations + 1 WHERE id = ?`,
        )
        .run(eventId);

      return normalizeReservation({ id, userId, eventId, reservedAt, status: "confirmed" });
    });

    return transaction();
  }

  async cancelReservation(userId: string, eventId: string) {
    const transaction = sqlite.transaction(() => {
      const result = sqlite
        .prepare(
          `UPDATE ${tableNames.reservations} SET status = 'cancelled' WHERE user_id = ? AND event_id = ? AND status = 'confirmed'`,
        )
        .run(userId, eventId);

      if (result.changes > 0) {
        sqlite
          .prepare(
            `UPDATE ${tableNames.events} SET current_reservations = MAX(current_reservations - 1, 0) WHERE id = ?`,
          )
          .run(eventId);
      }
    });

    transaction();
  }

  async getAnnouncements(clubId?: string) {
    const rows = clubId
      ? sqlite
          .prepare(
            `SELECT id, club_id as clubId, title, body, created_at as createdAt FROM ${tableNames.announcements} WHERE club_id = ? ORDER BY created_at DESC`,
          )
          .all(clubId)
      : sqlite
          .prepare(
            `SELECT id, club_id as clubId, title, body, created_at as createdAt FROM ${tableNames.announcements} ORDER BY created_at DESC`,
          )
          .all();
    return rows.map(normalizeAnnouncement);
  }

  async createAnnouncement(announcement: InsertAnnouncement) {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    sqlite
      .prepare(
        `INSERT INTO ${tableNames.announcements} (id, club_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)`,
      )
      .run(id, announcement.clubId, announcement.title, announcement.body, createdAt);
    return normalizeAnnouncement({ id, ...announcement, createdAt });
  }

  async getNotifications(userId: string) {
    return sqlite
      .prepare(
        `SELECT id, user_id as userId, type, title, body, read, created_at as createdAt, related_id as relatedId FROM ${tableNames.notifications} WHERE user_id = ? ORDER BY created_at DESC`,
      )
      .all(userId)
      .map(normalizeNotification);
  }

  async markNotificationRead(id: string) {
    sqlite
      .prepare(`UPDATE ${tableNames.notifications} SET read = 1 WHERE id = ?`)
      .run(id);
  }
}
