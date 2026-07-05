"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createHrAdminAccount,
  deleteHrAdminAccount,
  generateHrAdminPassword,
  getHrAccountsByHotel,
  updateHrAdminAccount,
} from "@/lib/hr/hr-admin-accounts";
import type { HrAdminAccount } from "@/lib/types/hr-admin-account";
import { cn } from "@/lib/utils";

type HotelHrAccountsPanelProps = {
  hotel: string;
  disabled?: boolean;
};

export function HotelHrAccountsPanel({
  hotel,
  disabled,
}: HotelHrAccountsPanelProps) {
  const [accounts, setAccounts] = useState<HrAdminAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const refresh = useCallback(() => {
    setAccounts(getHrAccountsByHotel(hotel));
  }, [hotel]);

  useEffect(() => {
    refresh();
    window.addEventListener("hr-admin-accounts-updated", refresh);
    return () => window.removeEventListener("hr-admin-accounts-updated", refresh);
  }, [refresh]);

  const openForm = () => {
    setShowForm(true);
    setUsername("");
    setDisplayName("");
    setEmail("");
    setPassword(generateHrAdminPassword());
    setError(null);
    setCreatedCreds(null);
  };

  const handleCreate = () => {
    setError(null);
    const result = createHrAdminAccount({
      hotel,
      username,
      password,
      displayName,
      email: email || undefined,
    });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setCreatedCreds({ username: result.account.username, password });
    setShowForm(false);
    refresh();
  };

  const handleResetPassword = (account: HrAdminAccount) => {
    const next = generateHrAdminPassword();
    updateHrAdminAccount(account.id, { password: next });
    setCreatedCreds({ username: account.username, password: next });
    refresh();
  };

  const handleToggleEnabled = (account: HrAdminAccount) => {
    updateHrAdminAccount(account.id, { enabled: !account.enabled });
    refresh();
  };

  const handleDelete = (account: HrAdminAccount) => {
    if (
      !window.confirm(
        `确定删除管理员「${account.displayName}」（${account.username}）？`
      )
    ) {
      return;
    }
    deleteHrAdminAccount(account.id);
    refresh();
  };

  return (
    <div className="mt-6 rounded-xl border-2 border-secondary/20 bg-secondary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <UserCog className="mt-0.5 size-4 shrink-0 text-secondary" />
          <div>
            <p className="text-sm font-extrabold text-foreground">企业管理员账号</p>
            <p className="text-[10px] font-semibold text-muted-foreground">
              为该酒店创建 HR 登录账号，员工通过 /admin/hr 使用账号密码登录
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={openForm}
        >
          <Plus className="size-3.5" />
          新建账号
        </Button>
      </div>

      {createdCreds && (
        <div className="mt-3 rounded-lg border-2 border-primary/30 bg-primary-light/30 px-3 py-2.5">
          <p className="text-xs font-extrabold text-primary">账号已保存，请将以下信息发给企业 HR：</p>
          <p className="mt-1 font-mono text-sm font-bold text-foreground">
            账号：{createdCreds.username}
          </p>
          <p className="font-mono text-sm font-bold text-foreground">
            密码：{createdCreds.password}
          </p>
        </div>
      )}

      {showForm && (
        <div className="mt-3 space-y-2 rounded-lg border-2 border-border bg-white p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="登录账号">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="如：hr.ritz.sh"
                className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-secondary"
              />
            </Field>
            <Field label="管理员姓名">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="如：张经理"
                className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-secondary"
              />
            </Field>
            <Field label="邮箱（可选）">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@hotel.com"
                className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-secondary"
              />
            </Field>
            <Field label="初始密码">
              <div className="flex gap-2">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border-2 border-border px-3 py-2 font-mono text-sm font-semibold outline-none focus:border-secondary"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPassword(generateHrAdminPassword())}
                >
                  <KeyRound className="size-3.5" />
                  随机
                </Button>
              </div>
            </Field>
          </div>
          {error && (
            <p className="text-xs font-bold text-red">{error}</p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>
              创建账号
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              取消
            </Button>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          尚未创建企业管理员账号，请先新建后再通知 HR 登录。
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {accounts.map((account) => (
            <li
              key={account.id}
              className={cn(
                "flex flex-col gap-2 rounded-lg border-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
                account.enabled ? "border-border bg-white" : "border-red/20 bg-red/5"
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {account.displayName}
                  <span className="ml-2 font-mono text-xs font-semibold text-muted-foreground">
                    {account.username}
                  </span>
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground">
                  {account.email || "未填邮箱"} ·{" "}
                  {account.enabled ? "已启用" : "已禁用"} · 创建于{" "}
                  {new Date(account.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => handleResetPassword(account)}
                >
                  重置密码
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => handleToggleEnabled(account)}
                >
                  {account.enabled ? "禁用" : "启用"}
                </Button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDelete(account)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-red/10 hover:text-red disabled:opacity-40"
                  aria-label="删除"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-extrabold text-muted-foreground">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
