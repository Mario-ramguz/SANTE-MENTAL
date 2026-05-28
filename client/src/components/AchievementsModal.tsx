import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Achievement {
  id: number;
  badgeType: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  unlockedAt: Date;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  newAchievementId?: number;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  newAchievementId,
}) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">{t('achievements.title')}</h2>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {achievements.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {t('achievements.no_unlocked')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {achievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      icon={achievement.icon || '🏆'}
                      name={achievement.name}
                      description={achievement.description || undefined}
                      isNew={achievement.id === newAchievementId}
                    />
                  ))}
                </div>
              )}

              {/* Info de hitos */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="font-bold text-lg mb-4">{t('achievements.milestones')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { days: 7, nameKey: 'achievements.milestone_7', icon: '🥇' },
                    { days: 30, nameKey: 'achievements.milestone_30', icon: '🏆' },
                    { days: 100, nameKey: 'achievements.milestone_100', icon: '💯' },
                    { days: 365, nameKey: 'achievements.milestone_365', icon: '👑' },
                  ].map((milestone) => (
                    <div
                      key={milestone.days}
                      className="bg-muted p-4 rounded-lg flex items-center gap-3"
                    >
                      <span className="text-3xl">{milestone.icon}</span>
                      <div>
                        <p className="font-semibold">{t(milestone.nameKey)}</p>
                        <p className="text-sm text-muted-foreground">
                          {milestone.days} {t('achievements.days_of_streak')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
