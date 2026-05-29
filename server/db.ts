import {
  eq,
  desc,
  gte,
  lte,
  and,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  moodEntries,
  journalEntries,
  breathingExercises,
  notifications,
  userPreferences,
  chatMessages,
  InsertUserPreferences,
  streakData,
  chatConversations,
  InsertStreakData,
  InsertChatConversation,
  achievements,
  InsertAchievement,
  weeklyChallenges,
  challengeProgress,
  userStats,
  rewards,
  userRewards,
  InsertUserReward,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Actualizar el nombre del usuario
 */
export async function updateUserName(userId: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ name }).where(eq(users.id, userId));
}

/**
 * Obtener todas las entradas de humor del usuario para un rango de fechas
 */
export async function getUserMoodEntries(
  userId: number,
  startDate?: Date,
  endDate?: Date
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(moodEntries.userId, userId)];
  if (startDate) conditions.push(gte(moodEntries.createdAt, startDate));
  if (endDate) conditions.push(lte(moodEntries.createdAt, endDate));

  return db
    .select()
    .from(moodEntries)
    .where(and(...conditions))
    .orderBy(desc(moodEntries.createdAt));
}

/**
 * Crear una nueva entrada de humor
 */
export async function createMoodEntry(
  userId: number,
  mood: number,
  emotionTags?: string[],
  notes?: string,
  energyLevel?: number,
  stressLevel?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(moodEntries).values({
    userId,
    mood,
    emotionTags: emotionTags ? JSON.stringify(emotionTags) : null,
    notes,
    energyLevel,
    stressLevel,
  });

  return result;
}

/**
 * Obtener todas las entradas del diario del usuario
 */
export async function getUserJournalEntries(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt));
}

/**
 * Crear una nueva entrada del diario
 */
export async function createJournalEntry(
  userId: number,
  title: string,
  content: string,
  tags?: string[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(journalEntries).values({
    userId,
    title,
    content,
    tags: tags ? JSON.stringify(tags) : null,
  });
}

/**
 * Obtener una entrada del diario por ID
 */
export async function getJournalEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Actualizar una entrada del diario
 */
export async function updateJournalEntry(
  id: number,
  userId: number,
  title?: string,
  content?: string,
  tags?: string[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;

  return db
    .update(journalEntries)
    .set(updateData)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

/**
 * Eliminar una entrada del diario
 */
export async function deleteJournalEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

/**
 * Obtener el historial de ejercicios de respiración del usuario
 */
export async function getUserBreathingExercises(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(breathingExercises)
    .where(eq(breathingExercises.userId, userId))
    .orderBy(desc(breathingExercises.completedAt));
}

/**
 * Registrar un ejercicio de respiración completado
 */
export async function createBreathingExercise(
  userId: number,
  exerciseType: string,
  duration: number,
  relaxationLevel?: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(breathingExercises).values({
    userId,
    exerciseType,
    duration,
    relaxationLevel,
    notes,
  });
}

/**
 * Obtener notificaciones del usuario
 */
export async function getUserNotifications(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) conditions.push(eq(notifications.isRead, 0));

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt));
}

/**
 * Crear una notificación
 */
export async function createNotification(
  userId: number,
  type: string,
  title: string,
  content?: string,
  scheduledAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(notifications).values({
    userId,
    type,
    title,
    content,
    scheduledAt,
  });
}

/**
 * Marcar una notificación como leída
 */
export async function markNotificationAsRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(notifications)
    .set({ isRead: 1 })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

/**
 * Obtener o crear preferencias del usuario
 */
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (result.length > 0) {
    return result[0];
  }

  // Crear preferencias por defecto
  await db.insert(userPreferences).values({ userId });
  return db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1)
    .then((r) => (r.length > 0 ? r[0] : null));
}

/**
 * Actualizar preferencias del usuario
 */
export async function updateUserPreferences(
  userId: number,
  preferences: Partial<InsertUserPreferences>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(userPreferences)
    .set(preferences)
    .where(eq(userPreferences.userId, userId));
}

