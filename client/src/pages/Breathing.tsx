import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Wind, Play, Loader2, X, Pause, Check } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Exercise {
  nameKey: string;
  descKey: string;
  duration: number;
  type: string;
  cycles: Array<{ phase: string; duration: number }>;
}

const exerciseData: Exercise[] = [
  {
    nameKey: "breathing.box", descKey: "breathing.box_desc",
    duration: 240, type: "box_breathing",
    cycles: [
      { phase: "inhale", duration: 4 }, { phase: "hold", duration: 4 },
      { phase: "exhale", duration: 4 }, { phase: "hold", duration: 4 },
    ],
  },
  {
    nameKey: "breathing.4_7_8", descKey: "breathing.4_7_8_desc",
    duration: 180, type: "4_7_8",
    cycles: [
      { phase: "inhale", duration: 4 }, { phase: "hold", duration: 7 },
      { phase: "exhale", duration: 8 },
    ],
  },
  {
    nameKey: "breathing.deep", descKey: "breathing.deep_desc",
    duration: 300, type: "deep_breathing",
    cycles: [
      { phase: "inhale", duration: 5 }, { phase: "hold", duration: 3 },
      { phase: "exhale", duration: 6 },
    ],
  },
  {
    nameKey: "breathing.meditation", descKey: "breathing.meditation_desc",
    duration: 600, type: "guided_meditation",
    cycles: [
      { phase: "inhale", duration: 3 }, { phase: "hold", duration: 2 },
      { phase: "exhale", duration: 3 },
    ],
  },
];

export default function Breathing() {
  const { t } = useLanguage();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [relaxationLevel, setRelaxationLevel] = useState(3);
  const [phase, setPhase] = useState("inhale");

  const createMutation = trpc.breathing.create.useMutation();

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0 || !selectedExercise) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setIsPlaying(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, selectedExercise]);

  useEffect(() => {
    if (!selectedExercise || timeLeft <= 0 || !hasStarted) return;
    const cycles = selectedExercise.cycles;
    const totalCycleDuration = cycles.reduce((sum, c) => sum + c.duration, 0);
    const elapsedTime = selectedExercise.duration - timeLeft;
    const positionInCycle = elapsedTime % totalCycleDuration;
    let currentTime = 0;
    for (let i = 0; i < cycles.length; i++) {
      if (positionInCycle < currentTime + cycles[i].duration) {
        setPhase(cycles[i].phase);
        break;
      }
      currentTime += cycles[i].duration;
    }
  }, [timeLeft, selectedExercise, hasStarted]);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setHasStarted(false);
    setTimeLeft(0);
    setIsPlaying(false);
    setPhase(exercise.cycles[0].phase);
  };

  const handleStartExercise = () => {
    if (!selectedExercise) return;
    setHasStarted(true);
    setTimeLeft(selectedExercise.duration);
    setIsPlaying(true);
  };

  const handleCancel = () => {
    setSelectedExercise(null);
    setHasStarted(false);
    setTimeLeft(0);
    setIsPlaying(false);
    setRelaxationLevel(3);
  };

  const handleComplete = async () => {
    if (!selectedExercise) return;
    try {
      await createMutation.mutateAsync({
        exerciseType: selectedExercise.type,
        duration: selectedExercise.duration,
        relaxationLevel,
      });
      toast.success(t("breathing.saved"));
      handleCancel();
    } catch {
      toast.error(t("breathing.error"));
    }
  };

  const phaseLabels: Record<string, string> = {
    inhale: t("breathing.inhale"),
    hold: t("breathing.hold"),
    exhale: t("breathing.exhale"),
  };

  if (!selectedExercise) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
            <Wind className="w-8 h-8 text-primary" />
            {t("breathing.title")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("breathing.description")}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {exerciseData.map((exercise) => (
            <Card
              key={exercise.type}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSelectExercise(exercise)}
            >
              <h3 className="text-xl font-bold text-foreground mb-2">{t(exercise.nameKey)}</h3>
              <p className="text-muted-foreground text-sm mb-4">{t(exercise.descKey)}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {Math.floor(exercise.duration / 60)} {t("breathing.minutes")}
                </span>
                <Button className="gap-2 bg-green-200 hover:bg-green-300 text-foreground">
                  <Play className="w-4 h-4" />
                  {t("breathing.select_button")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <Card className="p-12 text-center space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-4">{t(selectedExercise.nameKey)}</h2>
          <p className="text-muted-foreground mb-6">{t(selectedExercise.descKey)}</p>
          <p className="text-lg font-semibold text-foreground">
            {t("breathing.duration")}: {Math.floor(selectedExercise.duration / 60)} {t("breathing.minutes")}
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={handleCancel} className="gap-2">
            <X className="w-4 h-4" />{t("breathing.cancel")}
          </Button>
          <Button onClick={handleStartExercise} className="gap-2 bg-cyan-200 hover:bg-cyan-300 text-foreground">
            <Play className="w-4 h-4" />{t("breathing.start")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-12 text-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-8">{t(selectedExercise.nameKey)}</h2>
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-4 border-primary/20 transition-all duration-1000 ${
                phase === "inhale" ? "scale-100" : phase === "exhale" ? "scale-75" : "scale-90"
              }`}
            />
            <div className="relative z-10 text-center">
              <p className="text-2xl font-bold text-primary mb-2">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {phaseLabels[phase] || t("breathing.breathe")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-lg font-semibold text-foreground mb-4 block">
            {t("breathing.relaxation")}
          </label>
          <input
            type="range" min="1" max="5" value={relaxationLevel}
            onChange={(e) => setRelaxationLevel(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{t("breathing.very_stressed")}</span>
            <span className="font-bold text-foreground">{relaxationLevel}/5</span>
            <span>{t("breathing.very_relaxed")}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button variant="outline" onClick={handleCancel} className="gap-2">
            <X className="w-4 h-4" />{t("breathing.cancel")}
          </Button>
          <Button onClick={() => setIsPlaying(!isPlaying)} variant="secondary" className="gap-2">
            {isPlaying ? (
              <><Pause className="w-4 h-4" />{t("breathing.pause")}</>
            ) : (
              <><Play className="w-4 h-4" />{t("breathing.resume")}</>
            )}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={createMutation.isPending}
            className="gap-2 bg-green-200 hover:bg-green-300 text-foreground"
          >
            {createMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("breathing.completing")}</>
            ) : (
              <><Check className="w-4 h-4" />{t("breathing.complete")}</>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
