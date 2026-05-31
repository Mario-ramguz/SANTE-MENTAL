import { motion } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';

// Detect challenge type from its name/objective regardless of language in DB
function detectChallengeType(name: string, objective: string): string {
  const text = (name + " " + objective).toLowerCase();
  if (text.includes("7") && (text.includes("racha") || text.includes("streak") || text.includes("jour") || text.includes("day") || text.includes("día"))) return "streak7";
  if (text.includes("30") && (text.includes("racha") || text.includes("streak") || text.includes("jour") || text.includes("day") || text.includes("día"))) return "streak30";
  if (text.includes("escrit") || text.includes("journal") || text.includes("diario") || text.includes("entrad") || text.includes("entry") || text.includes("entries")) return "journal";
  if (text.includes("respir") || text.includes("breath") || text.includes("meditat")) return "breathing";
  if (text.includes("chat") || text.includes("convers") || text.includes("charla") || text.includes("ia") || text.includes("ai")) return "chat";
  return "generic";
}

// Translation maps for challenge names/descriptions/objectives per type
const challengeTranslations: Record<string, Record<string, { name: string; description: string; objective: string }>> = {
  streak7: {
    fr: { name: "7 Jours Sans Faillir", description: "Maintenez votre routine pendant 7 jours consécutifs.", objective: "7 jours de streak" },
    es: { name: "7 Días Sin Faltar", description: "Mantén tu rutina durante 7 días consecutivos.", objective: "7 días de racha" },
    en: { name: "7 Days Straight", description: "Keep your routine going for 7 consecutive days.", objective: "7 day streak" },
  },
  streak30: {
    fr: { name: "Streak Dorée", description: "Atteignez un streak de 30 jours consécutifs.", objective: "30 jours de streak" },
    es: { name: "Racha Dorada", description: "Alcanza una racha de 30 días consecutivos.", objective: "30 días de racha" },
    en: { name: "Golden Streak", description: "Reach a 30-day consecutive streak.", objective: "30 day streak" },
  },
  journal: {
    fr: { name: "Écrivain Dévoué", description: "Écrivez 5 entrées dans votre journal personnel.", objective: "5 entrées" },
    es: { name: "Escritor Dedicado", description: "Escribe 5 entradas en tu diario personal.", objective: "5 entradas" },
    en: { name: "Dedicated Writer", description: "Write 5 entries in your personal journal.", objective: "5 entries" },
  },
  breathing: {
    fr: { name: "Maître de la Respiration", description: "Complétez 7 exercices de respiration cette semaine.", objective: "7 exercices" },
    es: { name: "Maestro de la Respiración", description: "Completa 7 ejercicios de respiración esta semana.", objective: "7 ejercicios" },
    en: { name: "Breathing Master", description: "Complete 7 breathing exercises this week.", objective: "7 exercises" },
  },
  chat: {
    fr: { name: "Bavard Bienveillant", description: "Ayez 5 conversations avec l'assistant IA.", objective: "5 conversations" },
    es: { name: "Conversador Amigable", description: "Ten 5 conversaciones con el asistente IA.", objective: "5 conversaciones" },
    en: { name: "Friendly Chatter", description: "Have 5 conversations with the AI assistant.", objective: "5 conversations" },
  },
  generic: {
    fr: { name: "Défi de la Semaine", description: "Complétez ce défi pour gagner des points.", objective: "Compléter le défi" },
    es: { name: "Desafío de la Semana", description: "Completa este desafío para ganar puntos.", objective: "Completar el desafío" },
    en: { name: "Weekly Challenge", description: "Complete this challenge to earn points.", objective: "Complete the challenge" },
  },
};

export default function Challenges() {
  const { t, language } = useLanguage();
  const { data: challenges, isLoading } = trpc.challenges.list.useQuery(undefined, { retry: false });
  const { data: userProgress } = trpc.challenges.getUserProgress.useQuery(undefined, { retry: false });

  const getChallengeProgress = (challengeId: number) =>
    userProgress?.find((p) => p.challengeId === challengeId);

  const getTranslated = (challenge: { name: string; description?: string | null; objective?: string | null }) => {
    const type = detectChallengeType(challenge.name, challenge.objective || "");
    const lang = language as "fr" | "es" | "en";
    return challengeTranslations[type]?.[lang] || challengeTranslations["generic"][lang];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div className="mb-8 md:mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 md:w-8 h-6 md:h-8 text-yellow-500" />
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t("challenges.title")}</h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">{t("challenges.description")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground mt-4">{t("common.loading")}</p>
            </div>
          ) : challenges && challenges.length > 0 ? (
            challenges.map((challenge, index) => {
              const progress = getChallengeProgress(challenge.id);
              const progressPercent = progress?.progress || 0;
              const isCompleted = progress?.isCompleted === 1;
              const translated = getTranslated(challenge);

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-4 md:p-6 h-full flex flex-col transition-all hover:shadow-lg border-2 ${
                    isCompleted
                      ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
                      : "border-border"
                  }`}>
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="text-2xl md:text-4xl flex-shrink-0">{challenge.icon}</div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base md:text-lg text-foreground truncate">{translated.name}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">{translated.objective}</p>
                        </div>
                      </div>
                      {isCompleted && <CheckCircle2 className="w-5 md:w-6 h-5 md:h-6 text-green-500 flex-shrink-0 mt-1" />}
                    </div>

                    <p className="text-xs md:text-sm text-muted-foreground mb-4">{translated.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-muted-foreground">{t("challenges.progress")}</span>
                        <span className="text-xs font-bold text-foreground">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-400 to-green-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    <div className="mb-4 p-2 md:p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs md:text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                        🎁 {t("challenges.reward")}: {challenge.rewardPoints} {t("common.points")}
                      </p>
                    </div>

                    <div className="mt-auto">
                      {isCompleted ? (
                        <div className="w-full text-center py-2 px-4 bg-green-500 text-white text-xs md:text-sm rounded-md font-medium">
                          ✓ {t("challenges.completed")}
                        </div>
                      ) : (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">{t("challenges.auto_progress")}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Card className="col-span-full p-8 md:p-12 text-center">
              <p className="text-muted-foreground text-base md:text-lg">{t("challenges.no_challenges")}</p>
            </Card>
          )}
        </div>

        <motion.div
          className="mt-8 md:mt-12 p-4 md:p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-foreground mb-2 text-base md:text-lg">💡 {t("challenges.how_it_works")}</h3>
          <ul className="text-muted-foreground space-y-1 md:space-y-2 text-xs md:text-sm">
            <li>• {t("challenges.tip_1")}</li>
            <li>• {t("challenges.tip_2")}</li>
            <li>• {t("challenges.tip_3")}</li>
            <li>• {t("challenges.tip_4")}</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
