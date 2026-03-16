var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// server/routes.ts
import { createServer } from "node:http";
import * as path2 from "path";
import * as fs2 from "fs";

// server/storage.ts
import { eq, and, desc } from "drizzle-orm";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  announcements: () => announcements,
  buildings: () => buildings,
  categories: () => categories,
  clubMemberships: () => clubMemberships,
  clubs: () => clubs,
  eventSaves: () => eventSaves,
  events: () => events,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertClubSchema: () => insertClubSchema,
  insertEventSchema: () => insertEventSchema,
  insertUserSchema: () => insertUserSchema,
  notifications: () => notifications,
  reservations: () => reservations,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var buildings = pgTable("buildings", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address").notNull()
});
var categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull()
});
var clubs = pgTable("clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  imageColor: text("image_color").notNull(),
  contactEmail: text("contact_email").notNull().default(""),
  website: text("website").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  profileImage: text("profile_image"),
  coverImage: text("cover_image")
});
var events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  clubId: varchar("club_id").notNull(),
  buildingId: varchar("building_id").notNull(),
  categoryId: varchar("category_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  room: text("room").notNull(),
  hasLimitedCapacity: boolean("has_limited_capacity").notNull().default(false),
  maxCapacity: integer("max_capacity"),
  currentReservations: integer("current_reservations").notNull().default(0),
  hasFood: boolean("has_food").notNull().default(false),
  foodDescription: text("food_description"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  isCancelled: boolean("is_cancelled").notNull().default(false),
  coverImage: text("cover_image")
});
var clubMemberships = pgTable("club_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  clubId: varchar("club_id").notNull(),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});
var eventSaves = pgTable("event_saves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  eventId: varchar("event_id").notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull()
});
var reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  eventId: varchar("event_id").notNull(),
  reservedAt: timestamp("reserved_at").defaultNow().notNull(),
  status: text("status").notNull().default("confirmed")
});
var announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  relatedId: varchar("related_id")
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  password: true
});
var insertClubSchema = createInsertSchema(clubs).omit({
  id: true,
  memberCount: true,
  profileImage: true,
  coverImage: true
});
var insertEventSchema = createInsertSchema(events).omit({
  id: true,
  currentReservations: true,
  isCancelled: true,
  coverImage: true
});
var insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true
});

// server/db.ts
var dbProvider = process.env.DB_PROVIDER || (process.env.DATABASE_URL ? "postgres" : "sqlite");
var isPostgres = dbProvider === "postgres";
var pool = isPostgres ? new pg.Pool({
  connectionString: process.env.DATABASE_URL
}) : null;
var db = pool ? drizzle(pool, { schema: schema_exports }) : null;

// server/storage.ts
import { sql as sql2 } from "drizzle-orm";

// server/sqlite.ts
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { getTableName } from "drizzle-orm";

