import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Globe, LogOut, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [showNameConfirm, setShowNameConfirm] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation();
  const updateNameMutation = trpc.auth.updateName.useMutation();

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    toast.success(newTheme === "light" ? t("settings.theme_light") : t("settings.theme_dark"));
  };

  const handleLanguageChange = (lang: "fr" | "es" | "en") => {
    setLanguage(lang);
    const messages: Record<string, string> = {
      fr: "Langue changée en français",
      es: "Idioma cambiado a español",
      en: "Language changed to English",
    };
    toast.success(messages[lang]);
  };

  const handleNameChange = async () => {
    if (!newName.trim()) {
      toast.error(t("settings.name_error_empty"));
      return;
    }
    try {
      await updateNameMutation.mutateAsync({ name: newName });
      toast.success(t("settings.name_updated"));
      setIsEditingName(false);
      setShowNameConfirm(false);
    } catch {
      toast.error(t("settings.name_update_error"));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      toast.success(t("settings.logout_success"));
    } catch {
      toast.error(t("settings.logout_error"));
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary" />
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("settings.manage")}</p>
      </div>

      {/* Tema */}
      <Card className="p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            {theme === "light" ? <Sun className="w-6 h-6 text-primary" /> : <Moon className="w-6 h-6 text-primary" />}
            {t("settings.theme")}
          </h2>
          <p className="text-muted-foreground mb-4">{t("settings.select_theme")}</p>
          <div className="flex gap-4">
            <Button
              onClick={() => handleThemeChange("light")}
              variant={theme === "light" ? "default" : "outline"}
              className={theme === "light" ? "bg-green-200 hover:bg-green-300 text-black" : ""}
            >
              <Sun className="w-4 h-4 mr-2" />{t("settings.theme_light")}
            </Button>
            <Button
              onClick={() => handleThemeChange("dark")}
              variant={theme === "dark" ? "default" : "outline"}
              className={theme === "dark" ? "bg-cyan-200 hover:bg-cyan-300 text-black" : ""}
            >
              <Moon className="w-4 h-4 mr-2" />{t("settings.theme_dark")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Idioma */}
      <Card className="p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            {t("settings.language")}
          </h2>
          <p className="text-muted-foreground mb-4">{t("settings.select_language")}</p>
          <div className="flex gap-4">
            <Button
              onClick={() => handleLanguageChange("fr")}
              variant={language === "fr" ? "default" : "outline"}
              className={language === "fr" ? "bg-green-200 hover:bg-green-300 text-black" : ""}
            >
              Français
            </Button>
            <Button
              onClick={() => handleLanguageChange("es")}
              variant={language === "es" ? "default" : "outline"}
              className={language === "es" ? "bg-cyan-200 hover:bg-cyan-300 text-black" : ""}
            >
              Español
            </Button>
            <Button
              onClick={() => handleLanguageChange("en")}
              variant={language === "en" ? "default" : "outline"}
              className={language === "en" ? "bg-purple-200 hover:bg-purple-300 text-black" : ""}
            >
              English
            </Button>
          </div>
        </div>
      </Card>

      {/* Cuenta */}
      <Card className="p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">{t("settings.account")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("settings.user")}</label>
              {isEditingName ? (
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("settings.user")} />
              ) : (
                <div className="p-3 bg-muted rounded-md text-foreground">{user?.name || user?.email || "Usuario"}</div>
              )}
            </div>

            {!isEditingName && (
              <Button onClick={() => setIsEditingName(true)} className="gap-2 bg-cyan-200 hover:bg-cyan-300 text-black">
                {t("settings.change_name")}
              </Button>
            )}

            {isEditingName && (
              <div className="flex gap-2">
                <Button onClick={() => setShowNameConfirm(true)} className="flex-1 bg-cyan-200 hover:bg-cyan-300 text-black">
                  {t("settings.confirm")}
                </Button>
                <Button variant="outline" onClick={() => { setIsEditingName(false); setNewName(user?.name || ""); }} className="flex-1">
                  {t("settings.cancel")}
                </Button>
              </div>
            )}

            {showNameConfirm && (
              <Card className="p-4 border-cyan-200 bg-cyan-50 dark:bg-cyan-950">
                <p className="text-foreground font-semibold mb-4">{t("settings.confirm_name")}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowNameConfirm(false)} className="flex-1">
                    {t("settings.cancel")}
                  </Button>
                  <Button
                    onClick={handleNameChange}
                    disabled={updateNameMutation.isPending}
                    className="flex-1 bg-cyan-200 hover:bg-cyan-300 text-black"
                  >
                    {updateNameMutation.isPending ? "..." : t("settings.confirm")}
                  </Button>
                </div>
              </Card>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="p-3 bg-muted rounded-md text-foreground">{user?.email || "—"}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <LogOut className="w-6 h-6 text-destructive" />
          {t("settings.logout")}
        </h2>
        <p className="text-muted-foreground mb-4">{t("settings.logout_desc")}</p>
        <Button variant="destructive" onClick={handleLogout} disabled={logoutMutation.isPending} className="gap-2">
          <LogOut className="w-4 h-4" />
          {logoutMutation.isPending ? t("settings.disconnecting") : t("settings.disconnect")}
        </Button>
      </Card>
    </div>
  );
}
