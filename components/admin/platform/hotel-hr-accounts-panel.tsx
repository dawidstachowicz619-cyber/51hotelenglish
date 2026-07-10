"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Pencil, Plus, Trash2, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateHrAdminPassword } from "@/lib/hr/hr-admin-accounts";
import {
  cloudCreateHrAdminAccount,
  cloudDeleteHrAdminAccount,
  cloudUpdateHrAdminAccount,
  fetchHotelHrAccounts,
} from "@/lib/hr/platform-api";
import type { HrAdminAccount } from "@/lib/types/hr-admin-account";
import { cn } from "@/lib/utils";

type HotelHrAccountsPanelProps = {
  hotel: string;
  disabled?: boolean;
};

type AccountFormState = {
  username: string;
  displayName: string;
  phone: string;
  email: string;
  password: string;
};

const emptyForm = (): AccountFormState => ({
  username: "",
  displayName: "",
  phone: "",
  email: "",
  password: generateHrAdminPassword(),
});

export function HotelHrAccountsPanel({
  hotel,
  disabled,
}: HotelHrAccountsPanelProps) {
  const [accounts, setAccounts] = useState<HrAdminAccount[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<AccountFormState>(emptyForm);
  const [editForm, setEditForm] = useState<AccountFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    setAccounts(await fetchHotelHrAccounts(hotel));
  }, [hotel]);

  useEffect(() => {
    void refresh();
    window.addEventListener("hr-admin-accounts-updated", refresh);
    return () => window.removeEventListener("hr-admin-accounts-updated", refresh);
  }, [refresh]);

  const openCreateForm = () => {
    setShowCreateForm(true);
    setEditingId(null);
    setCreateForm(emptyForm());
    setError(null);
    setCreatedCreds(null);
  };

  const openEditForm = (account: HrAdminAccount) => {
    setEditingId(account.id);
    setShowCreateForm(false);
    setEditForm({
      username: account.username,
      displayName: account.displayName,
      phone: account.phone ?? "",
      email: account.email ?? "",
      password: "",
    });
    setError(null);
    setCreatedCreds(null);
  };

  const handleCreate = async () => {
    setError(null);
    const result = await cloudCreateHrAdminAccount({
      hotel,
      username: createForm.username,
      password: createForm.password,
      displayName: createForm.displayName,
      phone: createForm.phone || undefined,
      email: createForm.email || undefined,
    });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setCreatedCreds({
      username: result.account.username,
      password: createForm.password,
    });
    setShowCreateForm(false);
    await refresh();
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setError(null);
    const result = await cloudUpdateHrAdminAccount(editingId, {
      username: editForm.username,
      displayName: editForm.displayName,
      phone: editForm.phone || undefined,
      email: editForm.email || undefined,
      password: editForm.password || undefined,
    });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    if (editForm.password) {
      setCreatedCreds({ username: result.account.username, password: editForm.password });
    }
    setEditingId(null);
    await refresh();
  };

  const handleResetPassword = async (account: HrAdminAccount) => {
    const next = generateHrAdminPassword();
    const result = await cloudUpdateHrAdminAccount(account.id, { password: next });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setCreatedCreds({ username: account.username, password: next });
    await refresh();
  };

  const handleToggleEnabled = async (account: HrAdminAccount) => {
    const result = await cloudUpdateHrAdminAccount(account.id, {
      enabled: !account.enabled,
    });
    if ("error" in result) {
      setError(result.error);
      return;
    }
    await refresh();
  };

  const handleDelete = async (account: HrAdminAccount) => {
    if (
      !window.confirm(
        `确定删除管理员「${account.displayName}」（${account.username}）？`
      )
    ) {
      return;
    }
    const result = await cloudDeleteHrAdminAccount(account.id);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    if (editingId === account.id) setEditingId(null);
    await refresh();
  };

  return (
    <div className="mt-6 rounded-xl border-2 border-secondary/20 bg-secondary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <UserCog className="mt-0.5 size-4 shrink-0 text-secondary" />
          <div>
            <p className="text-sm font-extrabold text-foreground">企业管理员账号</p>
            <p className="text-[10px] font-semibold text-muted-foreground">
              创建并编辑 HR 登录账号、手机号与姓名，员工通过 /admin/hr 登录
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={openCreateForm}
        >
          <Plus className="size-3.5" />
          新建账号
        </Button>
      </div>

      {createdCreds && (
        <div className="mt-3 rounded-lg border-2 border-primary/30 bg-primary-light/30 px-3 py-2.5">
          <p className="text-xs font-extrabold text-primary">
            账号信息已保存，请将以下信息发给企业 HR：
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-foreground">
            账号：{createdCreds.username}
          </p>
          <p className="font-mono text-sm font-bold text-foreground">
            密码：{createdCreds.password}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs font-bold text-red">{error}</p>
      )}

      {showCreateForm && (
        <AccountForm
          title="新建企业管理员"
          form={createForm}
          onChange={setCreateForm}
          showPassword
          passwordRequired
          onSubmit={() => void handleCreate()}
          onCancel={() => setShowCreateForm(false)}
        />
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
                "rounded-lg border-2 px-3 py-2.5",
                account.enabled ? "border-border bg-white" : "border-red/20 bg-red/5"
              )}
            >
              {editingId === account.id ? (
                <AccountForm
                  title={`编辑：${account.displayName}`}
                  form={editForm}
                  onChange={setEditForm}
                  showPassword
                  passwordRequired={false}
                  passwordPlaceholder="留空则不修改密码"
                  onSubmit={() => void handleSaveEdit()}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {account.displayName}
                      <span className="ml-2 font-mono text-xs font-semibold text-muted-foreground">
                        @{account.username}
                      </span>
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
                      手机：{account.phone || "未填写"} · 邮箱：{account.email || "未填写"}
                    </p>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      {account.enabled ? "已启用" : "已禁用"} · 更新于{" "}
                      {new Date(account.updatedAt).toLocaleString("zh-CN", {
                        hour12: false,
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={disabled}
                      onClick={() => openEditForm(account)}
                    >
                      <Pencil className="size-3.5" />
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={disabled}
                      onClick={() => void handleResetPassword(account)}
                    >
                      重置密码
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={disabled}
                      onClick={() => void handleToggleEnabled(account)}
                    >
                      {account.enabled ? "禁用" : "启用"}
                    </Button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => void handleDelete(account)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-red/10 hover:text-red disabled:opacity-40"
                      aria-label="删除"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AccountForm({
  title,
  form,
  onChange,
  showPassword,
  passwordRequired,
  passwordPlaceholder = "设置登录密码",
  onSubmit,
  onCancel,
}: {
  title: string;
  form: AccountFormState;
  onChange: (next: AccountFormState) => void;
  showPassword?: boolean;
  passwordRequired?: boolean;
  passwordPlaceholder?: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 space-y-2 rounded-lg border-2 border-border bg-white p-3">
      <p className="text-xs font-extrabold text-foreground">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="登录账号 *">
          <input
            value={form.username}
            onChange={(e) => onChange({ ...form, username: e.target.value })}
            placeholder="如：hr.ritz.sh"
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-secondary"
          />
        </Field>
        <Field label="管理员姓名 *">
          <input
            value={form.displayName}
            onChange={(e) => onChange({ ...form, displayName: e.target.value })}
            placeholder="如：张经理"
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-secondary"
          />
        </Field>
        <Field label="手机号">
          <input
            value={form.phone}
            onChange={(e) => onChange({ ...form, phone: e.target.value })}
            placeholder="11 位手机号"
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-secondary"
            maxLength={11}
          />
        </Field>
        <Field label="邮箱（可选）">
          <input
            value={form.email}
            onChange={(e) => onChange({ ...form, email: e.target.value })}
            placeholder="hr@hotel.com"
            className="w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold outline-none focus:border-secondary"
          />
        </Field>
        {showPassword && (
          <Field label={passwordRequired ? "初始密码 *" : "新密码（可选）"}>
            <div className="flex gap-2">
              <input
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                placeholder={passwordPlaceholder}
                className="min-w-0 flex-1 rounded-lg border-2 border-border px-3 py-2 font-mono text-sm font-semibold outline-none focus:border-secondary"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onChange({ ...form, password: generateHrAdminPassword() })}
              >
                <KeyRound className="size-3.5" />
                随机
              </Button>
            </div>
          </Field>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSubmit}>
          保存
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          取消
        </Button>
      </div>
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
