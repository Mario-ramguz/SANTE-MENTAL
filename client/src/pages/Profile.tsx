import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { User, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRewards } from "@/contexts/RewardsContext";

export default function Profile() {
  const { t } = useLanguage();
  const { profileEmoji, hasReward } = useRewards();
  const { user, logout } = useAuth();
  const { data: preferences, isLoading } = trpc.preferences.get.useQuery();
  const updateMutation = trpc.preferences.update.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const [bio, setBio] = useState(preferences?.bio || "");
  const [moodReminderTime, setMoodReminderTime] = useState(preferences?.moodReminderTime || "09:00");
  const [journalReminderTime, setJournalReminderTime] = useState(preferences?.journalReminderTime || "20:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences?.notificationsEnabled === 1);

  const handleSavePreferences = async () => {
    try {
      await updateMutation.mutateAsync({ bio, moodReminderTime, journalReminderTime, notificationsEnabled: notificationsEnabled ? 1 : 0 });
      toast.success(t("profile.saved"));
    } catch {
      toast.error(t("profile.error"));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      toast.success(t("profile.logout_success"));
    } catch {
      toast.error(t("profile.logout_error"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          {t("profile.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("profile.description")}</p>
      </div>

      {/* Avatar display */}
      <div className="flex items-center gap-4">
        <div className="text-7xl">{profileEmoji}</div>
        <div>
          <p className="font-bold text-2xl text-foreground">{user?.name || user?.email}</p>
          {hasReward("badge") && (
            <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold border border-yellow-300">
              🏅 Medalla Especial
            </span>
          )}
        </div>
      </div>

      <Card className="p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">{t("profile.personal_info")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("profile.name")}</label>
              <Input value={user?.name || ""} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("profile.email")}</label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("profile.bio")}</label>
              <Textarea placeholder={t("profile.bio_placeholder")} value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-24" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 space-y-6">
        <h2 className="text-2xl font-bold text-foreground">{t("profile.reminders")}</h2>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{t("profile.mood_reminder")}</label>
          <Input type="time" value={moodReminderTime} onChange={(e) => setMoodReminderTime(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{t("profile.journal_reminder")}</label>
          <Input type="time" value={journalReminderTime} onChange={(e) => setJournalReminderTime(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox" id="notifications"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="notifications" className="text-sm font-medium text-foreground">
            {t("profile.notifications")}
          </label>
        </div>
        <Button onClick={handleSavePreferences} disabled={updateMutation.isPending} className="w-full">
          {updateMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("profile.saving")}</>
          ) : t("profile.save")}
        </Button>
      </Card>

      <Card className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t("profile.logout")}</h2>
        <p className="text-muted-foreground mb-4">{t("profile.logout_desc")}</p>
        <Button variant="destructive" onClick={handleLogout} disabled={logoutMutation.isPending} className="gap-2">
          <LogOut className="w-4 h-4" />
          {logoutMutation.isPending ? t("profile.disconnecting") : t("profile.disconnect")}
        </Button>
      </Card>
    </div>
  );
}