/**
 * Obtener mensajes de chat del usuario
 */
export async function getUserChatMessages(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

/**
 * Agregar un mensaje de chat
 */
export async function addChatMessage(
  userId: number,
  role: "user" | "assistant",
  content: string,
  conversationId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(chatMessages).values({
    userId,
    role,
    content,
    conversationId,
  });
}


/**
 * Obtener datos de racha del usuario
 */
export async function getUserStreak(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(streakData)
    .where(eq(streakData.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Actualizar racha del usuario después de un check-in
 */
export async function updateUserStreak(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const streak = await getUserStreak(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!streak) {
    // Crear nueva racha
    return db.insert(streakData).values({
      userId,
      currentStreak: 1,
      lastCheckInDate: new Date(),
      maxStreak: 1,
    });
  }

  const lastCheckIn = streak.lastCheckInDate ? new Date(streak.lastCheckInDate) : null;
  lastCheckIn?.setHours(0, 0, 0, 0);

  if (lastCheckIn && lastCheckIn.getTime() === today.getTime()) {
    // Ya hizo check-in hoy, no incrementar
    return streak;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = 1;
  if (lastCheckIn && lastCheckIn.getTime() === yesterday.getTime()) {
    // Ayer hizo check-in, incrementar racha
    newStreak = streak.currentStreak + 1;
  }

  const newMaxStreak = Math.max(newStreak, streak.maxStreak);

  await db
    .update(streakData)
    .set({
      currentStreak: newStreak,
      lastCheckInDate: new Date(),
      maxStreak: newMaxStreak,
    })
    .where(eq(streakData.userId, userId));

  return { currentStreak: newStreak, maxStreak: newMaxStreak };
}

/**
 * Obtener conversaciones del usuario
 */
export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.userId, userId))
    .orderBy(desc(chatConversations.createdAt));
}

/**
 * Crear una nueva conversación
 */
export async function createConversation(
  userId: number,
  title?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return db.insert(chatConversations).values({
    id: conversationId,
    userId,
    title: title || `Conversation ${new Date().toLocaleDateString()}`,
  });
}

/**
 * Eliminar una conversación y sus mensajes
 */
export async function deleteConversation(conversationId: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Eliminar mensajes de la conversación
  await db
    .delete(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId));

  // Eliminar la conversación
  return db
    .delete(chatConversations)
    .where(
      and(
        eq(chatConversations.id, conversationId),
        eq(chatConversations.userId, userId)
      )
    );
}

/**
 * Eliminar todas las conversaciones del usuario
 */
export async function deleteAllConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conversations = await getUserConversations(userId);
  
  for (const conv of conversations) {
    await deleteConversation(conv.id, userId);
  }

  return { deleted: conversations.length };
}


/**
 * Obtener medallas desbloqueadas del usuario
 */
export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.unlockedAt));
}

/**
 * Crear una medalla para el usuario
 */
export async function createAchievement(
  userId: number,
  badgeType: string,
  name: string,
  description?: string,
  icon?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(achievements).values({
    userId,
    badgeType,
    name,
    description,
    icon,
  });
}

/**
 * Verificar si el usuario ya tiene una medalla específica
 */
export async function hasAchievement(userId: number, badgeType: string) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(achievements)
    .where(
      and(
        eq(achievements.userId, userId),
        eq(achievements.badgeType, badgeType)
      )
    )
    .limit(1);

  return result.length > 0;
}


/**
 * Obtener leaderboard global (top 10 usuarios con mayor racha)
 */
export async function getGlobalLeaderboard(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      currentStreak: streakData.currentStreak,
      lastUpdated: streakData.updatedAt,
    })
    .from(users)
    .leftJoin(streakData, eq(users.id, streakData.userId))
    .orderBy(desc(streakData.currentStreak))
    .limit(limit);
}

/**
 * Obtener desafíos semanales activos
 */
