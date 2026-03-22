import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as path from "path";
import * as fs from "fs";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertEventSchema,
  insertClubSchema,
  insertAnnouncementSchema,
  updateClubDetailsSchema,
  updateEventDetailsSchema,
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

function requireAuth(req: Request, res: Response, next: () => void) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

function isClubAdminRole(role: string): boolean {
  return role === "admin" || role === "president";
}

/** Normalize Express 5 `req.params` values that may be `string | string[]`. */
function paramString(value: string | string[] | undefined): string {
  if (value === undefined) return "";
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Returns false after sending 403 if the user is not an admin/president of the club. */
async function requireClubAdmin(req: Request, res: Response, clubId: string): Promise<boolean> {
  const userId = req.session.userId!;
  const membership = await storage.getMembershipForUserClub(userId, clubId);
  if (!membership || !isClubAdminRole(membership.role)) {
    res.status(403).json({ message: "Club admins only" });
    return false;
  }
  return true;
}

/** Loads event and ensures the user is an admin/president of its club. */
async function loadEventIfClubAdmin(req: Request, res: Response, eventId: string) {
  const event = await storage.getEvent(eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return undefined;
  }
  if (!(await requireClubAdmin(req, res, event.clubId))) return undefined;
  return event;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/map", (_req, res) => {
    const mapPath = path.resolve(process.cwd(), "server", "templates", "map.html");
    const html = fs.readFileSync(mapPath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });

  app.post("/api/auth/register", async (req, res) => {
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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // First login: create user profile in database if name is provided
        if (name && typeof name === "string" && name.trim()) {
          const parsed = insertUserSchema.safeParse({
            email: email.trim(),
            name: name.trim(),
            password,
          });
          if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
          }
          user = await storage.createUser(parsed.data);
        } else {
          return res.status(401).json({
            message: "Account not found. Sign up or enter your name to create a profile on first login.",
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

  app.get("/api/auth/me", async (req, res) => {
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

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/buildings", async (_req, res) => {
    const data = await storage.getBuildings();
    res.json(data);
  });

  app.get("/api/categories", async (_req, res) => {
    const data = await storage.getCategories();
    res.json(data);
  });

  app.get("/api/clubs", async (_req, res) => {
    const data = await storage.getClubs();
    res.json(data);
  });

  app.get("/api/clubs/:id", async (req, res) => {
    const club = await storage.getClub(paramString(req.params.id));
    if (!club) return res.status(404).json({ message: "Club not found" });
    res.json(club);
  });

  app.post("/api/clubs", requireAuth, async (req, res) => {
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

  app.patch("/api/clubs/:id/profile-image", requireAuth, async (req, res) => {
    const clubId = paramString(req.params.id);
    if (!clubId) return res.status(400).json({ message: "Invalid club id" });
    if (!(await requireClubAdmin(req, res, clubId))) return;
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl required" });
    const club = await storage.getClub(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });
    await storage.updateClubProfileImage(clubId, imageUrl);
    res.json({ message: "Updated" });
  });

  app.patch("/api/clubs/:id/cover-image", requireAuth, async (req, res) => {
    const clubId = paramString(req.params.id);
    if (!clubId) return res.status(400).json({ message: "Invalid club id" });
    if (!(await requireClubAdmin(req, res, clubId))) return;
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl required" });
    const club = await storage.getClub(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });
    await storage.updateClubCoverImage(clubId, imageUrl);
    res.json({ message: "Updated" });
  });

  app.patch("/api/clubs/:id", requireAuth, async (req, res) => {
    const clubId = paramString(req.params.id);
    if (!clubId) return res.status(400).json({ message: "Invalid club id" });
    if (!(await requireClubAdmin(req, res, clubId))) return;

    const parsed = updateClubDetailsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
    }
    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    const updated = await storage.updateClub(clubId, parsed.data);
    if (!updated) return res.status(404).json({ message: "Club not found" });
    res.json(updated);
  });

  app.get("/api/events", async (_req, res) => {
    const data = await storage.getEvents();
    res.json(data);
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(paramString(req.params.id));
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const body = {
        ...req.body,
        startTime: req.body.startTime ? new Date(req.body.startTime) : undefined,
        endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
      };
      const parsed = insertEventSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }
      if (!(await requireClubAdmin(req, res, parsed.data.clubId))) return;
      const event = await storage.createEvent(parsed.data);
      return res.status(201).json(event);
    } catch (err) {
      return res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id/cover-image", requireAuth, async (req, res) => {
    const eid = paramString(req.params.id);
    if (!eid) return res.status(400).json({ message: "Invalid event id" });
    const existing = await loadEventIfClubAdmin(req, res, eid);
    if (!existing) return;
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl required" });
    await storage.updateEventCoverImage(eid, imageUrl);
    res.json({ message: "Updated" });
  });

  app.patch("/api/events/:id", requireAuth, async (req, res) => {
    const eid = paramString(req.params.id);
    if (!eid) return res.status(400).json({ message: "Invalid event id" });
    const existing = await loadEventIfClubAdmin(req, res, eid);
    if (!existing) return;
    if (existing.isCancelled) {
      return res.status(400).json({ message: "Cannot edit a cancelled event" });
    }
    if (new Date(existing.endTime) <= new Date()) {
      return res.status(400).json({ message: "Cannot edit an event that has already ended" });
    }

    const parsed = updateEventDetailsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
    }
    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    const d = parsed.data;
    const updates: Parameters<typeof storage.updateEvent>[1] = {};
    if (d.title !== undefined) updates.title = d.title;
    if (d.description !== undefined) updates.description = d.description;
    if (d.buildingId !== undefined) updates.buildingId = d.buildingId;
    if (d.categoryId !== undefined) updates.categoryId = d.categoryId;
    if (d.room !== undefined) updates.room = d.room;
    if (d.hasLimitedCapacity !== undefined) updates.hasLimitedCapacity = d.hasLimitedCapacity;
    if (d.maxCapacity !== undefined) updates.maxCapacity = d.maxCapacity;
    if (d.hasFood !== undefined) updates.hasFood = d.hasFood;
    if (d.foodDescription !== undefined) updates.foodDescription = d.foodDescription;
    if (d.tags !== undefined) updates.tags = d.tags;
    if (d.startTime !== undefined) updates.startTime = new Date(d.startTime);
    if (d.endTime !== undefined) updates.endTime = new Date(d.endTime);

    const updated = await storage.updateEvent(eid, updates);
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json(updated);
  });

  app.get("/api/memberships", requireAuth, async (req, res) => {
    const data = await storage.getMemberships(req.session.userId!);
    res.json(data);
  });

  app.post("/api/memberships", requireAuth, async (req, res) => {
    const { clubId } = req.body;
    if (!clubId) return res.status(400).json({ message: "clubId required" });
    const membership = await storage.joinClub(req.session.userId!, clubId);
    res.status(201).json(membership);
  });

  app.delete("/api/memberships/:clubId", requireAuth, async (req, res) => {
    await storage.leaveClub(req.session.userId!, paramString(req.params.clubId));
    res.json({ message: "Left club" });
  });

  app.get("/api/saves", requireAuth, async (req, res) => {
    const data = await storage.getSaves(req.session.userId!);
    res.json(data);
  });

  app.post("/api/saves", requireAuth, async (req, res) => {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: "eventId required" });
    const save = await storage.saveEvent(req.session.userId!, eventId);
    res.status(201).json(save);
  });

  app.delete("/api/saves/:eventId", requireAuth, async (req, res) => {
    await storage.unsaveEvent(req.session.userId!, paramString(req.params.eventId));
    res.json({ message: "Unsaved" });
  });

  app.get("/api/reservations", requireAuth, async (req, res) => {
    const data = await storage.getReservations(req.session.userId!);
    res.json(data);
  });

  app.post("/api/reservations", requireAuth, async (req, res) => {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: "eventId required" });
    const reservation = await storage.makeReservation(req.session.userId!, eventId);
    if (!reservation) return res.status(409).json({ message: "Cannot reserve - event full or invalid" });
    res.status(201).json(reservation);
  });

  app.delete("/api/reservations/:eventId", requireAuth, async (req, res) => {
    await storage.cancelReservation(req.session.userId!, paramString(req.params.eventId));
    res.json({ message: "Cancelled" });
  });

  app.get("/api/announcements", async (req, res) => {
    const clubId = req.query.clubId as string | undefined;
    const data = await storage.getAnnouncements(clubId);
    res.json(data);
  });

  app.post("/api/announcements", requireAuth, async (req, res) => {
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

  app.get("/api/notifications", requireAuth, async (req, res) => {
    const data = await storage.getNotifications(req.session.userId!);
    res.json(data);
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    await storage.markNotificationRead(paramString(req.params.id));
    res.json({ message: "Marked as read" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