// lib/data/seed-data.ts
var BUILDINGS = [
  { id: "b1", name: "Talmage Building", abbreviation: "TMCB", latitude: 40.2497, longitude: -111.6494, address: "756 E University Pkwy" },
  { id: "b2", name: "Wilkinson Student Center", abbreviation: "WSC", latitude: 40.2519, longitude: -111.6493, address: "1060 N 1200 E" },
  { id: "b3", name: "Harold B. Lee Library", abbreviation: "HBLL", latitude: 40.2488, longitude: -111.6494, address: "2060 Harold B. Lee Library" },
  { id: "b4", name: "Smith Fieldhouse", abbreviation: "SFH", latitude: 40.2531, longitude: -111.6458, address: "269 Student Athlete Building" },
  { id: "b5", name: "Benson Building", abbreviation: "BNSN", latitude: 40.2505, longitude: -111.6512, address: "754 E University Pkwy" },
  { id: "b6", name: "Joseph Smith Building", abbreviation: "JSB", latitude: 40.2502, longitude: -111.6475, address: "270 JSB" },
  { id: "b7", name: "Marriott Center", abbreviation: "MC", latitude: 40.2533, longitude: -111.6483, address: "Marriott Center" },
  { id: "b8", name: "Harris Fine Arts Center", abbreviation: "HFAC", latitude: 40.2504, longitude: -111.6525, address: "Harris Fine Arts Center" },
  { id: "b9", name: "Engineering Building", abbreviation: "EB", latitude: 40.2475, longitude: -111.6469, address: "450 Engineering Building" },
  { id: "b10", name: "Crabtree Technology Building", abbreviation: "CTB", latitude: 40.247, longitude: -111.6485, address: "Crabtree Technology Building" }
];
var CATEGORIES = [
  { id: "c1", name: "Academic", icon: "school" },
  { id: "c2", name: "Social", icon: "people" },
  { id: "c3", name: "Sports", icon: "fitness-center" },
  { id: "c4", name: "Arts", icon: "palette" },
  { id: "c5", name: "Service", icon: "volunteer-activism" },
  { id: "c6", name: "Career", icon: "work" },
  { id: "c7", name: "Tech", icon: "computer" },
  { id: "c8", name: "Music", icon: "music-note" },
  { id: "c9", name: "Outdoors", icon: "terrain" },
  { id: "c10", name: "Cultural", icon: "public" }
];
var CLUBS = [
  { id: "cl1", name: "BYU Developers", description: "A community for software developers and aspiring engineers. We host workshops, hackathons, and tech talks from industry professionals.", categoryId: "c7", memberCount: 245, imageColor: "#0062B8", contactEmail: "devs@byu.edu", website: "byudevs.com", instagram: "@byudevs" },
  { id: "cl2", name: "Cougar Outdoors", description: "Explore Utah's incredible wilderness with fellow Cougars. Weekly hikes, camping trips, and outdoor skills workshops.", categoryId: "c9", memberCount: 389, imageColor: "#10B981", contactEmail: "outdoors@byu.edu", website: "cougaroutdoors.byu.edu", instagram: "@cougaroutdoors" },
  { id: "cl3", name: "BYU Dance Company", description: "BYU's premier student dance organization. We perform multiple styles including contemporary, jazz, hip-hop, and ballroom.", categoryId: "c4", memberCount: 67, imageColor: "#EC4899", contactEmail: "dance@byu.edu", website: "byudance.com", instagram: "@byudance" },
  { id: "cl4", name: "Entrepreneurship Club", description: "Connect with fellow aspiring entrepreneurs. Pitch nights, mentor sessions, and startup resources for BYU innovators.", categoryId: "c6", memberCount: 178, imageColor: "#F59E0B", contactEmail: "eclub@byu.edu", website: "byuentrepreneurs.com", instagram: "@byueclub" },
  { id: "cl5", name: "Cougar Soccer Club", description: "Recreational and competitive soccer for all skill levels. Weekly pickup games, tournaments, and intramural teams.", categoryId: "c3", memberCount: 156, imageColor: "#EF4444", contactEmail: "soccer@byu.edu", website: "", instagram: "@byusoccer" },
  { id: "cl6", name: "International Students Association", description: "Celebrating diversity at BYU through cultural events, language exchanges, and community support for international students.", categoryId: "c10", memberCount: 312, imageColor: "#8B5CF6", contactEmail: "isa@byu.edu", website: "byuisa.org", instagram: "@byuisa" },
  { id: "cl7", name: "BYU Volunteer Corps", description: "Make a difference in the Provo community through organized service projects, food drives, and mentoring programs.", categoryId: "c5", memberCount: 523, imageColor: "#14B8A6", contactEmail: "volunteer@byu.edu", website: "byuvolunteer.org", instagram: "@byuvolunteer" },
  { id: "cl8", name: "Pre-Med Society", description: "Support and resources for pre-medical students. MCAT prep, shadowing opportunities, and medical school application workshops.", categoryId: "c1", memberCount: 201, imageColor: "#0EA5E9", contactEmail: "premed@byu.edu", website: "byupremed.org", instagram: "@byupremed" },
  { id: "cl9", name: "BYU Photography Club", description: "Develop your photography skills with workshops, photo walks, and exhibitions. All experience levels welcome.", categoryId: "c4", memberCount: 134, imageColor: "#6366F1", contactEmail: "photo@byu.edu", website: "", instagram: "@byuphoto" },
  { id: "cl10", name: "Cougar Board Games", description: "Weekly board game nights and tournaments. From classics to modern strategy games, come play with fellow Cougars.", categoryId: "c2", memberCount: 98, imageColor: "#D97706", contactEmail: "games@byu.edu", website: "", instagram: "@byugames" },
  { id: "cl11", name: "BYU A Cappella", description: "BYU's student a cappella groups performing pop, jazz, and show tunes. Open auditions each semester.", categoryId: "c8", memberCount: 45, imageColor: "#E11D48", contactEmail: "acappella@byu.edu", website: "byuacappella.com", instagram: "@byuacappella" },
  { id: "cl12", name: "Data Science Club", description: "Explore data science, machine learning, and AI. Kaggle competitions, industry speakers, and hands-on workshops.", categoryId: "c7", memberCount: 167, imageColor: "#7C3AED", contactEmail: "datasci@byu.edu", website: "byudatasci.com", instagram: "@byudatasci" }
];
function generateEvents() {
  const now = /* @__PURE__ */ new Date();
  const events2 = [];
  const eventDefs = [
    { title: "Intro to React Workshop", description: "Learn the fundamentals of React.js with hands-on exercises. Bring your laptop!", clubId: "cl1", buildingId: "b1", categoryId: "c7", room: "185", offsetHours: -0.5, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 40, hasFood: false, foodDescription: null, tags: ["workshop", "coding", "beginner"] },
    { title: "Sunset Hike at Y Mountain", description: "Join us for a scenic evening hike up Y Mountain. Meet at the trailhead. Bring water and a headlamp.", clubId: "cl2", buildingId: "b4", categoryId: "c9", room: "Lobby", offsetHours: 3, durationHours: 3, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["hiking", "outdoors", "sunset"] },
    { title: "Spring Dance Showcase", description: "Come watch our talented dancers perform contemporary and jazz pieces. Free admission.", clubId: "cl3", buildingId: "b8", categoryId: "c4", room: "Main Stage", offsetHours: 6, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 200, hasFood: false, foodDescription: null, tags: ["dance", "performance", "free"] },
    { title: "Startup Pitch Night", description: "Watch student entrepreneurs pitch their ideas to local investors and mentors.", clubId: "cl4", buildingId: "b2", categoryId: "c6", room: "Varsity Theater", offsetHours: 8, durationHours: 2.5, hasLimitedCapacity: true, maxCapacity: 100, hasFood: true, foodDescription: "Pizza and drinks provided", tags: ["entrepreneurship", "networking", "pitch"] },
    { title: "Pick-up Soccer", description: "Weekly pickup soccer game. All skill levels welcome. Just show up and play!", clubId: "cl5", buildingId: "b4", categoryId: "c3", room: "Fields", offsetHours: 24, durationHours: 2, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["soccer", "sports", "pickup"] },
    { title: "Cultural Night: Japan", description: "Experience Japanese culture through food, performances, and activities. Kimonos available for photos.", clubId: "cl6", buildingId: "b2", categoryId: "c10", room: "Ballroom", offsetHours: 28, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 300, hasFood: true, foodDescription: "Japanese cuisine provided", tags: ["culture", "japan", "food", "free"] },
    { title: "Food Bank Volunteer Day", description: "Help sort and distribute food at the Utah Food Bank. Transportation provided from campus.", clubId: "cl7", buildingId: "b2", categoryId: "c5", room: "North Entrance", offsetHours: 30, durationHours: 4, hasLimitedCapacity: true, maxCapacity: 25, hasFood: false, foodDescription: null, tags: ["service", "volunteer", "food bank"] },
    { title: "MCAT Study Group", description: "Weekly MCAT study session focusing on biological sciences. Bring your prep materials.", clubId: "cl8", buildingId: "b3", categoryId: "c1", room: "Study Room 204", offsetHours: 1.5, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 15, hasFood: false, foodDescription: null, tags: ["study", "mcat", "premed"] },
    { title: "Golden Hour Photo Walk", description: "Capture beautiful golden hour photos around campus. Meet at the library fountain.", clubId: "cl9", buildingId: "b3", categoryId: "c4", room: "Front Steps", offsetHours: 5, durationHours: 1.5, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["photography", "outdoors", "creative"] },
    { title: "Board Game Tournament", description: "Monthly Settlers of Catan tournament with prizes! Registration required.", clubId: "cl10", buildingId: "b2", categoryId: "c2", room: "Room 312", offsetHours: 26, durationHours: 4, hasLimitedCapacity: true, maxCapacity: 32, hasFood: true, foodDescription: "Snacks and drinks", tags: ["games", "tournament", "prizes"] },
    { title: "A Cappella Concert", description: "End of semester a cappella concert featuring all BYU student groups.", clubId: "cl11", buildingId: "b7", categoryId: "c8", room: "Main Floor", offsetHours: 48, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 500, hasFood: false, foodDescription: null, tags: ["music", "concert", "performance"] },
    { title: "Machine Learning Workshop", description: "Hands-on introduction to neural networks using PyTorch. Laptops required.", clubId: "cl12", buildingId: "b10", categoryId: "c7", room: "Lab 102", offsetHours: 4, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 30, hasFood: false, foodDescription: null, tags: ["AI", "workshop", "coding"] },
    { title: "Hackathon Kickoff", description: "24-hour hackathon building solutions for local nonprofits. Teams of 4.", clubId: "cl1", buildingId: "b1", categoryId: "c7", room: "Atrium", offsetHours: 50, durationHours: 24, hasLimitedCapacity: true, maxCapacity: 80, hasFood: true, foodDescription: "Meals provided throughout", tags: ["hackathon", "coding", "nonprofit"] },
    { title: "Rock Climbing Social", description: "Indoor rock climbing at the Quarry. Gear provided. Perfect for beginners!", clubId: "cl2", buildingId: "b4", categoryId: "c9", room: "Quarry", offsetHours: 52, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 20, hasFood: false, foodDescription: null, tags: ["climbing", "social", "beginner"] },
    { title: "Hip Hop Workshop", description: "Open hip hop dance workshop. No experience necessary. Come learn some moves!", clubId: "cl3", buildingId: "b8", categoryId: "c4", room: "Dance Studio 2", offsetHours: 10, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 25, hasFood: false, foodDescription: null, tags: ["dance", "hiphop", "workshop"] },
    { title: "Investor Panel", description: "Local VC investors share insights on the Utah startup ecosystem.", clubId: "cl4", buildingId: "b6", categoryId: "c6", room: "Auditorium", offsetHours: 72, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 150, hasFood: false, foodDescription: null, tags: ["investing", "startups", "panel"] },
    { title: "Soccer Tournament", description: "Spring intramural soccer tournament. Register your team of 7.", clubId: "cl5", buildingId: "b4", categoryId: "c3", room: "South Fields", offsetHours: 76, durationHours: 6, hasLimitedCapacity: true, maxCapacity: 56, hasFood: true, foodDescription: "Hot dogs and lemonade", tags: ["soccer", "tournament", "intramural"] },
    { title: "Language Exchange Cafe", description: "Practice a new language over coffee. Native speakers from 15+ countries.", clubId: "cl6", buildingId: "b2", categoryId: "c10", room: "Cougareat", offsetHours: 2, durationHours: 2, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["language", "culture", "social"] },
    { title: "Campus Cleanup", description: "Help beautify our campus! Gloves and bags provided. Community service hours awarded.", clubId: "cl7", buildingId: "b2", categoryId: "c5", room: "Main Entrance", offsetHours: 100, durationHours: 3, hasLimitedCapacity: false, maxCapacity: null, hasFood: true, foodDescription: "Free lunch after", tags: ["service", "campus", "cleanup"] },
    { title: "Anatomy Review Session", description: "Comprehensive anatomy review led by upperclassmen. Great for midterm prep.", clubId: "cl8", buildingId: "b5", categoryId: "c1", room: "Room 101", offsetHours: 25, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 50, hasFood: false, foodDescription: null, tags: ["study", "anatomy", "review"] },
    { title: "Portrait Photography Night", description: "Learn portrait photography techniques with studio lighting. Models provided.", clubId: "cl9", buildingId: "b8", categoryId: "c4", room: "Photo Lab", offsetHours: 54, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 12, hasFood: false, foodDescription: null, tags: ["photography", "portrait", "studio"] },
    { title: "D&D One-Shot", description: "Drop-in Dungeons & Dragons one-shot adventure. No experience needed!", clubId: "cl10", buildingId: "b2", categoryId: "c2", room: "Room 310", offsetHours: 74, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 8, hasFood: true, foodDescription: "Snacks provided", tags: ["games", "dnd", "rpg"] },
    { title: "Open Mic Night", description: "Share your talent! Singing, comedy, poetry, instruments - all welcome.", clubId: "cl11", buildingId: "b2", categoryId: "c8", room: "Skyroom", offsetHours: 9, durationHours: 2, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["music", "openmic", "talent"] },
    { title: "Data Viz Competition", description: "Create the most compelling visualization from a mystery dataset. Prizes awarded!", clubId: "cl12", buildingId: "b10", categoryId: "c7", room: "Lab 204", offsetHours: 96, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 40, hasFood: true, foodDescription: "Boba tea provided", tags: ["data", "competition", "prizes"] },
    { title: "Git & GitHub Workshop", description: "Master version control with Git. Perfect for CS students and anyone who codes.", clubId: "cl1", buildingId: "b1", categoryId: "c7", room: "210", offsetHours: 27, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 35, hasFood: false, foodDescription: null, tags: ["git", "workshop", "coding"] },
    { title: "Kayaking Trip", description: "Kayaking at Utah Lake! Equipment and transport provided. Must know how to swim.", clubId: "cl2", buildingId: "b4", categoryId: "c9", room: "Parking Lot", offsetHours: 120, durationHours: 5, hasLimitedCapacity: true, maxCapacity: 16, hasFood: true, foodDescription: "Packed lunches", tags: ["kayaking", "outdoors", "adventure"] },
    { title: "Ballet Master Class", description: "Guest instructor from Ballet West. Intermediate level and above.", clubId: "cl3", buildingId: "b8", categoryId: "c4", room: "Dance Studio 1", offsetHours: 55, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 20, hasFood: false, foodDescription: null, tags: ["ballet", "dance", "masterclass"] },
    { title: "Resume Workshop", description: "Get your resume reviewed by career counselors and industry professionals.", clubId: "cl4", buildingId: "b6", categoryId: "c6", room: "Room 232", offsetHours: 32, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 30, hasFood: false, foodDescription: null, tags: ["career", "resume", "professional"] },
    { title: "3v3 Basketball", description: "Drop-in 3v3 basketball games. Come solo or bring friends!", clubId: "cl5", buildingId: "b4", categoryId: "c3", room: "Courts", offsetHours: 7, durationHours: 2, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["basketball", "sports", "pickup"] },
    { title: "Diwali Celebration", description: "Celebrate the festival of lights with traditional food, dance, and rangoli.", clubId: "cl6", buildingId: "b2", categoryId: "c10", room: "Grand Ballroom", offsetHours: 144, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 250, hasFood: true, foodDescription: "Indian cuisine provided", tags: ["diwali", "culture", "food", "celebration"] },
    { title: "Homeless Shelter Visit", description: "Serve dinner at the Provo Community Shelter. Training provided.", clubId: "cl7", buildingId: "b2", categoryId: "c5", room: "South Entrance", offsetHours: 56, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 15, hasFood: false, foodDescription: null, tags: ["service", "volunteer", "shelter"] },
    { title: "Med School Q&A Panel", description: "Current med students answer your questions about applications and med school life.", clubId: "cl8", buildingId: "b5", categoryId: "c1", room: "Auditorium", offsetHours: 78, durationHours: 1.5, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["premed", "panel", "advice"] },
    { title: "Film Photography Darkroom", description: "Learn to develop film in the darkroom. Film cameras available to borrow.", clubId: "cl9", buildingId: "b8", categoryId: "c4", room: "Darkroom B", offsetHours: 102, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 8, hasFood: false, foodDescription: null, tags: ["photography", "film", "darkroom"] },
    { title: "Mario Kart Tournament", description: "Bring your Switch for our monthly Mario Kart tournament! Prizes for top 3.", clubId: "cl10", buildingId: "b2", categoryId: "c2", room: "Room 312", offsetHours: 11, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 16, hasFood: true, foodDescription: "Chips and salsa", tags: ["games", "nintendo", "tournament"] },
    { title: "Songwriting Workshop", description: "Learn the art of songwriting from a professional songwriter. All genres.", clubId: "cl11", buildingId: "b8", categoryId: "c8", room: "Room 150", offsetHours: 80, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 20, hasFood: false, foodDescription: null, tags: ["music", "songwriting", "creative"] },
    { title: "Kaggle Competition Night", description: "Work on the latest Kaggle competition together. All levels welcome.", clubId: "cl12", buildingId: "b10", categoryId: "c7", room: "Lab 102", offsetHours: 33, durationHours: 3, hasLimitedCapacity: false, maxCapacity: null, hasFood: true, foodDescription: "Pizza rolls", tags: ["AI", "kaggle", "competition"] },
    { title: "API Design Best Practices", description: "Senior engineer from a tech company shares RESTful API design principles.", clubId: "cl1", buildingId: "b9", categoryId: "c7", room: "377", offsetHours: 53, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 60, hasFood: false, foodDescription: null, tags: ["api", "backend", "talk"] },
    { title: "Trail Running Group", description: "5K trail run through Rock Canyon. Moderate difficulty. Bring trail shoes.", clubId: "cl2", buildingId: "b4", categoryId: "c9", room: "East Entrance", offsetHours: 29, durationHours: 1.5, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["running", "trails", "fitness"] },
    { title: "Networking Mixer", description: "Meet professionals from tech, finance, and consulting. Business casual.", clubId: "cl4", buildingId: "b6", categoryId: "c6", room: "Atrium", offsetHours: 57, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 80, hasFood: true, foodDescription: "Appetizers and drinks", tags: ["networking", "career", "professional"] },
    { title: "Ultimate Frisbee", description: "Weekly ultimate frisbee game. All skill levels. Just bring a good attitude!", clubId: "cl5", buildingId: "b4", categoryId: "c3", room: "North Fields", offsetHours: 34, durationHours: 1.5, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["frisbee", "sports", "pickup"] }
  ];
  eventDefs.forEach((def, i) => {
    const start = new Date(now.getTime() + def.offsetHours * 60 * 60 * 1e3);
    const end = new Date(start.getTime() + def.durationHours * 60 * 60 * 1e3);
    const reservations2 = def.hasLimitedCapacity && def.maxCapacity ? Math.floor(Math.random() * def.maxCapacity * 0.7) : 0;
    events2.push({
      id: `e${i + 1}`,
      title: def.title,
      description: def.description,
      clubId: def.clubId,
      buildingId: def.buildingId,
      categoryId: def.categoryId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      room: def.room,
      hasLimitedCapacity: def.hasLimitedCapacity,
      maxCapacity: def.maxCapacity,
      currentReservations: reservations2,
      hasFood: def.hasFood,
      foodDescription: def.foodDescription,
      tags: def.tags,
      isCancelled: false
    });
  });
  return events2;
}
var EVENTS = generateEvents();
var DEFAULT_MEMBERSHIPS = [
  { id: "m1", userId: "user1", clubId: "cl1", role: "admin", joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1e3).toISOString() },
  { id: "m2", userId: "user1", clubId: "cl2", role: "member", joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1e3).toISOString() },
  { id: "m3", userId: "user1", clubId: "cl12", role: "member", joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString() }
];
var DEFAULT_ANNOUNCEMENTS = [
  { id: "a1", clubId: "cl1", title: "Hackathon Registration Open", body: "Registration for our spring hackathon is now open! Sign up on our website before spots fill up.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString() },
  { id: "a2", clubId: "cl2", title: "New Gear Available", body: "We just got new camping gear available to borrow! Check the gear closet in the WSC.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString() },
  { id: "a3", clubId: "cl12", title: "Competition Results", body: "Congratulations to our Kaggle team for placing 12th out of 500 teams in the latest competition!", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString() },
  { id: "a4", clubId: "cl1", title: "Meeting Location Change", body: "This week's meeting will be in TMCB 185 instead of the usual room. See you there!", createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1e3).toISOString() }
];
var DEFAULT_USER = {
  id: "user1",
  email: "student@byu.edu",
  name: "Alex Johnson",
  password: "password123",
  createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1e3).toISOString()
};

