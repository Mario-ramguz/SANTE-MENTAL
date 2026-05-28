import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface RedeemedReward {
  rewardId: number;
  category: string;
}

interface RewardsContextType {
  redeemedRewards: RedeemedReward[];
  hasReward: (category: string) => boolean;
  refetch: () => void;
  profileEmoji: string;
  setProfileEmoji: (emoji: string) => void;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

const AVATAR_EMOJIS = ["🧘", "🌟", "🦋", "🌸", "🔥", "💫", "🌈", "🦁", "🐺", "🦊"];

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const { data: redeemedData, refetch } = trpc.rewards.getUserRedeemed.useQuery();
  const { data: rewardsList } = trpc.rewards.list.useQuery();
  const [profileEmoji, setProfileEmojiState] = useState<string>(() => {
    return localStorage.getItem("profileEmoji") || "🧘";
  });

  const setProfileEmoji = (emoji: string) => {
    setProfileEmojiState(emoji);
    localStorage.setItem("profileEmoji", emoji);
  };

  // Build redeemed rewards with their categories
  const redeemedRewards: RedeemedReward[] = (redeemedData || []).map((r) => {
    const reward = rewardsList?.find((rw) => rw.id === r.rewardId);
    return { rewardId: r.rewardId, category: reward?.category || "other" };
  });

  const hasReward = (category: string) =>
    redeemedRewards.some((r) => r.category === category);

  return (
    <RewardsContext.Provider value={{ redeemedRewards, hasReward, refetch, profileEmoji, setProfileEmoji }}>
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (!context) throw new Error("useRewards must be used within RewardsProvider");
  return context;
}

export { AVATAR_EMOJIS };
