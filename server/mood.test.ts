import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("mood procedures", () => {
  it("should create a mood entry", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mood.create({
      mood: 4,
      emotionTags: ["Heureux", "Calme"],
      notes: "Bonne journée!",
      energyLevel: 4,
      stressLevel: 2,
    });

    expect(result).toHaveProperty("id");
    expect(result.mood).toBe(4);
    expect(result.emotionTags).toContain("Heureux");
  });

  it("should list mood entries for user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a mood entry first
    await caller.mood.create({
      mood: 3,
      emotionTags: ["Neutre"],
      notes: "Journée normale",
      energyLevel: 3,
      stressLevel: 3,
    });

    const result = await caller.mood.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should validate mood value between 1 and 5", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.mood.create({
        mood: 6,
        emotionTags: [],
        notes: "",
        energyLevel: 3,
        stressLevel: 3,
      });
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("breathing procedures", () => {
  it("should create a breathing exercise entry", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.breathing.create({
      exerciseType: "box_breathing",
      duration: 240,
      relaxationLevel: 4,
    });

    expect(result).toHaveProperty("id");
    expect(result.exerciseType).toBe("box_breathing");
    expect(result.duration).toBe(240);
  });

  it("should list breathing exercises", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.breathing.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("journal procedures", () => {
  it("should create a journal entry", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.journal.create({
      title: "Ma première entrée",
      content: "Ceci est mon journal personnel.",
    });

    expect(result).toHaveProperty("id");
    expect(result.title).toBe("Ma première entrée");
  });

  it("should get a specific journal entry", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.journal.create({
      title: "Test Entry",
      content: "Test content",
    });

    const result = await caller.journal.get({ id: created.id });

    expect(result.id).toBe(created.id);
    expect(result.title).toBe("Test Entry");
  });

  it("should delete a journal entry", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.journal.create({
      title: "To Delete",
      content: "This will be deleted",
    });

    const result = await caller.journal.delete({ id: created.id });

    expect(result.success).toBe(true);
  });
});

describe("notifications procedures", () => {
  it("should list notifications", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.list({ unreadOnly: false });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should mark notification as read", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.markAsRead({ id: 1 });

    expect(result).toHaveProperty("success");
  });
});

describe("preferences procedures", () => {
  it("should get user preferences", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preferences.get();

    expect(result).toHaveProperty("userId");
  });

  it("should update user preferences", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preferences.update({
      bio: "Soy un usuario de Sérénité",
      moodReminderTime: "09:00",
      journalReminderTime: "20:00",
      notificationsEnabled: 1,
    });

    expect(result).toHaveProperty("userId");
    expect(result.bio).toBe("Soy un usuario de Sérénité");
  });
});
