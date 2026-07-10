"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useLearnerHotelOptions } from "@/hooks/use-learner-hotel-options";
import { isValidLearnerPhone } from "@/lib/hr/hr-registration";
import { usePoints } from "@/hooks/use-points";

type UserProfileFormProps = {
  onComplete: () => void;
  verifiedPhone?: string | null;
};

export function UserProfileForm({ onComplete, verifiedPhone }: UserProfileFormProps) {
  const { profile, saveUserInfo } = usePoints();
  const { hotels, loading } = useLearnerHotelOptions();
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [hotel, setHotel] = useState(profile?.hotel ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? verifiedPhone ?? "");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (verifiedPhone) {
      setPhone(verifiedPhone);
    }
  }, [verifiedPhone]);

  const hotelOptions = useMemo(() => {
    const saved = profile?.hotel?.trim();
    if (saved && !hotels.includes(saved)) {
      return [saved, ...hotels];
    }
    return hotels;
  }, [hotels, profile?.hotel]);

  const phoneLocked = Boolean(verifiedPhone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !hotel.trim()) return;

    const trimmedPhone = (phoneLocked ? verifiedPhone : phone)?.trim() ?? "";
    if (trimmedPhone && !isValidLearnerPhone(trimmedPhone)) {
      setPhoneError("请输入 11 位中国大陆手机号");
      return;
    }

    setPhoneError(null);
    saveUserInfo(nickname, hotel, trimmedPhone);
    onComplete();
  };

  const isComplete = Boolean(profile?.nickname?.trim());

  return (
    <form onSubmit={handleSubmit} className="card-elevated p-6">
      <h2 className="font-display text-xl text-foreground">
        {isComplete ? "编辑学习档案" : verifiedPhone ? "完善档案（解锁课程）" : "完善学习档案"}
      </h2>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">
        {phoneLocked
          ? "手机号已验证。填写姓名与所在酒店，与 HR 登记一致方可解锁课程。"
          : "填写姓名、酒店与手机号。手机号须与 HR 在后台登记的一致，方可解锁全部课程。"}
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-extrabold uppercase text-muted-foreground">
            姓名 *
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
          <label
            htmlFor="learner-hotel"
            className="text-xs font-extrabold uppercase text-muted-foreground"
          >
            所在酒店 *
          </label>
          <select
            id="learner-hotel"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
            required
            disabled={loading}
          >
            <option value="" disabled>
              {loading ? "加载酒店列表…" : "请选择酒店"}
            </option>
            {hotelOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[10px] font-semibold text-muted-foreground">
            酒店由系统管理员录入；请填写与 HR 登记一致的手机号，由企业 HR 后台开通账号。
          </p>
        </div>
        <div>
          <label className="text-xs font-extrabold uppercase text-muted-foreground">
            手机号 *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              if (phoneLocked) return;
              setPhone(e.target.value);
              setPhoneError(null);
            }}
            placeholder="与 HR 登记一致，如：13800138000"
            className="mt-1 w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary disabled:bg-muted/60 disabled:text-muted-foreground"
            required
            maxLength={11}
            readOnly={phoneLocked}
            disabled={phoneLocked}
          />
          {phoneLocked && (
            <p className="mt-1.5 text-[10px] font-semibold text-primary">
              已通过短信验证，如需更换请先退出登录
            </p>
          )}
          {phoneError && (
            <p className="mt-1 text-xs font-bold text-red">{phoneError}</p>
          )}
          <p className="mt-1.5 text-[10px] font-semibold text-muted-foreground">
            未在 HR 后台注册前无法学习课程；注册后自动解锁全部内容。
          </p>
        </div>
      </div>

      <Button
        type="submit"
        className="mt-6 w-full"
        disabled={
          !nickname.trim() ||
          !hotel.trim() ||
          !(phoneLocked ? verifiedPhone : phone.trim()) ||
          loading
        }
      >
        {isComplete ? "保存修改" : "保存档案"}
      </Button>
    </form>
  );
}
