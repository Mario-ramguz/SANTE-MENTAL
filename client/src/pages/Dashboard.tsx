import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Heart,
  BookOpen,
  Wind,
  MessageCircle,
  Bell,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { StreakCard } from "@/components/StreakCard";
import { formatDistanceToNow } from "date-fns";
import { fr, es, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRewards } from "@/contexts/RewardsContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const { profileEmoji } = useRewards();

  const dateLocale = language === "fr" ? fr : language === "es" ? es : enUS;

  const { data: moodEntries, isLoading: moodLoading } = trpc.mood.list.useQuery();
  const { data: journalEntries, isLoading: journalLoading } = trpc.journal.list.useQuery();
  const { data: breathingExercises, isLoading: breathingLoading } = trpc.breathing.list.useQuery();
  const { data: notifications, isLoading: notificationsLoading } =
    trpc.notifications.list.useQuery({ unreadOnly: true });

  const isLoading = moodLoading || journalLoading || breathingLoading || notificationsLoading;

  const todayMood = moodEntries?.[0];
  const todayDate = new Date().toDateString();
  const isTodayMood = todayMood?.createdAt && new Date(todayMood.createdAt).toDateString() === todayDate;

  const moodLabels: Record<number, string> = {
    1: t("mood.very_sad"),
    2: t("mood.sad"),
    3: t("mood.neutral"),
    4: t("mood.happy"),
    5: t("mood.very_happy"),
  };
  const moodEmojis: Record<number, string> = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

  const stats = [
    { label: t("dashboard.mood_entries"), value: moodEntries?.length || 0, icon: Heart, color: "text-red-500" },
    { label: t("dashboard.journal_entries"), value: journalEntries?.length || 0, icon: BookOpen, color: "text-blue-500" },
    { label: t("dashboard.exercises"), value: breathingExercises?.length || 0, icon: Wind, color: "text-green-500" },
    { label: t("dashboard.notifications"), value: notifications?.length || 0, icon: Bell, color: "text-purple-500" },
  ];

  const quickActions = [
    { label: t("dashboard.mood"), icon: Heart, color: "from-red-500/20 to-red-600/20", action: () => navigate("/mood") },
    { label: t("dashboard.journal"), icon: BookOpen, color: "from-blue-500/20 to-blue-600/20", action: () => navigate("/journal") },
    { label: t("dashboard.breathing"), icon: Wind, color: "from-green-500/20 to-green-600/20", action: () => navigate("/breathing") },
    { label: t("dashboard.chat"), icon: MessageCircle, color: "from-purple-500/20 to-purple-600/20", action: () => navigate("/chat") },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            <span className="text-5xl mr-3">{profileEmoji}</span>{t("dashboard.welcome")}, {user?.name || "ami"}!
          </h1>
          <p className="text-muted-foreground mt-2">
            {isTodayMood ? t("dashboard.mood_recorded") : t("dashboard.mood_prompt")}
          </p>
        </div>
        <StreakCard />
      </div>

      {isTodayMood && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.today_mood")}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-4xl">{moodEmojis[todayMood.mood]}</span>
                <div>
                  <p className="text-lg font-semibold text-foreground">{moodLabels[todayMood.mood]}</p>
                  {todayMood.notes && (
                    <p className="text-sm text-muted-foreground">{todayMood.notes}</p>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/mood")}>
              {t("dashboard.update")}
            </Button>
          </div>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">{t("dashboard.quick_access")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className={`p-6 rounded-xl bg-gradient-to-br ${action.color} border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg text-left group`}
              >
                <Icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-foreground">{action.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">{t("dashboard.stats")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">{t("dashboard.recent_activity")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">{t("dashboard.recent_entries")}</h3>
            </div>
            <div className="space-y-3">
              {journalEntries?.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate("/journal")}
                >
                  <p className="font-medium text-foreground text-sm">{entry.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(entry.createdAt), { locale: dateLocale, addSuffix: true })}
                  </p>
                </div>
              ))}
              {!journalEntries?.length && (
                <p className="text-sm text-muted-foreground">{t("dashboard.no_entries")}</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">{t("dashboard.recent_exercises")}</h3>
            </div>
            <div className="space-y-3">
              {breathingExercises?.slice(0, 3).map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate("/breathing")}
                >
                  <p className="font-medium text-foreground text-sm">{exercise.exerciseType}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exercise.duration}s • Relaxation: {exercise.relaxationLevel}/5
                  </p>
                </div>
              ))}
              {!breathingExercises?.length && (
                <p className="text-sm text-muted-foreground">{t("dashboard.no_exercises")}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