export async function getActiveWeeklyChallenges() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(weeklyChallenges)
    .where(eq(weeklyChallenges.isActive, 1));
}

/**
 * Obtener progreso del usuario en desafíos
 */
export async function getUserChallengeProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(challengeProgress)
    .where(eq(challengeProgress.userId, userId));
}

/**
 * Actualizar progreso de desafío
 */
export async function updateChallengeProgress(
  userId: number,
  challengeId: number,
  progress: number,
  isCompleted?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(challengeProgress)
    .where(
      and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.challengeId, challengeId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(challengeProgress)
      .set({
        progress,
        isCompleted: isCompleted !== undefined ? isCompleted : existing[0].isCompleted,
        completedAt: isCompleted === 1 ? new Date() : existing[0].completedAt,
      })
      .where(
        and(
          eq(challengeProgress.userId, userId),
          eq(challengeProgress.challengeId, challengeId)
        )
      );
  } else {
    await db.insert(challengeProgress).values({
      userId,
      challengeId,
      progress,
      isCompleted: isCompleted || 0,
    });
  }
}

/**
 * Obtener o crear estadísticas del usuario
 */
export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Crear nuevas estadísticas
  await db.insert(userStats).values({
    userId,
    totalPoints: 0,
    totalAchievements: 0,
    completedChallenges: 0,
    totalJournalEntries: 0,
    totalBreathingExercises: 0,
  });

  return db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1)
    .then((rows) => rows[0]);
}

/**
 * Actualizar estadísticas del usuario
 */
export async function updateUserStats(userId: number, updates: Partial<typeof userStats.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userStats)
    .set(updates)
    .where(eq(userStats.userId, userId));
}


/**
 * Contar entradas de diario del usuario en los últimos N días
 */
export async function countJournalEntriesInDays(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return 0;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        gte(journalEntries.createdAt, startDate)
      )
    );

  return result.length;
}

/**
 * Contar ejercicios de respiración del usuario en los últimos N días
 */
export async function countBreathingExercisesInDays(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return 0;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select()
    .from(breathingExercises)
    .where(
      and(
        eq(breathingExercises.userId, userId),
        gte(breathingExercises.completedAt, startDate)
      )
    );

  return result.length;
}

/**
 * Contar conversaciones de chat del usuario en los últimos N días
 */
export async function countChatConversationsInDays(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return 0;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select()
    .from(chatConversations)
    .where(
      and(
        eq(chatConversations.userId, userId),
        gte(chatConversations.createdAt, startDate)
      )
    );

  return result.length;
}

/**
 * Validar y actualizar progreso de desafíos automáticamente
 */
