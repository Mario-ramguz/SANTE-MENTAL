import { motion } from 'framer-motion';
import { Trophy, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Leaderboard() {
  const { t } = useLanguage();
  const { data: leaderboard, isLoading } = trpc.leaderboard.global.useQuery();

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '⭐';
    }
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            <Trophy className="w-6 md:w-8 h-6 md:h-8 text-yellow-500" />
            <h1 className="text-2xl md:text-4xl font-bold text-foreground text-center">
              {t("leaderboard.title")}
            </h1>
            <Trophy className="w-6 md:w-8 h-6 md:h-8 text-yellow-500" />
          </div>
          <p className="text-muted-foreground text-base md:text-lg text-center">
            {t("leaderboard.description")}
          </p>
        </motion.div>

        {/* Leaderboard */}
        <div className="space-y-3 md:space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground mt-4">{t("common.loading")}</p>
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`p-3 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 border-2 transition-all hover:shadow-lg ${
                    index === 0
                      ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20'
                      : index === 1
                      ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20'
                      : index === 2
                      ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20'
                      : 'border-border'
                  }`}
                >
                  {/* Rank Circle */}
                  <motion.div
                    className={`flex-shrink-0 w-12 md:w-16 h-12 md:h-16 rounded-full bg-gradient-to-br ${getMedalColor(
                      index + 1
                    )} flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg`}
                    animate={index < 3 ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getMedalIcon(index + 1)}
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg md:text-2xl font-bold text-foreground">
                        #{index + 1}
                      </span>
                      <h3 className="text-base md:text-xl font-semibold text-foreground truncate">
                        {user.name || t("leaderboard.anonymous_user")}
                      </h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Streak */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 md:gap-2 justify-end mb-1">
                      <Flame className="w-4 md:w-5 h-4 md:h-5 text-orange-500" />
                      <span className="text-xl md:text-3xl font-bold text-orange-500">
                        {user.currentStreak || 0}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t("dashboard.days")}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-8 md:p-12 text-center">
              <p className="text-muted-foreground text-base md:text-lg">
                {t("leaderboard.no_users")}
              </p>
            </Card>
          )}
        </div>

        {/* Info Card */}
        <motion.div
          className="mt-8 md:mt-12 p-4 md:p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-foreground mb-2 text-base md:text-lg">
            💡 {t("leaderboard.tip_title")}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm">
            {t("leaderboard.tip_description")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
