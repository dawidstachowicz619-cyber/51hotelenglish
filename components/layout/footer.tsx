import Link from "next/link";
import { Building2, Shield } from "lucide-react";

const footerLinks = {
  product: [
    { href: "/assessment", label: "CEFR 水平测评" },
    { href: "/leaderboard", label: "排行榜" },
    { href: "/courses", label: "场景课程" },
    { href: "/courses/front-desk", label: "前厅英语" },
    { href: "/courses#fnb", label: "餐饮英语" },
  ],
  company: [
    { href: "/about", label: "关于我们" },
    { href: "/about#contact", label: "联系我们" },
    { href: "/about#partners", label: "企业合作" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-muted">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white">
                51
              </span>
              <span className="font-display text-xl text-foreground">
                HotelEnglish
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              专为酒店从业者打造的英语学习平台。场景化课程 + AI
              陪练，像玩游戏一样轻松掌握 hospitality 英语。
            </p>
            <p className="mt-4 text-sm font-bold text-primary">
              51hotelenglish.com
            </p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
              产品
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
              公司
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t-2 border-border pt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/admin/hr"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-white px-5 py-2.5 text-sm font-extrabold text-muted-foreground transition-colors hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary"
              >
                <Building2 className="size-4" strokeWidth={2.25} />
                企业管理员
              </Link>
              <Link
                href="/admin/platform"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-white px-5 py-2.5 text-sm font-extrabold text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
                title="平台超级管理员"
              >
                <Shield className="size-4" strokeWidth={2.25} />
                平台管理
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t-2 border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
            <p className="font-semibold">
              © {new Date().getFullYear()} 51HotelEnglish
            </p>
            <div className="flex gap-6 font-semibold">
              <Link href="/privacy" className="hover:text-primary">
                隐私政策
              </Link>
              <Link href="/terms" className="hover:text-primary">
                服务条款
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
