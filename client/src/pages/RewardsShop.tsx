import { motion, AnimatePresence } from "framer-motion";
import { Gift, Zap, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRewards, AVATAR_EMOJIS } from "@/contexts/RewardsContext";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

// ─── Avatar Picker Modal ───────────────────────────────────────────────────────
function AvatarPickerModal({ onClose }: { onClose: () => void }) {
  const { profileEmoji, setProfileEmoji } = useRewards();
  const { t } = useLanguage();
  const [selected, setSelected] = useState(profileEmoji);

  const handleSave = () => {
    setProfileEmoji(selected);
    toast.success("✅ Avatar actualizado");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <Card className="p-8 max-w-sm w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">👤 Elige tu avatar</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-6">
            {AVATAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelected(emoji)}
                className={`text-3xl p-3 rounded-xl transition-all ${
                  selected === emoji
                    ? "bg-primary/20 border-2 border-primary scale-110"
                    : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-6 p-3 bg-muted rounded-lg">
            <span className="text-4xl">{selected}</span>
            <p className="text-sm text-muted-foreground">Este será tu avatar en el perfil y dashboard.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">{t("common.cancel")}</Button>
            <Button onClick={handleSave} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white">
              Guardar avatar
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Premium Breathing Modal ───────────────────────────────────────────────────
function PremiumBreathingModal({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();

  const premiumExercises = [
    { name: "Respiración Wim Hof", desc: "Técnica de respiración intensiva para aumentar energía y reducir estrés", duration: "15 min", emoji: "❄️" },
    { name: "Pranayama Nadi Shodhana", desc: "Respiración alternada por fosas nasales para equilibrar cuerpo y mente", duration: "10 min", emoji: "🌬️" },
    { name: "Respiración Coherente", desc: "5 respiraciones por minuto para sincronizar corazón y cerebro", duration: "10 min", emoji: "💙" },
    { name: "Respiración Holográfica", desc: "Técnica profunda de relajación total para momentos de ansiedad", duration: "20 min", emoji: "🌊" },
    { name: "Box Breathing Avanzado", desc: "Versión extendida: 6-6-6-6 para máxima calma", duration: "12 min", emoji: "⬛" },
    { name: "Respiración 4-4-4", desc: "Patrón triangular para claridad mental rápida", duration: "8 min", emoji: "🔺" },
    { name: "Respiración del Guerrero", desc: "Kapalabhati — limpieza energética con respiraciones rápidas", duration: "10 min", emoji: "⚡" },
    { name: "Meditación del Océano", desc: "Ujjayi breath — el sonido del mar para calma profunda", duration: "15 min", emoji: "🌊" },
    { name: "Respiración 7-11", desc: "Exhalar más largo que inhalar activa el sistema nervioso parasimpático", duration: "10 min", emoji: "🌿" },
    { name: "Respiración de Fuego", desc: "Agni Prasana — técnica de Kundalini para vitalidad", duration: "5 min", emoji: "🔥" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="w-full max-w-2xl my-8"
      >
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">🧘 Meditaciones Premium</h2>
              <p className="text-muted-foreground text-sm mt-1">10 técnicas de respiración exclusivas</p>
            </div>
            <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {premiumExercises.map((ex, i) => (
              <div
                key={i}
                onClick={() => { navigate("/breathing"); onClose(); }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800 hover:shadow-md transition cursor-pointer"
              >
                <span className="text-3xl">{ex.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{ex.name}</p>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{ex.duration}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{ex.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={onClose} className="w-full mt-6" variant="outline">Cerrar</Button>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Theme Preview Modal ───────────────────────────────────────────────────────
function ThemePreviewModal({ onClose }: { onClose: () => void }) {
  const applyNocturnalTheme = () => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.setProperty("--primary", "270 80% 60%");
    document.documentElement.style.setProperty("--background", "240 10% 4%");
    localStorage.setItem("theme", "dark");
    localStorage.setItem("premiumTheme", "nocturne");
    toast.success("🌙 Tema Nocturne activado");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
        <Card className="p-8 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">🌙 Tema Nocturne Premium</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <div className="rounded-xl overflow-hidden mb-6 border border-purple-400">
            <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-black p-6 space-y-3">
              <div className="h-4 w-3/4 bg-purple-400/40 rounded" />
              <div className="h-3 w-1/2 bg-indigo-400/30 rounded" />
              <div className="flex gap-2 mt-4">
                <div className="h-16 flex-1 bg-purple-900/60 rounded-lg border border-purple-700/50" />
                <div className="h-16 flex-1 bg-indigo-900/60 rounded-lg border border-indigo-700/50" />
                <div className="h-16 flex-1 bg-violet-900/60 rounded-lg border border-violet-700/50" />
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Un tema oscuro con degradados violeta y añil. Perfecto para usar de noche.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={applyNocturnalTheme} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              Activar tema
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function RewardsShop() {
  const { t } = useLanguage();
  const { hasReward, refetch } = useRewards();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: rewards, isLoading: rewardsLoading } = trpc.rewards.list.useQuery();
  const { data: stats } = trpc.stats.get.useQuery();
  const { data: redeemedRewards } = trpc.rewards.getUserRedeemed.useQuery();
  const redeemMutation = trpc.rewards.redeem.useMutation();
  const initRewardsMutation = trpc.init.rewards.useMutation();

  // Active modals
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPremiumBreathing, setShowPremiumBreathing] = useState(false);
  const [showThemePreview, setShowThemePreview] = useState(false);

  useEffect(() => {
    initRewardsMutation.mutate(undefined, {
      onSuccess: () => utils.rewards.list.invalidate(),
    });
  }, []);

  const isRedeemed = (rewardId: number) =>
    redeemedRewards?.some((r) => r.rewardId === rewardId);

  const handleRedeem = async (rewardId: number, rewardName: string, pointsCost: number, category: string) => {
    const currentPoints = stats?.totalPoints || 0;
    if (currentPoints < pointsCost) {
      toast.error(t("rewards.insufficient_points"));
      return;
    }
    try {
      await redeemMutation.mutateAsync({ rewardId });
      toast.success(`✅ ${rewardName} canjeado!`);
      utils.stats.get.invalidate();
      utils.rewards.getUserRedeemed.invalidate();
      utils.rewards.list.invalidate();
      refetch();

      // Show the reward immediately after purchase
      setTimeout(() => activateReward(rewardId, rewardName, category), 600);
    } catch {
      toast.error(t("rewards.redeem_error"));
    }
  };

  const activateReward = (rewardId: number, rewardName: string, category: string) => {
    if (category === "theme") {
      setShowThemePreview(true);
    } else if (category === "badge") {
      toast.success(`🏅 ¡Medalla "${rewardName}" añadida a tu perfil!`, { duration: 4000 });
      navigate("/profile");
    } else if (rewardName.toLowerCase().includes("boost") || rewardName.toLowerCase().includes("racha")) {
      // Boost streak via API
      utils.client.rewards.activate.mutate({ rewardId }).then(() => {
        utils.streak.get.invalidate();
        toast.success("🔥 ¡+7 días añadidos a tu racha!", { duration: 4000 });
      }).catch(() => {
        // Fallback: just show success, backend already logged it
        toast.success("🔥 ¡Racha boosteada! Recarga para ver el cambio.", { duration: 4000 });
      });
    } else if (rewardName.toLowerCase().includes("meditation") || rewardName.toLowerCase().includes("méditation")) {
      setShowPremiumBreathing(true);
    } else if (category === "feature" && (rewardName.toLowerCase().includes("avatar") || rewardName.toLowerCase().includes("personnalisé"))) {
      setShowAvatarPicker(true);
    } else if (rewardName.toLowerCase().includes("rapport") || rewardName.toLowerCase().includes("reporte")) {
      toast.success("📊 Reporte disponible en la sección Exportar");
      navigate("/export");
    }
  };

  const handleUseReward = (rewardId: number, rewardName: string, category: string) => {
    activateReward(rewardId, rewardName, category);
  };

  return (
    <>
      <AnimatePresence>
        {showAvatarPicker && <AvatarPickerModal onClose={() => setShowAvatarPicker(false)} />}
        {showPremiumBreathing && <PremiumBreathingModal onClose={() => setShowPremiumBreathing(false)} />}
        {showThemePreview && <ThemePreviewModal onClose={() => setShowThemePreview(false)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div className="mb-8 md:mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-6 md:w-8 h-6 md:h-8 text-purple-500" />
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                {t("rewards.shop_title")}
              </h1>
            </div>
            <p className="text-muted-foreground text-base md:text-lg">
              {t("rewards.shop_description")}
            </p>
          </motion.div>

          {/* Points Display */}
          <motion.div
            className="mb-8 p-4 md:p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm md:text-base">{t("rewards.your_points")}</p>
                <p className="text-2xl md:text-4xl font-bold text-foreground mt-2">
                  {stats?.totalPoints || 0} <span className="text-lg md:text-2xl">⭐</span>
                </p>
              </div>
              <Zap className="w-12 md:w-16 h-12 md:h-16 text-yellow-500 opacity-50" />
            </div>
          </motion.div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {rewardsLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground mt-4">{t("common.loading")}</p>
              </div>
            ) : rewards && rewards.length > 0 ? (
              rewards.map((reward, index) => {
                const redeemed = isRedeemed(reward.id);
                const canAfford = (stats?.totalPoints || 0) >= reward.pointsCost;
                const isBoost = reward.name.toLowerCase().includes("boost") || reward.name.toLowerCase().includes("racha");

                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card className={`p-4 md:p-6 h-full flex flex-col transition-all hover:shadow-lg border-2 ${
                      redeemed
                        ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
                        : "border-border"
                    }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <div className="text-3xl md:text-4xl flex-shrink-0">{reward.icon}</div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-base md:text-lg text-foreground truncate">{reward.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground capitalize">{reward.category}</p>
                          </div>
                        </div>
                        {redeemed && <CheckCircle2 className="w-5 md:w-6 h-5 md:h-6 text-green-500 flex-shrink-0 mt-1" />}
                      </div>

                      {/* Description */}
                      {reward.description && (
                        <p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-3">{reward.description}</p>
                      )}

                      {/* Cost */}
                      <div className="mb-4 p-2 md:p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-xs md:text-sm font-semibold text-purple-700 dark:text-purple-300">
                          💎 {reward.pointsCost} {t("common.points")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto space-y-2">
                        {redeemed ? (
                          <>
                            <Button size="sm" disabled className="w-full bg-green-500 text-white text-xs md:text-sm">
                              ✓ {t("rewards.already_redeemed")}
                            </Button>
                            {/* "Use again" button for redeemed rewards */}
                            <Button
                              size="sm" variant="outline"
                              onClick={() => handleUseReward(reward.id, reward.name, reward.category || "other")}
                              className="w-full text-xs md:text-sm border-green-400 text-green-700 hover:bg-green-50"
                            >
                              {isBoost ? "🔥 Aplicar boost de nuevo" : "✨ Usar recompensa"}
                            </Button>
                          </>
                        ) : canAfford ? (
                          <Button
                            size="sm"
                            onClick={() => handleRedeem(reward.id, reward.name, reward.pointsCost, reward.category || "other")}
                            disabled={redeemMutation.isPending}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs md:text-sm hover:shadow-lg"
                          >
                            {redeemMutation.isPending ? "..." : t("rewards.redeem_button")}
                          </Button>
                        ) : (
                          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                              <p className="text-xs md:text-sm text-red-700 dark:text-red-300">
                                {t("rewards.insufficient_points")} — te faltan {reward.pointsCost - (stats?.totalPoints || 0)} pts
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <Card className="col-span-full p-8 md:p-12 text-center">
                <p className="text-muted-foreground text-base md:text-lg">{t("rewards.no_rewards")}</p>
              </Card>
            )}
          </div>

          {/* Info Card */}
          <motion.div
            className="mt-8 md:mt-12 p-4 md:p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold text-foreground mb-2 text-base md:text-lg">
              💡 {t("rewards.how_it_works")}
            </h3>
            <ul className="text-muted-foreground space-y-1 md:space-y-2 text-xs md:text-sm">
              <li>• {t("rewards.tip_1")}</li>
              <li>• {t("rewards.tip_2")}</li>
              <li>• {t("rewards.tip_3")}</li>
              <li>• {t("rewards.tip_4")}</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </>
  );
}
