import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Loader2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Progress() {
  const { t, language } = useLanguage();
  const { data: moodEntries, isLoading } = trpc.mood.list.useQuery(undefined, { retry: false });

  const dateLocale = language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const chartData = moodEntries
    ?.slice().reverse()
    .map((entry) => ({
      date: new Date(entry.createdAt).toLocaleDateString(dateLocale, { month: "short", day: "numeric" }),
      mood: entry.mood,
      energy: entry.energyLevel || 0,
      stress: entry.stressLevel || 0,
    })) || [];

  const avgMood = moodEntries?.length
    ? (moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length).toFixed(1)
    : 0;

  const avgEnergy = moodEntries?.length
    ? (moodEntries.reduce((sum, e) => sum + (e.energyLevel || 0), 0) / moodEntries.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          {t("progress.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("progress.description")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">{t("progress.avg_mood")}</p>
          <p className="text-4xl font-bold text-primary mt-2">{avgMood}/5</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">{t("progress.avg_energy")}</p>
          <p className="text-4xl font-bold text-accent mt-2">{avgEnergy}/5</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">{t("progress.entries")}</p>
          <p className="text-4xl font-bold text-secondary mt-2">{moodEntries?.length || 0}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">{t("progress.trend")}</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" domain={[0, 5]} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="var(--chart-1)" strokeWidth={2} name={t("progress.mood_label")} />
              <Line type="monotone" dataKey="energy" stroke="var(--chart-2)" strokeWidth={2} name={t("progress.energy_label")} />
              <Line type="monotone" dataKey="stress" stroke="var(--chart-3)" strokeWidth={2} name={t("progress.stress_label")} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-12">{t("progress.no_data")}</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">{t("progress.comparison")}</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" domain={[0, 5]} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
              <Legend />
              <Bar dataKey="mood" fill="var(--chart-1)" name={t("progress.mood_label")} />
              <Bar dataKey="energy" fill="var(--chart-2)" name={t("progress.energy_label")} />
              <Bar dataKey="stress" fill="var(--chart-3)" name={t("progress.stress_label")} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-12">{t("progress.no_data_short")}</p>
        )}
      </Card>
    </div>
  );
}