export async function validateAndUpdateChallengeProgress(userId: number) {
  const db = await getDb();
  if (!db) return;

  // Obtener datos del usuario
  const streak = await getUserStreak(userId);
  const journalCount = await countJournalEntriesInDays(userId, 7);
  const breathingCount = await countBreathingExercisesInDays(userId, 7);
  const chatCount = await countChatConversationsInDays(userId, 7);

  // Obtener desafíos activos
  const challenges = await getActiveWeeklyChallenges();
  const userProgress = await getUserChallengeProgress(userId);

  for (const challenge of challenges) {
    const progress = userProgress.find((p) => p.challengeId === challenge.id);

    let newProgress = 0;
    let isCompleted = 0;

    // Validar según el tipo de desafío
    if (challenge.name.includes("7 jours") || challenge.name.includes("7 days") || challenge.name.includes("7 días")) {
      // Desafío de racha de 7 días
      newProgress = Math.min((streak?.currentStreak || 0) * (100 / 7), 100);
      isCompleted = (streak?.currentStreak || 0) >= 7 ? 1 : 0;
    } else if (challenge.name.includes("Écrivain") || challenge.name.includes("Writer") || challenge.name.includes("Escritor")) {
      // Desafío de escritor (5 entradas de diario)
      newProgress = Math.min(journalCount * (100 / 5), 100);
      isCompleted = journalCount >= 5 ? 1 : 0;
    } else if (challenge.name.includes("Respiration") || challenge.name.includes("Breathing") || challenge.name.includes("Respiración")) {
      // Desafío de respiración (7 ejercicios)
      newProgress = Math.min(breathingCount * (100 / 7), 100);
      isCompleted = breathingCount >= 7 ? 1 : 0;
    } else if (challenge.name.includes("Charla") || challenge.name.includes("Chat") || challenge.name.includes("Conversation")) {
      // Desafío de charla (5 conversaciones)
      newProgress = Math.min(chatCount * (100 / 5), 100);
      isCompleted = chatCount >= 5 ? 1 : 0;
    } else if (challenge.name.includes("Racha Dorada") || challenge.name.includes("Golden Streak") || challenge.name.includes("Racha de Oro")) {
      // Desafío de racha dorada (30 días)
      newProgress = Math.min((streak?.currentStreak || 0) * (100 / 30), 100);
      isCompleted = (streak?.currentStreak || 0) >= 30 ? 1 : 0;
    }

    // Actualizar progreso si cambió
    if (!progress || progress.progress !== newProgress || (isCompleted === 1 && progress.isCompleted === 0)) {
      await updateChallengeProgress(userId, challenge.id, newProgress, isCompleted);

      // Si se completó y no estaba completado antes, agregar puntos
      if (isCompleted === 1 && (!progress || progress.isCompleted === 0)) {
        const stats = await getUserStats(userId);
        if (stats) {
          await updateUserStats(userId, {
            totalPoints: (stats.totalPoints || 0) + (challenge.rewardPoints || 0),
            completedChallenges: (stats.completedChallenges || 0) + 1,
          });
        }
      }
    }
  }
}


/**
 * Obtener todas las recompensas disponibles
 */
export async function getAvailableRewards() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(rewards)
    .where(eq(rewards.isAvailable, 1))
    .orderBy(rewards.pointsCost);
}

/**
 * Obtener una recompensa por ID
 */
