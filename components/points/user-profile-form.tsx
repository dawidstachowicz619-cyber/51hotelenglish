"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { usePoints } from "@/hooks/use-points";

type UserProfileFormProps = {
  onComplete: () => void;
};

export function UserProfileForm({ onComplete }: UserProfileFormProps) {
  const { profile, saveUserInfo } = usePoints();
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [hotel, setHotel] = useState(profile?.hotel ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    saveUserInfo(nickname, hotel);
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="card-elevated p-6">
      <h2 className="font-display text-xl text-foreground">完善学习档案</h2>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">
        填写昵称和所在酒店，即可参与积分排名。
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-extrabold uppercase text-muted-foreground">
            昵称 *
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="如：小明"
            className="mt-1 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
            required
            maxLength={20}
          />
        </div>
        <div>
          <label className="text-xs font-extrabold uppercase text-muted-foreground">
            所在酒店
          </label>
          <input
            type="text"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            placeholder="如：上海XX酒店"
            className="mt-1 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
            maxLength={40}
          />
        </div>
      </div>

      <Button type="submit" className="mt-6 w-full" disabled={!nickname.trim()}>
        保存并参与排名
      </Button>
    </form>
  );
}
