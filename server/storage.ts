import { initializeSqliteDatabase, SqliteStorage } from "./sqlite";
import {
  type User, type InsertUser, type Building, type Category,
  type Club, type InsertClub, type Event, type InsertEvent,
  type ClubMembership, type EventSave, type Reservation,
  type Announcement, type InsertAnnouncement, type Notification,
} from "@shared/schema";

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

initializeSqliteDatabase();

export const storage: IStorage = new SqliteStorage() as IStorage;
