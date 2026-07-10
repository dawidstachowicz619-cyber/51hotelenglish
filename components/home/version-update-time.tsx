import { getBuildUpdateTime } from "@/lib/build-info";

export function VersionUpdateTime() {
  const updatedAt = getBuildUpdateTime();
  if (!updatedAt) return null;

  return (
    <p className="text-center text-xs font-medium text-muted-foreground/70">
      版本更新：{updatedAt}
    </p>
  );
}
