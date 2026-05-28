import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function MoodChart() {
  const { data: moodEntries } = trpc.mood.list.useQuery();

  if (!moodEntries || moodEntries.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          Commencez à enregistrer votre humeur pour voir vos progrès
        </p>
      </Card>
    );
  }

  // Preparar datos para el gráfico (últimos 7 días)
  const last7Days = moodEntries.slice(0, 7).reverse();
  const chartData = last7Days.map((entry) => ({
    date: new Date(entry.createdAt).toLocaleDateString("fr-FR", { month: "short", day: "numeric" }),
    mood: entry.mood,
    energy: entry.energyLevel || 3,
    stress: entry.stressLevel || 3,
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Évolution de votre humeur</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" domain={[1, 5]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ fill: "var(--chart-1)", r: 5 }}
              activeDot={{ r: 7 }}
              name="Humeur"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Énergie et Stress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" domain={[1, 5]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="energy" fill="var(--chart-3)" name="Énergie" />
            <Bar dataKey="stress" fill="var(--chart-4)" name="Stress" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
