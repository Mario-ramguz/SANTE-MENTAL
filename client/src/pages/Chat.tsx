import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Send, Loader2, Trash2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Chat() {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: history, isLoading: historyLoading, refetch } = trpc.chat.history.useQuery();
  const sendMutation = trpc.chat.send.useMutation();
  const deleteAllMutation = trpc.conversations.deleteAll.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMessage = message;
    setMessage("");
    try {
      await sendMutation.mutateAsync({ message: userMessage });
      refetch();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllMutation.mutateAsync();
      refetch();
      setShowDeleteConfirm(false);
      toast.success(t("chat.cleared"));
    } catch {
      toast.error(t("chat.error_clear"));
    }
  };

  return (
    <div className="space-y-6 h-screen flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-primary" />
            {t("chat.title")}
          </h1>
          <p className="text-muted-foreground mt-2">{t("chat.description")}</p>
        </div>

        {history && history.length > 0 && (
          <div className="relative">
            <Button
              variant="outline" size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />{t("chat.clear")}
            </Button>

            {showDeleteConfirm && (
              <Card className="absolute right-0 top-12 p-4 border-red-200 bg-red-50 dark:bg-red-950 z-50 w-64">
                <p className="text-foreground font-semibold mb-4">{t("chat.confirm_clear")}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                    {t("common.cancel")}
                  </Button>
                  <Button
                    size="sm" onClick={handleDeleteAll}
                    disabled={deleteAllMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteAllMutation.isPending ? t("chat.clearing") : t("chat.clear")}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      <Card className="flex-1 p-6 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {historyLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : history && history.length > 0 ? (
            history.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-center">{t("chat.greeting")}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder={t("chat.placeholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            disabled={sendMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={sendMutation.isPending || !message.trim()}
            size="icon"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
