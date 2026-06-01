import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy } from "lucide-react";
import { AchievementsModal } from "./AchievementsModal";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export function StreakCard() {
  const { language: lang, t } = useLanguage();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const { data: streak } = trpc.streak.get.useQuery();
  const updateStreakMutation = trpc.streak.update.useMutation({
    onSuccess: (data: any) => {
      if (data?.newAchievement) {
        const messages: { [key: string]: string } = {
          'fr': `Félicitations! Vous avez déverrouillé: ${data.newAchievement.name}`,
          'es': `¡Felicidades! Desbloqueaste: ${data.newAchievement.name}`,
          'en': `Congratulations! You unlocked: ${data.newAchievement.name}`,
        };
        const currentLang = lang || localStorage.getItem('language') || 'fr';
        toast.success(messages[currentLang] || messages['fr'], {
          description: data.newAchievement.desc,
          icon: data.newAchievement.icon,
          duration: 5000,
        });
      }
    },
  });
  const { data: moodEntries } = trpc.mood.list.useQuery();
  const { data: achievements } = trpc.streak.achievements.useQuery();

  useEffect(() => {
    if (streak) {
      setCurrentStreak(streak.currentStreak || 0);
    }
  }, [streak]);

  // Update streak when there's a new mood entry from today
  useEffect(() => {
    if (moodEntries && moodEntries.length > 0) {
      const today = new Date().toDateString();
      const todayMood = moodEntries[0];
      const moodDate = new Date(todayMood.createdAt).toDateString();

      if (moodDate === today) {
        // Update streak in database
        updateStreakMutation.mutate();
      }
    }
  }, [moodEntries]);

  return (
    <>
      <Card 
        className="p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 min-w-fit cursor-pointer hover:shadow-lg transition" 
        onClick={() => setShowAchievements(true)}
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl font-bold text-orange-500 animate-bounce">
            {currentStreak > 0 ? "🔥" : "❄️"}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('dashboard.streak')}</p>
            <p className="text-2xl font-bold text-orange-500">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.days')}</p>
          </div>
          {achievements && achievements.length > 0 && (
            <div className="ml-4 flex items-center gap-2 pl-4 border-l border-orange-500/30">
              <Trophy size={20} className="text-yellow-500" />
              <span className="text-sm font-bold text-yellow-600">{achievements.length}</span>
            </div>
          )}
        </div>
      </Card>
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={achievements || []}
      />
    </>
  );
}
