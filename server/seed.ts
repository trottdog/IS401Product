import { pool, db } from "./db";
import {
  users, buildings, categories, clubs, events,
  clubMemberships, announcements,
} from "@shared/schema";
import { BUILDINGS, CATEGORIES, CLUBS, DEFAULT_MEMBERSHIPS, DEFAULT_ANNOUNCEMENTS, DEFAULT_USER } from "../lib/data/seed-data";
import { sql } from "drizzle-orm";

async function seed() {
  if (!db || !pool) {
    throw new Error("server/seed.ts only supports the Postgres backend. Use SQLite startup auto-init for local SQLite.");
  }
  console.log("Seeding database...");

  const existingBuildings = await db.select().from(buildings);
  if (existingBuildings.length > 0) {
    console.log("Database already seeded, skipping.");
    await pool.end();
    return;
  }

  await db.insert(users).values({
    id: DEFAULT_USER.id,
    email: DEFAULT_USER.email,
    name: DEFAULT_USER.name,
    password: DEFAULT_USER.password,
  });
  console.log("  Created default user");

  await db.insert(buildings).values(
    BUILDINGS.map(b => ({
      id: b.id,
      name: b.name,
      abbreviation: b.abbreviation,
      latitude: b.latitude,
      longitude: b.longitude,
      address: b.address,
    }))
  );
  console.log(`  Inserted ${BUILDINGS.length} buildings`);

  await db.insert(categories).values(
    CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
    }))
  );
  console.log(`  Inserted ${CATEGORIES.length} categories`);

  await db.insert(clubs).values(
    CLUBS.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      categoryId: c.categoryId,
      memberCount: c.memberCount,
      imageColor: c.imageColor,
      contactEmail: c.contactEmail,
      website: c.website,
      instagram: c.instagram,
    }))
  );
  console.log(`  Inserted ${CLUBS.length} clubs`);

  const now = new Date();
  const { EVENTS } = await import("../lib/data/seed-data");
  const eventValues = EVENTS.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description,
    clubId: e.clubId,
    buildingId: e.buildingId,
    categoryId: e.categoryId,
    startTime: new Date(e.startTime),
    endTime: new Date(e.endTime),
    room: e.room,
    hasLimitedCapacity: e.hasLimitedCapacity,
    maxCapacity: e.maxCapacity,
    currentReservations: e.currentReservations,
    hasFood: e.hasFood,
    foodDescription: e.foodDescription,
    tags: e.tags,
    isCancelled: e.isCancelled,
  }));

  for (let i = 0; i < eventValues.length; i += 10) {
    const batch = eventValues.slice(i, i + 10);
    await db.insert(events).values(batch);
  }
  console.log(`  Inserted ${eventValues.length} events`);

  await db.insert(clubMemberships).values(
    DEFAULT_MEMBERSHIPS.map(m => ({
      id: m.id,
      userId: m.userId,
      clubId: m.clubId,
      role: m.role,
      joinedAt: new Date(m.joinedAt),
    }))
  );
  console.log(`  Inserted ${DEFAULT_MEMBERSHIPS.length} memberships`);

  await db.insert(announcements).values(
    DEFAULT_ANNOUNCEMENTS.map(a => ({
      id: a.id,
      clubId: a.clubId,
      title: a.title,
      body: a.body,
      createdAt: new Date(a.createdAt),
    }))
  );
  console.log(`  Inserted ${DEFAULT_ANNOUNCEMENTS.length} announcements`);

  console.log("Seeding complete!");
  await pool.end();
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
