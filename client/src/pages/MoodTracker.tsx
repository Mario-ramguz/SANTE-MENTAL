import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MoodTracker() {
  const { t } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);

  const utils = trpc.useUtils();
  const createMoodMutation = trpc.mood.create.useMutation();

  const moods = [
    { value: 1, emoji: "😢", label: t("mood.very_sad"), color: "from-red-500/20 to-red-600/20" },
    { value: 2, emoji: "😕", label: t("mood.sad"), color: "from-orange-500/20 to-orange-600/20" },
    { value: 3, emoji: "😐", label: t("mood.neutral"), color: "from-yellow-500/20 to-yellow-600/20" },
    { value: 4, emoji: "🙂", label: t("mood.happy"), color: "from-green-500/20 to-green-600/20" },
    { value: 5, emoji: "😄", label: t("mood.very_happy"), color: "from-blue-500/20 to-blue-600/20" },
  ];

  const emotions = [
    t("mood.emotion_happy"), t("mood.emotion_sad"), t("mood.emotion_anxious"),
    t("mood.emotion_calm"), t("mood.emotion_energetic"), t("mood.emotion_tired"),
    t("mood.emotion_frustrated"), t("mood.emotion_motivated"),
    t("mood.emotion_lonely"), t("mood.emotion_connected"),
  ];

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const handleSubmit = async () => {
    if (selectedMood === null) {
      toast.error(t("mood.select_error"));
      return;
    }
    try {
      const result = await createMoodMutation.mutateAsync({
        mood: selectedMood,
        emotionTags: selectedEmotions,
        notes,
        energyLevel,
        stressLevel,
      });
      utils.mood.list.invalidate();
      utils.stats.get.invalidate();
      utils.streak.get.invalidate();
      toast.success(t("mood.saved"));
      setSelectedMood(null);
      setSelectedEmotions([]);
      setNotes("");
      setEnergyLevel(3);
      setStressLevel(3);
    } catch {
      toast.error(t("mood.error"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
          <Heart className="w-8 h-8 text-primary" />
          {t("mood.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("mood.description")}</p>
      </div>

      <Card className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">{t("mood.select")}</h2>
        <div className="grid grid-cols-5 gap-4">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                selectedMood === mood.value
                  ? "border-primary bg-gradient-to-br " + mood.color + " shadow-lg"
                  : "border-border bg-gradient-to-br " + mood.color + " hover:border-primary/50"
              }`}
            >
              <div className="text-4xl mb-2">{mood.emoji}</div>
              <p className="text-sm font-medium text-foreground">{mood.label}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">{t("mood.emotions_felt")}</h2>
        <div className="flex flex-wrap gap-3">
          {emotions.map((emotion) => (
            <button
              key={emotion}
              onClick={() => toggleEmotion(emotion)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedEmotions.includes(emotion)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">{t("mood.energy")}</h3>
          <div className="space-y-4">
            <input
              type="range" min="1" max="5" value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("mood.energy_low")}</span>
              <span className="font-bold text-foreground">{energyLevel}/5</span>
              <span>{t("mood.energy_high")}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">{t("mood.stress")}</h3>
          <div className="space-y-4">
            <input
              type="range" min="1" max="5" value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("mood.stress_low")}</span>
              <span className="font-bold text-foreground">{stressLevel}/5</span>
              <span>{t("mood.stress_high")}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8">
        <h2 className="text-lg font-bold text-foreground mb-4">{t("mood.notes")}</h2>
        <Textarea
          placeholder={t("mood.notes_placeholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-32"
        />
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={createMoodMutation.isPending || selectedMood === null}
        className="w-full h-12 text-lg"
      >
        {createMoodMutation.isPending ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t("mood.saving")}</>
        ) : t("mood.save")}
      </Button>
    </div>
  );
}
