import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BookOpen, Plus, Trash2, Loader2, Star, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Journal() {
  const { t, language } = useLanguage();
  const { data: entries = [], isLoading, refetch } = trpc.journal.list.useQuery();
  const [selectedEntry, setSelectedEntry] = useState<(typeof entries)[0] | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(3);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const createMutation = trpc.journal.create.useMutation();
  const updateMutation = trpc.journal.update.useMutation();
  const deleteMutation = trpc.journal.delete.useMutation();

  const dateLocale = language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US";

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error(t("journal.error_required"));
      return;
    }
    try {
      await createMutation.mutateAsync({ title, content, tags: [] });
      toast.success(t("journal.created"));
      setTitle(""); setContent(""); setRating(3); setIsCreating(false);
      refetch();
    } catch {
      toast.error(t("journal.error_create"));
    }
  };

  const handleEdit = async () => {
    if (!selectedEntry || !title.trim() || !content.trim()) {
      toast.error(t("journal.error_required"));
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: selectedEntry.id, title, content, tags: [] });
      toast.success(t("journal.updated"));
      setIsEditing(false); setShowEditConfirm(false);
      refetch();
      setSelectedEntry({ ...selectedEntry, title, content });
    } catch {
      toast.error(t("journal.error_update"));
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    try {
      await deleteMutation.mutateAsync({ id: selectedEntry.id });
      toast.success(t("journal.deleted"));
      setSelectedEntry(null); setShowDeleteConfirm(false);
      refetch();
    } catch {
      toast.error(t("journal.error_delete"));
    }
  };

  const startEdit = () => {
    if (selectedEntry) {
      setTitle(selectedEntry.title);
      setContent(selectedEntry.content);
      setIsEditing(true);
    }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onChange(star)} className="transition-all hover:scale-110">
          <Star className={`w-6 h-6 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          {t("journal.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("journal.description")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Button
            onClick={() => { setIsCreating(!isCreating); setIsEditing(false); setTitle(""); setContent(""); setRating(3); }}
            className="w-full gap-2 bg-green-200 hover:bg-green-300 text-foreground"
          >
            <Plus className="w-4 h-4" />{t("journal.new_entry")}
          </Button>

          {(isCreating || isEditing) && (
            <Card className="p-6 mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("journal.title_input")}</label>
                <Input placeholder={t("journal.title_placeholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("journal.content_input")}</label>
                <Textarea placeholder={t("journal.content_placeholder")} value={content} onChange={(e) => setContent(e.target.value)} className="min-h-32" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("journal.rating")}</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => { if (isEditing) { setShowEditConfirm(true); } else { handleCreate(); } }}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-cyan-200 hover:bg-cyan-300 text-foreground"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t("journal.saving")
                    : isEditing ? t("journal.update") : t("journal.save")}
                </Button>
                <Button variant="outline" onClick={() => { setIsCreating(false); setIsEditing(false); }} className="flex-1">
                  {t("journal.cancel")}
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-2 mt-4">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => { setSelectedEntry(entry); setIsEditing(false); setIsCreating(false); }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedEntry?.id === entry.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                }`}
              >
                <div className="font-medium truncate">{entry.title}</div>
                <div className="text-xs opacity-75">{new Date(entry.createdAt).toLocaleDateString(dateLocale)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedEntry && !isEditing ? (
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{selectedEntry.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedEntry.createdAt).toLocaleDateString(dateLocale, {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={startEdit} className="gap-2 bg-cyan-200 hover:bg-cyan-300 text-foreground">
                  <Edit2 className="w-4 h-4" />{t("journal.edit")}
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="gap-2">
                  <Trash2 className="w-4 h-4" />{t("journal.delete")}
                </Button>
              </div>

              {showDeleteConfirm && (
                <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950">
                  <p className="text-foreground font-semibold mb-4">{t("journal.confirm_delete")}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                      {t("journal.cancel")}
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1">
                      {deleteMutation.isPending ? t("journal.deleting") : t("common.confirm")}
                    </Button>
                  </div>
                </Card>
              )}
            </Card>
          ) : (
            <Card className="p-12 flex items-center justify-center min-h-96">
              <p className="text-muted-foreground text-center">{t("journal.select")}</p>
            </Card>
          )}

          {showEditConfirm && (
            <Card className="p-4 border-cyan-200 bg-cyan-50 dark:bg-cyan-950 mt-4">
              <p className="text-foreground font-semibold mb-4">{t("journal.confirm_edit")}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEditConfirm(false)} className="flex-1">
                  {t("journal.cancel")}
                </Button>
                <Button onClick={handleEdit} disabled={updateMutation.isPending} className="flex-1 bg-cyan-200 hover:bg-cyan-300 text-foreground">
                  {updateMutation.isPending ? t("journal.updating") : t("common.confirm")}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
