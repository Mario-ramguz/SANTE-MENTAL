import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateName: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserName(ctx.user.id, input.name);
        return { success: true };
      }),
  }),

  // Procedimientos para seguimiento del humor
  mood: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const moodEntries = await db.getUserMoodEntries(ctx.user.id);
      return moodEntries.map((entry) => ({
        ...entry,
        emotionTags: entry.emotionTags ? JSON.parse(entry.emotionTags) : [],
      }));
    }),
    create: protectedProcedure
      .input(
        z.object({
          mood: z.number().min(1).max(5),
          emotionTags: z.array(z.string()).optional(),
          notes: z.string().optional(),
          energyLevel: z.number().min(1).max(5).optional(),
          stressLevel: z.number().min(1).max(5).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createMoodEntry(
          ctx.user.id,
          input.mood,
          input.emotionTags,
          input.notes,
          input.energyLevel,
          input.stressLevel
        );
        return { success: true };
      }),
  }),

  // Procedimientos para el diario personal
  journal: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const entries = await db.getUserJournalEntries(ctx.user.id);
      return entries.map((entry) => ({
        ...entry,
        tags: entry.tags ? JSON.parse(entry.tags) : [],
      }));
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const entry = await db.getJournalEntry(input.id, ctx.user.id);
        if (!entry) return null;
        return {
          ...entry,
          tags: entry.tags ? JSON.parse(entry.tags) : [],
        };
      }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          content: z.string().min(1),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createJournalEntry(
          ctx.user.id,
          input.title,
          input.content,
          input.tags
        );
        return { success: true };
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          content: z.string().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateJournalEntry(
          input.id,
          ctx.user.id,
          input.title,
          input.content,
          input.tags
        );
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteJournalEntry(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Procedimientos para ejercicios de respiración
  breathing: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBreathingExercises(ctx.user.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          exerciseType: z.string(),
          duration: z.number(),
          relaxationLevel: z.number().min(1).max(5).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createBreathingExercise(
          ctx.user.id,
          input.exerciseType,
          input.duration,
          input.relaxationLevel,
          input.notes
        );
        return { success: true };
      }),
  }),

  // Procedimientos para el chatbot IA
  chat: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      const messages = await db.getUserChatMessages(ctx.user.id, 100);
      return messages.reverse();
    }),
    send: protectedProcedure
      .input(z.object({ message: z.string().min(1), conversationId: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        // Crear o usar conversación existente
        let conversationId = input.conversationId;
        if (!conversationId) {
          conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.createConversation(ctx.user.id, `Chat ${new Date().toLocaleString('fr-FR')}`);
        }
        
        // Guardar mensaje del usuario con conversationId
        await db.addChatMessage(ctx.user.id, "user", input.message, conversationId);

        // Obtener historial reciente de conversación
        const recentMessages = await db.getUserChatMessages(ctx.user.id, 10);
        const conversationHistory = recentMessages
          .reverse()
          .map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));

        // Prompt del sistema para el asistente IA
        const systemPrompt = `Tu eres Sérénité, un asistente de bienestar mental. Responde en francés de forma CONCISA (máximo 2-3 oraciones). Sé cálido y empático. Nunca proporciones diagnósticos médicos.`;

        // Llamar al LLM
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
          ],
        });

        const assistantMessage = (() => {
          const content = response.choices[0]?.message?.content;
          if (typeof content === 'string') return content;
          return "Je suis désolé, je n'ai pas pu répondre.";
        })();

        // Guardar respuesta del asistente con conversationId
        await db.addChatMessage(ctx.user.id, "assistant", assistantMessage, conversationId);

        return { message: assistantMessage, conversationId };
      }),
  }),

  // Procedimientos para notificaciones
  notifications: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserNotifications(ctx.user.id, input.unreadOnly);
      }),
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Procedimientos para preferencias del usuario
  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPreferences(ctx.user.id);
    }),
    update: protectedProcedure
      .input(
        z.object({
          moodReminderTime: z.string().optional(),
          journalReminderTime: z.string().optional(),
          notificationsEnabled: z.number().optional(),
          theme: z.string().optional(),
          language: z.string().optional(),
          bio: z.string().optional(),
          avatarUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPreferences(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // Procedimientos para racha
  streak: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserStreak(ctx.user.id);
    }),
    update: protectedProcedure.mutation(async ({ ctx }) => {
      const result = await db.updateUserStreak(ctx.user.id);
      let newAchievement = null;
      
      // Verificar si se desbloqueó una medalla
      if (result && typeof result === 'object' && 'currentStreak' in result) {
        const streak = (result as any).currentStreak as number;
        const badges = [
          { days: 7, type: '7days', name: 'Semana de Oro', icon: '🥇', desc: 'Completaste 7 dias de racha' },
          { days: 30, type: '30days', name: 'Mes Perfecto', icon: '🏆', desc: 'Completaste 30 dias de racha' },
          { days: 100, type: '100days', name: 'Centenario', icon: '💯', desc: 'Completaste 100 dias de racha' },
          { days: 365, type: '365days', name: 'Campeon del Ano', icon: '👑', desc: 'Completaste 365 dias de racha' },
        ];
        
        for (const badge of badges) {
          if (streak === badge.days) {
            const hasIt = await db.hasAchievement(ctx.user.id, badge.type);
            if (!hasIt) {
              await db.createAchievement(
                ctx.user.id,
                badge.type,
                badge.name,
                badge.desc,
                badge.icon
              );
            }
          }
        }
      }
      
      return { ...result, newAchievement };
    }),
    achievements: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAchievements(ctx.user.id);
    }),
  }),

  // Procedimientos para conversaciones de chat
  conversations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserConversations(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.createConversation(ctx.user.id, input.title);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ conversationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteConversation(input.conversationId, ctx.user.id);
        return { success: true };
      }),
    deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
      return db.deleteAllConversations(ctx.user.id);
    }),
  }),

  // Procedimientos para leaderboard
  leaderboard: router({
    global: publicProcedure.query(async () => {
      return db.getGlobalLeaderboard(10);
    }),
  }),

  // Procedimientos para desafios semanales
  challenges: router({
    list: publicProcedure.query(async () => {
      return db.getActiveWeeklyChallenges();
    }),
    getUserProgress: protectedProcedure.query(async ({ ctx }) => {
      // Validar y actualizar progreso automaticamente
      await db.validateAndUpdateChallengeProgress(ctx.user.id);
      return db.getUserChallengeProgress(ctx.user.id);
    }),
    updateProgress: protectedProcedure
      .input(
        z.object({
          challengeId: z.number(),
          progress: z.number().min(0).max(100),
          isCompleted: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateChallengeProgress(
          ctx.user.id,
          input.challengeId,
          input.progress,
          input.isCompleted
        );

        if (input.isCompleted === 1) {
          const challenges = await db.getActiveWeeklyChallenges();
          const challenge = challenges.find((c) => c.id === input.challengeId);
          if (challenge) {
            const stats = await db.getUserStats(ctx.user.id);
            if (stats) {
              await db.updateUserStats(ctx.user.id, {
                totalPoints: (stats.totalPoints || 0) + (challenge.rewardPoints || 0),
                completedChallenges: (stats.completedChallenges || 0) + 1,
              });
            }
          }
        }

        return { success: true };
      }),
    validateProgress: protectedProcedure.mutation(async ({ ctx }) => {
      await db.validateAndUpdateChallengeProgress(ctx.user.id);
      return { success: true };
    }),
  }),

  // Procedimientos para validacion de desafios
  challengeValidation: router({
    checkAll: protectedProcedure.mutation(async ({ ctx }) => {
      await db.validateAndUpdateChallengeProgress(ctx.user.id);
      return { success: true };
    }),
  }),

  // Procedimientos para recompensas
  rewards: router({
    list: publicProcedure.query(async () => {
      return db.getAvailableRewards();
    }),
    getUserRedeemed: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserRedeemedRewards(ctx.user.id);
    }),
    redeem: protectedProcedure
      .input(z.object({ rewardId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await db.redeemReward(ctx.user.id, input.rewardId);
          return { success: true };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw error;
        }
      }),
    activate: protectedProcedure
      .input(z.object({ rewardId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get the reward info to know its category
        const reward = await db.getRewardById(input.rewardId);
        if (!reward) throw new Error("Reward not found");

        // Verify user has redeemed this reward
        const redeemed = await db.getUserRedeemedRewards(ctx.user.id);
        const hasIt = redeemed.some((r) => r.rewardId === input.rewardId);
        if (!hasIt) throw new Error("Reward not redeemed");

        // Execute the real effect based on category
        if (reward.category === "feature" && reward.name.toLowerCase().includes("boost")) {
          await db.boostUserStreak(ctx.user.id);
          return { success: true, effect: "streak_boosted" };
        }

        return { success: true, effect: "activated" };
      }),
  }),

  // Procedimientos para inicializar recompensas
  init: router({
    rewards: publicProcedure.mutation(async () => {
      await db.initializeRewards();
      return { success: true };
    }),
  }),

  // Procedimientos para estadisticas del usuario
  stats: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserStats(ctx.user.id);
    }),
    update: protectedProcedure
      .input(
        z.object({
          totalPoints: z.number().optional(),
          totalAchievements: z.number().optional(),
          completedChallenges: z.number().optional(),
          totalJournalEntries: z.number().optional(),
          totalBreathingExercises: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateUserStats(ctx.user.id, input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
