import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabla para rastrear el humor diario del usuario
 * Almacena emociones, notas opcionales y contexto emocional
 */
export const moodEntries = mysqlTable("mood_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Emoción principal: 1-5 escala (1=muy triste, 5=muy feliz) */
  mood: int("mood").notNull(),
  /** Etiquetas de emociones: "triste", "ansioso", "feliz", "calmo", "frustrado", etc. */
  emotionTags: text("emotionTags"), // JSON array
  /** Notas opcionales del usuario */
  notes: text("notes"),
  /** Nivel de energía: 1-5 */
  energyLevel: int("energyLevel"),
  /** Nivel de estrés: 1-5 */
  stressLevel: int("stressLevel"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = typeof moodEntries.$inferInsert;

/**
 * Tabla para el diario personal del usuario
 * Almacena entradas de texto reflexivas con fechas
 */
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Título de la entrada */
  title: varchar("title", { length: 255 }).notNull(),
  /** Contenido de la entrada */
  content: text("content").notNull(),
  /** Etiquetas para categorizar entradas */
  tags: text("tags"), // JSON array
  /** Nivel de privacidad: "private", "shared" */
  privacy: varchar("privacy", { length: 20 }).default("private"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * Tabla para ejercicios de respiración y relajación
 * Almacena el historial de ejercicios completados
 */
export const breathingExercises = mysqlTable("breathing_exercises", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Tipo de ejercicio: "box_breathing", "4_7_8", "deep_breathing", "guided_meditation" */
  exerciseType: varchar("exerciseType", { length: 50 }).notNull(),
  /** Duración en segundos */
  duration: int("duration").notNull(),
  /** Nivel de relajación post-ejercicio: 1-5 */
  relaxationLevel: int("relaxationLevel"),
  /** Notas del usuario sobre la experiencia */
  notes: text("notes"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type BreathingExercise = typeof breathingExercises.$inferSelect;
export type InsertBreathingExercise = typeof breathingExercises.$inferInsert;

/**
 * Tabla para notificaciones y recordatorios
 * Almacena recordatorios para motivar al usuario
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Tipo de notificación: "mood_reminder", "journal_reminder", "breathing_reminder", "motivational" */
  type: varchar("type", { length: 50 }).notNull(),
  /** Título de la notificación */
  title: varchar("title", { length: 255 }).notNull(),
  /** Contenido de la notificación */
  content: text("content"),
  /** Si ha sido leída */
  isRead: int("isRead").default(0),
  /** Hora programada para enviar */
  scheduledAt: timestamp("scheduledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Tabla para preferencias del usuario
 * Almacena configuraciones personalizadas
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  /** Hora del día para recordatorios de humor (formato HH:MM) */
  moodReminderTime: varchar("moodReminderTime", { length: 5 }).default("09:00"),
  /** Hora del día para recordatorios de diario */
  journalReminderTime: varchar("journalReminderTime", { length: 5 }).default("20:00"),
  /** Notificaciones habilitadas */
  notificationsEnabled: int("notificationsEnabled").default(1),
  /** Tema preferido: "light", "dark" */
  theme: varchar("theme", { length: 20 }).default("light"),
  /** Idioma preferido: "fr", "es", "en" */
  language: varchar("language", { length: 10 }).default("fr"),
  /** Biografía del usuario */
  bio: text("bio"),
  /** Avatar URL */
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

/**
 * Tabla para conversaciones de chatbot IA
 * Almacena el historial de conversaciones
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Rol del mensaje: "user" o "assistant" */
  role: varchar("role", { length: 20 }).notNull(),
  /** Contenido del mensaje */
  content: text("content").notNull(),
  /** Conversación ID para agrupar mensajes */
  conversationId: varchar("conversationId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Tabla para rastrear la racha de check-ins diarios
 * Almacena el número de días consecutivos y la última fecha de check-in
 */
export const streakData = mysqlTable("streak_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  // Número de días consecutivos
  currentStreak: int("currentStreak").default(0).notNull(),
  // Última fecha en que se hizo check-in
  lastCheckInDate: timestamp("lastCheckInDate"),
  // Racha máxima alcanzada
  maxStreak: int("maxStreak").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StreakData = typeof streakData.$inferSelect;
export type InsertStreakData = typeof streakData.$inferInsert;

/**
 * Tabla para conversaciones de chatbot IA
 * Almacena metadatos de conversaciones para poder borrarlas
 */
export const chatConversations = mysqlTable("chat_conversations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Título de la conversación
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;


/**
 * Tabla para medallas desbloqueadas por hitos de racha
 * Almacena las medallas que el usuario ha ganado
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Tipo de medalla: "7days", "30days", "100days", "365days"
  badgeType: varchar("badgeType", { length: 50 }).notNull(),
  // Nombre de la medalla
  name: varchar("name", { length: 100 }).notNull(),
  // Descripción
  description: text("description"),
  // Emoji o icono
  icon: varchar("icon", { length: 10 }),
  // Fecha en que se desbloqueó
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;


/**
 * Tabla para desafíos semanales
 * Almacena los desafíos disponibles y su progreso por usuario
 */
export const weeklyChallenges = mysqlTable("weekly_challenges", {
  id: int("id").autoincrement().primaryKey(),
  // Nombre del desafío
  name: varchar("name", { length: 100 }).notNull(),
  // Descripción
  description: text("description"),
  // Objetivo (ej: "7 días sin faltar", "Escribir 5 entradas")
  objective: varchar("objective", { length: 255 }).notNull(),
  // Icono/emoji
  icon: varchar("icon", { length: 10 }),
  // Recompensa en puntos
  rewardPoints: int("rewardPoints").default(50),
  // Semana de inicio (formato YYYY-W##)
  weekStart: varchar("weekStart", { length: 10 }).notNull(),
  // Semana de fin
  weekEnd: varchar("weekEnd", { length: 10 }).notNull(),
  // Activo o no
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
export type InsertWeeklyChallenge = typeof weeklyChallenges.$inferInsert;

/**
 * Tabla para progreso del usuario en desafíos
 */
export const challengeProgress = mysqlTable("challenge_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: int("challengeId").notNull().references(() => weeklyChallenges.id, { onDelete: "cascade" }),
  // Progreso actual (0-100%)
  progress: int("progress").default(0),
  // Si está completado
  isCompleted: int("isCompleted").default(0),
  // Fecha de completación
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChallengeProgress = typeof challengeProgress.$inferSelect;
export type InsertChallengeProgress = typeof challengeProgress.$inferInsert;

/**
 * Tabla para puntos y estadísticas del usuario
 * Almacena puntos totales, ranking, etc.
 */
export const userStats = mysqlTable("user_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  // Puntos totales acumulados
  totalPoints: int("totalPoints").default(0),
  // Ranking global
  globalRank: int("globalRank"),
  // Medallas totales desbloqueadas
  totalAchievements: int("totalAchievements").default(0),
  // Desafíos completados
  completedChallenges: int("completedChallenges").default(0),
  // Entradas de diario totales
  totalJournalEntries: int("totalJournalEntries").default(0),
  // Ejercicios de respiración completados
  totalBreathingExercises: int("totalBreathingExercises").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

/**
 * Tabla para recompensas canjeables
 * Almacena items que los usuarios pueden comprar con puntos
 */
export const rewards = mysqlTable("rewards", {
  id: int("id").autoincrement().primaryKey(),
  // Nombre de la recompensa
  name: varchar("name", { length: 100 }).notNull(),
  // Descripción
  description: text("description"),
  // Costo en puntos
  pointsCost: int("pointsCost").notNull(),
  // Icono/emoji
  icon: varchar("icon", { length: 10 }),
  // Categoría: "theme", "feature", "badge", "other"
  category: varchar("category", { length: 50 }).default("other"),
  // Si está disponible
  isAvailable: int("isAvailable").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

/**
 * Tabla para canjes de recompensas por usuario
 * Almacena el historial de recompensas canjeadas
 */
export const userRewards = mysqlTable("user_rewards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  rewardId: int("rewardId").notNull().references(() => rewards.id, { onDelete: "cascade" }),
  // Puntos gastados
  pointsSpent: int("pointsSpent").notNull(),
  // Fecha de canje
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = typeof userRewards.$inferInsert;