export async function getRewardById(rewardId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(rewards)
    .where(eq(rewards.id, rewardId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Obtener historial de recompensas canjeadas por usuario
 */
export async function getUserRedeemedRewards(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(userRewards)
    .where(eq(userRewards.userId, userId))
    .orderBy(desc(userRewards.redeemedAt));
}

/**
 * Canjear una recompensa
 */
export async function redeemReward(userId: number, rewardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Obtener la recompensa
  const reward = await getRewardById(rewardId);
  if (!reward) throw new Error("Reward not found");

  // Obtener estadísticas del usuario
  const stats = await getUserStats(userId);
  if (!stats || (stats.totalPoints || 0) < reward.pointsCost) {
    throw new Error("Insufficient points");
  }

  // Restar puntos del usuario
  await updateUserStats(userId, {
    totalPoints: (stats.totalPoints || 0) - reward.pointsCost,
  });

  // Registrar el canje
  return db.insert(userRewards).values({
    userId,
    rewardId,
    pointsSpent: reward.pointsCost,
  });
}

/**
 * Crear recompensas iniciales (solo si no existen)
 */
export async function initializeRewards() {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(rewards).limit(1);
  if (existing.length > 0) return; // Ya existen recompensas

  const initialRewards = [
    {
      name: "Theme Nocturne Premium",
      description: "Déverrouille un thème nocturne exclusif avec dégradés personnalisés",
      pointsCost: 100,
      icon: "🌙",
      category: "theme",
    },
    {
      name: "Medalla Especial",
      description: "Obtén una medalla exclusiva en tu perfil",
      pointsCost: 150,
      icon: "🏅",
      category: "badge",
    },
    {
      name: "Meditation Guidée Premium",
      description: "Acceso a 10 meditaciones guiadas adicionales",
      pointsCost: 200,
      icon: "🧘",
      category: "feature",
    },
    {
      name: "Rapport Mensuel Gratuit",
      description: "Descarga un reporte detallado de tu progreso",
      pointsCost: 75,
      icon: "📊",
      category: "feature",
    },
    {
      name: "Avatar Personnalisé",
      description: "Personnalise ton avatar avec des options exclusives",
      pointsCost: 120,
      icon: "👤",
      category: "feature",
    },
    {
      name: "Boost de Racha",
      description: "Augmente ta racha de 7 jours",
      pointsCost: 250,
      icon: "🔥",
      category: "feature",
    },
  ];

  for (const reward of initialRewards) {
    await db.insert(rewards).values(reward);
  }
}

/**
 * Boost streak: adds 7 days to the user's current streak
 */
export async function boostUserStreak(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const streak = await getUserStreak(userId);
  if (!streak) {
    return db.insert(streakData).values({
      userId,
      currentStreak: 7,
      lastCheckInDate: new Date(),
      maxStreak: 7,
    });
  }

  const newStreak = (streak.currentStreak || 0) + 7;
  const newMax = Math.max(streak.maxStreak || 0, newStreak);

  return db
    .update(streakData)
    .set({ currentStreak: newStreak, maxStreak: newMax })
    .where(eq(streakData.userId, userId));
}

/**
 * Auto-creates all tables if they don't exist.
 * Called on server startup.
 */
export async function runAutoMigrate() {
  const database = await getDb();
  if (!database) {
    console.warn("[DB] Skipping migration: no database connection");
    return;
  }

  console.log("[DB] Running auto-migration...");
  try {
    // Users
    await database.execute(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      openId VARCHAR(255) NOT NULL UNIQUE,
      name TEXT,
      email VARCHAR(320),
      loginMethod VARCHAR(64),
      role ENUM('user','admin') DEFAULT 'user' NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS mood_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      mood INT NOT NULL,
      emotionTags JSON,
      notes TEXT,
      energyLevel INT DEFAULT 3,
      stressLevel INT DEFAULT 3,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS journal_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      tags JSON,
      rating INT DEFAULT 3,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS breathing_exercises (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      exerciseType VARCHAR(100) NOT NULL,
      duration INT NOT NULL,
      relaxationLevel INT DEFAULT 3,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      type VARCHAR(50) DEFAULT 'info',
      isRead INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS user_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      bio TEXT,
      moodReminderTime VARCHAR(10) DEFAULT '09:00',
      journalReminderTime VARCHAR(10) DEFAULT '20:00',
      notificationsEnabled INT DEFAULT 1,
      language VARCHAR(10) DEFAULT 'fr',
      theme VARCHAR(20) DEFAULT 'light',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS chat_conversations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      title VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversationId INT NOT NULL,
      userId INT NOT NULL,
      role VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS streak_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      currentStreak INT DEFAULT 0,
      maxStreak INT DEFAULT 0,
      lastCheckInDate TIMESTAMP,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS achievements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      type VARCHAR(100) NOT NULL,
      unlockedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS weekly_challenges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      objective VARCHAR(255),
      icon VARCHAR(10),
      rewardPoints INT DEFAULT 100,
      weekStart DATE,
      isActive INT DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS challenge_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      challengeId INT NOT NULL,
      progress FLOAT DEFAULT 0,
      isCompleted INT DEFAULT 0,
      completedAt TIMESTAMP,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS user_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      totalPoints INT DEFAULT 0,
      weeklyPoints INT DEFAULT 0,
      totalMoodEntries INT DEFAULT 0,
      totalJournalEntries INT DEFAULT 0,
      totalBreathingExercises INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS rewards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      pointsCost INT NOT NULL,
      icon VARCHAR(10),
      category VARCHAR(50) DEFAULT 'other',
      isAvailable INT DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await database.execute(`CREATE TABLE IF NOT EXISTS user_rewards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      rewardId INT NOT NULL,
      redeemedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    console.log("[DB] Auto-migration complete ✓");
  } catch (err) {
    console.error("[DB] Migration error:", err);
  }
}