// server/sqlite.ts
var sqlitePath = process.env.SQLITE_DB_PATH || path.resolve(process.cwd(), ".local", "byuconnect.sqlite");
fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
var sqlite = new Database(sqlitePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
var tableNames = {
  users: getTableName(users),
  buildings: getTableName(buildings),
  categories: getTableName(categories),
  clubs: getTableName(clubs),
  events: getTableName(events),
  clubMemberships: getTableName(clubMemberships),
  eventSaves: getTableName(eventSaves),
  reservations: getTableName(reservations),
  announcements: getTableName(announcements),
  notifications: getTableName(notifications)
};
function toDate(value) {
  if (!value) return void 0;
  return new Date(value);
}
function toBoolean(value) {
  return Boolean(value);
}
function parseTags(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function normalizeUser(row) {
  return {
    ...row,
    profileImage: row.profileImage ?? void 0,
    createdAt: toDate(row.createdAt)
  };
}
function normalizeClub(row) {
  return {
    ...row,
    profileImage: row.profileImage ?? void 0,
    coverImage: row.coverImage ?? void 0
  };
}
function normalizeEvent(row) {
  return {
    ...row,
    startTime: toDate(row.startTime),
    endTime: toDate(row.endTime),
    hasLimitedCapacity: toBoolean(row.hasLimitedCapacity),
    hasFood: toBoolean(row.hasFood),
    isCancelled: toBoolean(row.isCancelled),
    tags: parseTags(row.tags),
    coverImage: row.coverImage ?? void 0
  };
}
function normalizeMembership(row) {
  return {
    ...row,
    joinedAt: toDate(row.joinedAt)
  };
}
function normalizeSave(row) {
  return {
    ...row,
    savedAt: toDate(row.savedAt)
  };
}
function normalizeReservation(row) {
  return {
    ...row,
    reservedAt: toDate(row.reservedAt)
  };
}
function normalizeAnnouncement(row) {
  return {
    ...row,
    createdAt: toDate(row.createdAt)
  };
}
function normalizeNotification(row) {
  return {
    ...row,
    read: toBoolean(row.read),
    createdAt: toDate(row.createdAt)
  };
}
function initializeSqliteDatabase() {
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
  `);
  const existingUsers = sqlite.prepare(`SELECT COUNT(*) as count FROM ${tableNames.users}`).get();
  if (existingUsers.count > 0) {
    return;
  }
  const seed = sqlite.transaction(() => {
    sqlite.prepare(
      `INSERT INTO ${tableNames.users} (id, email, name, password, created_at) VALUES (?, ?, ?, ?, ?)`
    ).run(
      DEFAULT_USER.id,
      DEFAULT_USER.email,
      DEFAULT_USER.name,
      DEFAULT_USER.password,
      DEFAULT_USER.createdAt
    );
    const buildingStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.buildings} (id, name, abbreviation, latitude, longitude, address) VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const building of BUILDINGS) {
      buildingStmt.run(
        building.id,
        building.name,
        building.abbreviation,
        building.latitude,
        building.longitude,
        building.address
      );
    }
    const categoryStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.categories} (id, name, icon) VALUES (?, ?, ?)`
    );
    for (const category of CATEGORIES) {
      categoryStmt.run(category.id, category.name, category.icon);
    }
    const clubStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.clubs} (id, name, description, category_id, member_count, image_color, contact_email, website, instagram, profile_image, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        club.coverImage ?? null
      );
    }
    const eventStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.events} (id, title, description, club_id, building_id, category_id, start_time, end_time, room, has_limited_capacity, max_capacity, current_reservations, has_food, food_description, tags, is_cancelled, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        event.coverImage ?? null
      );
    }
    const membershipStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.clubMemberships} (id, user_id, club_id, role, joined_at) VALUES (?, ?, ?, ?, ?)`
    );
    for (const membership of DEFAULT_MEMBERSHIPS) {
      membershipStmt.run(
        membership.id,
        membership.userId,
        membership.clubId,
        membership.role,
        membership.joinedAt
      );
    }
    const announcementStmt = sqlite.prepare(
      `INSERT INTO ${tableNames.announcements} (id, club_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)`
    );
    for (const announcement of DEFAULT_ANNOUNCEMENTS) {
      announcementStmt.run(
        announcement.id,
        announcement.clubId,
        announcement.title,
        announcement.body,
        announcement.createdAt
      );
    }
  });
  seed();
}
var SqliteStorage = class {
  async getUser(id) {
    const row = sqlite.prepare(
      `SELECT id, email, name, password, profile_image as profileImage, created_at as createdAt FROM ${tableNames.users} WHERE id = ?`
    ).get(id);
    return row ? normalizeUser(row) : void 0;
  }
  async getUserByEmail(email) {
    const row = sqlite.prepare(
      `SELECT id, email, name, password, profile_image as profileImage, created_at as createdAt FROM ${tableNames.users} WHERE email = ?`
    ).get(email);
    return row ? normalizeUser(row) : void 0;
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    sqlite.prepare(
      `INSERT INTO ${tableNames.users} (id, email, name, password, created_at) VALUES (?, ?, ?, ?, ?)`
    ).run(id, insertUser.email, insertUser.name, insertUser.password, createdAt);
    return normalizeUser({
      id,
      ...insertUser,
      createdAt,
      profileImage: null
    });
  }
  async updateUserProfileImage(id, imageUrl) {
    sqlite.prepare(`UPDATE ${tableNames.users} SET profile_image = ? WHERE id = ?`).run(imageUrl, id);
  }
  async getBuildings() {
    return sqlite.prepare(
      `SELECT id, name, abbreviation, latitude, longitude, address FROM ${tableNames.buildings}`
    ).all();
  }
  async getCategories() {
    return sqlite.prepare(`SELECT id, name, icon FROM ${tableNames.categories}`).all();
  }
  async getClubs() {
    return sqlite.prepare(
      `SELECT id, name, description, category_id as categoryId, member_count as memberCount, image_color as imageColor, contact_email as contactEmail, website, instagram, profile_image as profileImage, cover_image as coverImage FROM ${tableNames.clubs}`
    ).all().map(normalizeClub);
  }
  async getClub(id) {
    const row = sqlite.prepare(
      `SELECT id, name, description, category_id as categoryId, member_count as memberCount, image_color as imageColor, contact_email as contactEmail, website, instagram, profile_image as profileImage, cover_image as coverImage FROM ${tableNames.clubs} WHERE id = ?`
    ).get(id);
    return row ? normalizeClub(row) : void 0;
  }
  async createClub(insertClub) {
    const id = randomUUID();
    sqlite.prepare(
      `INSERT INTO ${tableNames.clubs} (id, name, description, category_id, member_count, image_color, contact_email, website, instagram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      insertClub.name,
      insertClub.description,
      insertClub.categoryId,
      0,
      insertClub.imageColor,
      insertClub.contactEmail,
      insertClub.website,
      insertClub.instagram
    );
    return normalizeClub({
      id,
      ...insertClub,
      memberCount: 0,
      profileImage: null,
      coverImage: null
    });
  }
  async updateClubProfileImage(id, imageUrl) {
    sqlite.prepare(`UPDATE ${tableNames.clubs} SET profile_image = ? WHERE id = ?`).run(imageUrl, id);
  }
  async updateClubCoverImage(id, imageUrl) {
    sqlite.prepare(`UPDATE ${tableNames.clubs} SET cover_image = ? WHERE id = ?`).run(imageUrl, id);
  }
  async getEvents() {
    return sqlite.prepare(
      `SELECT id, title, description, club_id as clubId, building_id as buildingId, category_id as categoryId, start_time as startTime, end_time as endTime, room, has_limited_capacity as hasLimitedCapacity, max_capacity as maxCapacity, current_reservations as currentReservations, has_food as hasFood, food_description as foodDescription, tags, is_cancelled as isCancelled, cover_image as coverImage FROM ${tableNames.events}`
    ).all().map(normalizeEvent);
  }
  async getEvent(id) {
    const row = sqlite.prepare(
      `SELECT id, title, description, club_id as clubId, building_id as buildingId, category_id as categoryId, start_time as startTime, end_time as endTime, room, has_limited_capacity as hasLimitedCapacity, max_capacity as maxCapacity, current_reservations as currentReservations, has_food as hasFood, food_description as foodDescription, tags, is_cancelled as isCancelled, cover_image as coverImage FROM ${tableNames.events} WHERE id = ?`
    ).get(id);
    return row ? normalizeEvent(row) : void 0;
  }
  async createEvent(insertEvent) {
    const id = randomUUID();
    sqlite.prepare(
      `INSERT INTO ${tableNames.events} (id, title, description, club_id, building_id, category_id, start_time, end_time, room, has_limited_capacity, max_capacity, current_reservations, has_food, food_description, tags, is_cancelled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
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
      0
    );
    return normalizeEvent({
      id,
      ...insertEvent,
      startTime: insertEvent.startTime.toISOString(),
      endTime: insertEvent.endTime.toISOString(),
      currentReservations: 0,
      isCancelled: 0,
      coverImage: null,
      tags: JSON.stringify(insertEvent.tags)
    });
  }
  async updateEventCoverImage(id, imageUrl) {
    sqlite.prepare(`UPDATE ${tableNames.events} SET cover_image = ? WHERE id = ?`).run(imageUrl, id);
  }
  async getMemberships(userId) {
    return sqlite.prepare(
      `SELECT id, user_id as userId, club_id as clubId, role, joined_at as joinedAt FROM ${tableNames.clubMemberships} WHERE user_id = ?`
    ).all(userId).map(normalizeMembership);
  }
  async joinClub(userId, clubId) {
    const transaction = sqlite.transaction(() => {
      const existing = sqlite.prepare(
        `SELECT id, user_id as userId, club_id as clubId, role, joined_at as joinedAt FROM ${tableNames.clubMemberships} WHERE user_id = ? AND club_id = ?`
      ).get(userId, clubId);
      if (existing) {
        return normalizeMembership(existing);
      }
      const id = randomUUID();
      const joinedAt = (/* @__PURE__ */ new Date()).toISOString();
      sqlite.prepare(
        `INSERT INTO ${tableNames.clubMemberships} (id, user_id, club_id, role, joined_at) VALUES (?, ?, ?, ?, ?)`
      ).run(id, userId, clubId, "member", joinedAt);
      sqlite.prepare(
        `UPDATE ${tableNames.clubs} SET member_count = member_count + 1 WHERE id = ?`
      ).run(clubId);
      return normalizeMembership({ id, userId, clubId, role: "member", joinedAt });
    });
    return transaction();
  }
  async leaveClub(userId, clubId) {
    const transaction = sqlite.transaction(() => {
      const result = sqlite.prepare(
        `DELETE FROM ${tableNames.clubMemberships} WHERE user_id = ? AND club_id = ?`
      ).run(userId, clubId);
      if (result.changes > 0) {
        sqlite.prepare(
          `UPDATE ${tableNames.clubs} SET member_count = MAX(member_count - 1, 0) WHERE id = ?`
        ).run(clubId);
      }
    });
    transaction();
  }
  async getSaves(userId) {
    return sqlite.prepare(
      `SELECT id, user_id as userId, event_id as eventId, saved_at as savedAt FROM ${tableNames.eventSaves} WHERE user_id = ?`
    ).all(userId).map(normalizeSave);
  }
  async saveEvent(userId, eventId) {
    const existing = sqlite.prepare(
      `SELECT id, user_id as userId, event_id as eventId, saved_at as savedAt FROM ${tableNames.eventSaves} WHERE user_id = ? AND event_id = ?`
    ).get(userId, eventId);
    if (existing) {
      return normalizeSave(existing);
    }
    const id = randomUUID();
    const savedAt = (/* @__PURE__ */ new Date()).toISOString();
    sqlite.prepare(
      `INSERT INTO ${tableNames.eventSaves} (id, user_id, event_id, saved_at) VALUES (?, ?, ?, ?)`
    ).run(id, userId, eventId, savedAt);
    return normalizeSave({ id, userId, eventId, savedAt });
  }
  async unsaveEvent(userId, eventId) {
    sqlite.prepare(
      `DELETE FROM ${tableNames.eventSaves} WHERE user_id = ? AND event_id = ?`
    ).run(userId, eventId);
  }
  async getReservations(userId) {
    return sqlite.prepare(
      `SELECT id, user_id as userId, event_id as eventId, reserved_at as reservedAt, status FROM ${tableNames.reservations} WHERE user_id = ? AND status = 'confirmed'`
    ).all(userId).map(normalizeReservation);
  }
  async makeReservation(userId, eventId) {
    const transaction = sqlite.transaction(() => {
      const event = sqlite.prepare(
        `SELECT id, has_limited_capacity as hasLimitedCapacity, max_capacity as maxCapacity, current_reservations as currentReservations FROM ${tableNames.events} WHERE id = ?`
      ).get(eventId);
      if (!event) return null;
      if (toBoolean(event.hasLimitedCapacity) && event.maxCapacity !== null && event.currentReservations >= event.maxCapacity) {
        return null;
      }
      const existing = sqlite.prepare(
        `SELECT id, user_id as userId, event_id as eventId, reserved_at as reservedAt, status FROM ${tableNames.reservations} WHERE user_id = ? AND event_id = ? AND status = 'confirmed'`
      ).get(userId, eventId);
      if (existing) {
        return normalizeReservation(existing);
      }
      const id = randomUUID();
      const reservedAt = (/* @__PURE__ */ new Date()).toISOString();
      sqlite.prepare(
        `INSERT INTO ${tableNames.reservations} (id, user_id, event_id, reserved_at, status) VALUES (?, ?, ?, ?, ?)`
      ).run(id, userId, eventId, reservedAt, "confirmed");
      sqlite.prepare(
        `UPDATE ${tableNames.events} SET current_reservations = current_reservations + 1 WHERE id = ?`
      ).run(eventId);
      return normalizeReservation({ id, userId, eventId, reservedAt, status: "confirmed" });
    });
    return transaction();
  }
  async cancelReservation(userId, eventId) {
    const transaction = sqlite.transaction(() => {
      const result = sqlite.prepare(
        `UPDATE ${tableNames.reservations} SET status = 'cancelled' WHERE user_id = ? AND event_id = ? AND status = 'confirmed'`
      ).run(userId, eventId);
      if (result.changes > 0) {
        sqlite.prepare(
          `UPDATE ${tableNames.events} SET current_reservations = MAX(current_reservations - 1, 0) WHERE id = ?`
        ).run(eventId);
      }
    });
    transaction();
  }
  async getAnnouncements(clubId) {
    const rows = clubId ? sqlite.prepare(
      `SELECT id, club_id as clubId, title, body, created_at as createdAt FROM ${tableNames.announcements} WHERE club_id = ? ORDER BY created_at DESC`
    ).all(clubId) : sqlite.prepare(
      `SELECT id, club_id as clubId, title, body, created_at as createdAt FROM ${tableNames.announcements} ORDER BY created_at DESC`
    ).all();
    return rows.map(normalizeAnnouncement);
  }
  async createAnnouncement(announcement) {
    const id = randomUUID();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    sqlite.prepare(
      `INSERT INTO ${tableNames.announcements} (id, club_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)`
    ).run(id, announcement.clubId, announcement.title, announcement.body, createdAt);
    return normalizeAnnouncement({ id, ...announcement, createdAt });
  }
  async getNotifications(userId) {
    return sqlite.prepare(
      `SELECT id, user_id as userId, type, title, body, read, created_at as createdAt, related_id as relatedId FROM ${tableNames.notifications} WHERE user_id = ? ORDER BY created_at DESC`
    ).all(userId).map(normalizeNotification);
  }
  async markNotificationRead(id) {
    sqlite.prepare(`UPDATE ${tableNames.notifications} SET read = 1 WHERE id = ?`).run(id);
  }
};

// server/storage.ts
var db2 = db;
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db2.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db2.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db2.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUserProfileImage(id, imageUrl) {
    await db2.update(users).set({ profileImage: imageUrl }).where(eq(users.id, id));
  }
  async getBuildings() {
    return db2.select().from(buildings);
  }
  async getCategories() {
    return db2.select().from(categories);
  }
  async getClubs() {
    return db2.select().from(clubs);
  }
  async getClub(id) {
    const [club] = await db2.select().from(clubs).where(eq(clubs.id, id));
    return club;
  }
  async createClub(insertClub) {
    const [club] = await db2.insert(clubs).values(insertClub).returning();
    return club;
  }
  async updateClubProfileImage(id, imageUrl) {
    await db2.update(clubs).set({ profileImage: imageUrl }).where(eq(clubs.id, id));
  }
  async updateClubCoverImage(id, imageUrl) {
    await db2.update(clubs).set({ coverImage: imageUrl }).where(eq(clubs.id, id));
  }
  async getEvents() {
    return db2.select().from(events);
  }
  async getEvent(id) {
    const [event] = await db2.select().from(events).where(eq(events.id, id));
    return event;
  }
  async createEvent(insertEvent) {
    const [event] = await db2.insert(events).values(insertEvent).returning();
    return event;
  }
  async updateEventCoverImage(id, imageUrl) {
    await db2.update(events).set({ coverImage: imageUrl }).where(eq(events.id, id));
  }
  async getMemberships(userId) {
    return db2.select().from(clubMemberships).where(eq(clubMemberships.userId, userId));
  }
  async joinClub(userId, clubId) {
    const existing = await db2.select().from(clubMemberships).where(and(eq(clubMemberships.userId, userId), eq(clubMemberships.clubId, clubId)));
    if (existing.length > 0) return existing[0];
    const [membership] = await db2.insert(clubMemberships).values({ userId, clubId, role: "member" }).returning();
    await db2.update(clubs).set({ memberCount: sql2`${clubs.memberCount} + 1` }).where(eq(clubs.id, clubId));
    return membership;
  }
  async leaveClub(userId, clubId) {
    const deleted = await db2.delete(clubMemberships).where(and(eq(clubMemberships.userId, userId), eq(clubMemberships.clubId, clubId))).returning();
    if (deleted.length > 0) {
      await db2.update(clubs).set({ memberCount: sql2`GREATEST(${clubs.memberCount} - 1, 0)` }).where(eq(clubs.id, clubId));
    }
  }
  async getSaves(userId) {
    return db2.select().from(eventSaves).where(eq(eventSaves.userId, userId));
  }
  async saveEvent(userId, eventId) {
    const existing = await db2.select().from(eventSaves).where(and(eq(eventSaves.userId, userId), eq(eventSaves.eventId, eventId)));
    if (existing.length > 0) return existing[0];
    const [save] = await db2.insert(eventSaves).values({ userId, eventId }).returning();
    return save;
  }
  async unsaveEvent(userId, eventId) {
    await db2.delete(eventSaves).where(and(eq(eventSaves.userId, userId), eq(eventSaves.eventId, eventId)));
  }
  async getReservations(userId) {
    return db2.select().from(reservations).where(and(eq(reservations.userId, userId), eq(reservations.status, "confirmed")));
  }
  async makeReservation(userId, eventId) {
    const [event] = await db2.select().from(events).where(eq(events.id, eventId));
    if (!event) return null;
    if (event.hasLimitedCapacity && event.maxCapacity !== null && event.currentReservations >= event.maxCapacity) {
      return null;
    }
    const existing = await db2.select().from(reservations).where(and(
      eq(reservations.userId, userId),
      eq(reservations.eventId, eventId),
      eq(reservations.status, "confirmed")
    ));
    if (existing.length > 0) return existing[0];
    const [reservation] = await db2.insert(reservations).values({ userId, eventId, status: "confirmed" }).returning();
    await db2.update(events).set({ currentReservations: sql2`${events.currentReservations} + 1` }).where(eq(events.id, eventId));
    return reservation;
  }
  async cancelReservation(userId, eventId) {
    const deleted = await db2.update(reservations).set({ status: "cancelled" }).where(and(
      eq(reservations.userId, userId),
      eq(reservations.eventId, eventId),
      eq(reservations.status, "confirmed")
    )).returning();
    if (deleted.length > 0) {
      await db2.update(events).set({ currentReservations: sql2`GREATEST(${events.currentReservations} - 1, 0)` }).where(eq(events.id, eventId));
    }
  }
  async getAnnouncements(clubId) {
    if (clubId) {
      return db2.select().from(announcements).where(eq(announcements.clubId, clubId)).orderBy(desc(announcements.createdAt));
    }
    return db2.select().from(announcements).orderBy(desc(announcements.createdAt));
  }
  async createAnnouncement(announcement) {
    const [created] = await db2.insert(announcements).values(announcement).returning();
    return created;
  }
  async getNotifications(userId) {
    return db2.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }
  async markNotificationRead(id) {
    await db2.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }
};
if (dbProvider === "sqlite") {
  initializeSqliteDatabase();
}
var storage = dbProvider === "sqlite" ? new SqliteStorage() : new DatabaseStorage();

// server/routes.ts
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}
async function registerRoutes(app2) {
  app2.get("/api/map", (_req, res) => {
    const mapPath = path2.resolve(process.cwd(), "server", "templates", "map.html");
    const html = fs2.readFileSync(mapPath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const existing = await storage.getUserByEmail(parsed.data.email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const user = await storage.createUser(parsed.data);
      req.session.userId = user.id;
      const { password, ...safe } = user;
      return res.status(201).json(safe);
    } catch (err) {
      return res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      let user = await storage.getUserByEmail(email);
      if (!user) {
        if (name && typeof name === "string" && name.trim()) {
          const parsed = insertUserSchema.safeParse({
            email: email.trim(),
            name: name.trim(),
            password
          });
          if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
          }
          user = await storage.createUser(parsed.data);
        } else {
          return res.status(401).json({
            message: "Account not found. Sign up or enter your name to create a profile on first login."
          });
        }
      } else if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      const { password: _, ...safe } = user;
      return res.json(safe);
    } catch (err) {
      return res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password, ...safe } = user;
    return res.json(safe);
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });
  app2.get("/api/buildings", async (_req, res) => {
    const data = await storage.getBuildings();
    res.json(data);
  });
  app2.get("/api/categories", async (_req, res) => {
    const data = await storage.getCategories();
    res.json(data);
  });
  app2.get("/api/clubs", async (_req, res) => {
    const data = await storage.getClubs();
    res.json(data);
  });
  app2.get("/api/clubs/:id", async (req, res) => {
    const club = await storage.getClub(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });
    res.json(club);
  });
  app2.post("/api/clubs", requireAuth, async (req, res) => {
    try {
      const parsed = insertClubSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const club = await storage.createClub(parsed.data);
      return res.status(201).json(club);
    } catch (err) {
      return res.status(500).json({ message: "Failed to create club" });
    }
  });
  app2.patch("/api/clubs/:id/profile-image", requireAuth, async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl required" });
    await storage.updateClubProfileImage(req.params.id, imageUrl);
    res.json({ message: "Updated" });
  });
  app2.patch("/api/clubs/:id/cover-image", requireAuth, async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl required" });
    await storage.updateClubCoverImage(req.params.id, imageUrl);
    res.json({ message: "Updated" });
  });
  app2.get("/api/events", async (_req, res) => {
    const data = await storage.getEvents();
    res.json(data);
  });
  app2.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  });
  app2.post("/api/events", requireAuth, async (req, res) => {
    try {
      const body = {
        ...req.body,
        startTime: req.body.startTime ? new Date(req.body.startTime) : void 0,
        endTime: req.body.endTime ? new Date(req.body.endTime) : void 0
      };
      const parsed = insertEventSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const event = await storage.createEvent(parsed.data);
      return res.status(201).json(event);
    } catch (err) {
      return res.status(500).json({ message: "Failed to create event" });
    }
  });
  app2.patch("/api/events/:id/cover-image", requireAuth, async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl required" });
    await storage.updateEventCoverImage(req.params.id, imageUrl);
    res.json({ message: "Updated" });
  });
  app2.get("/api/memberships", requireAuth, async (req, res) => {
    const data = await storage.getMemberships(req.session.userId);
    res.json(data);
  });
  app2.post("/api/memberships", requireAuth, async (req, res) => {
    const { clubId } = req.body;
    if (!clubId) return res.status(400).json({ message: "clubId required" });
    const membership = await storage.joinClub(req.session.userId, clubId);
    res.status(201).json(membership);
  });
  app2.delete("/api/memberships/:clubId", requireAuth, async (req, res) => {
    await storage.leaveClub(req.session.userId, req.params.clubId);
    res.json({ message: "Left club" });
  });
  app2.get("/api/saves", requireAuth, async (req, res) => {
    const data = await storage.getSaves(req.session.userId);
    res.json(data);
  });
  app2.post("/api/saves", requireAuth, async (req, res) => {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: "eventId required" });
    const save = await storage.saveEvent(req.session.userId, eventId);
    res.status(201).json(save);
  });
  app2.delete("/api/saves/:eventId", requireAuth, async (req, res) => {
    await storage.unsaveEvent(req.session.userId, req.params.eventId);
    res.json({ message: "Unsaved" });
  });
  app2.get("/api/reservations", requireAuth, async (req, res) => {
    const data = await storage.getReservations(req.session.userId);
    res.json(data);
  });
  app2.post("/api/reservations", requireAuth, async (req, res) => {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: "eventId required" });
    const reservation = await storage.makeReservation(req.session.userId, eventId);
    if (!reservation) return res.status(409).json({ message: "Cannot reserve - event full or invalid" });
    res.status(201).json(reservation);
  });
  app2.delete("/api/reservations/:eventId", requireAuth, async (req, res) => {
    await storage.cancelReservation(req.session.userId, req.params.eventId);
    res.json({ message: "Cancelled" });
  });
  app2.get("/api/announcements", async (req, res) => {
    const clubId = req.query.clubId;
    const data = await storage.getAnnouncements(clubId);
    res.json(data);
  });
  app2.post("/api/announcements", requireAuth, async (req, res) => {
    try {
      const parsed = insertAnnouncementSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      const announcement = await storage.createAnnouncement(parsed.data);
      return res.status(201).json(announcement);
    } catch (err) {
      return res.status(500).json({ message: "Failed to create announcement" });
    }
  });
  app2.get("/api/notifications", requireAuth, async (req, res) => {
    const data = await storage.getNotifications(req.session.userId);
    res.json(data);
  });
  app2.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    await storage.markNotificationRead(req.params.id);
    res.json({ message: "Marked as read" });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs3 from "fs";
import * as path3 from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origin = req.header("origin");
    const isLocalhost = origin === "http://localhost" || origin === "http://127.0.0.1" || origin === "https://localhost" || origin === "https://127.0.0.1" || origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:") || origin?.startsWith("https://localhost:") || origin?.startsWith("https://127.0.0.1:");
    const configuredOrigin = process.env.CORS_ORIGIN?.trim();
    const isConfiguredOrigin = !!configuredOrigin && origin === configuredOrigin;
    if (origin && (isConfiguredOrigin || isLocalhost)) {
      const requestedHeaders = req.header("access-control-request-headers");
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        requestedHeaders || "Content-Type, Authorization"
      );
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path4 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path4.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path3.resolve(process.cwd(), "app.json");
    const appJsonContent = fs3.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path3.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs3.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs3.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path3.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs3.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path3.resolve(process.cwd(), "assets")));
  app2.use(express.static(path3.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
function setupSessions(app2) {
  if (dbProvider === "sqlite") {
    app2.use(
      session({
        secret: process.env.SESSION_SECRET || "byuconnect-dev-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1e3,
          httpOnly: true,
          secure: false,
          sameSite: "lax"
        }
      })
    );
    return;
  }
  const PgSession = connectPgSimple(session);
  app2.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session",
        createTableIfMissing: true
      }),
      secret: process.env.SESSION_SECRET || "byuconnect-dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        httpOnly: true,
        secure: false,
        sameSite: "lax"
      }
    })
  );
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupSessions(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "127.0.0.1";
  server.listen(
    {
      port,
      host
    },
    () => {
      log(`express server serving on http://${host}:${port}`);
    }
  );
})();
