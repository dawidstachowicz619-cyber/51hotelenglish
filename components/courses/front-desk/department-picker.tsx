"use client";

import {
  Bell,
  CalendarCheck,
  Headphones,
  UserRound,
} from "lucide-react";

import {
  FRONT_DESK_DEPARTMENTS,
  type FrontDeskDepartment,
  type FrontDeskDepartmentId,
} from "@/lib/types/front-desk-department";
import { SIMULATIONS_PER_LEVEL } from "@/lib/data/front-desk/simulation-generator";
import { cn } from "@/lib/utils";

const DEPARTMENT_ICONS: Record<
  FrontDeskDepartmentId,
  typeof UserRound
> = {
  reception: UserRound,
  concierge: Bell,
  reservations: CalendarCheck,
  "customer-service": Headphones,
};

const DEPARTMENT_COLORS: Record<FrontDeskDepartmentId, string> = {
  reception: "bg-primary text-white shadow-[0_4px_0_0_var(--primary-dark)]",
  concierge: "bg-secondary text-white shadow-[0_4px_0_0_var(--secondary-dark)]",
  reservations: "bg-accent text-white shadow-[0_4px_0_0_var(--accent-dark)]",
  "customer-service": "bg-purple text-white shadow-[0_4px_0_0_#a855f7]",
};

type DepartmentPickerProps = {
  onSelect: (department: FrontDeskDepartment) => void;
};

export function DepartmentPicker({ onSelect }: DepartmentPickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FRONT_DESK_DEPARTMENTS.map((dept) => {
        const Icon = DEPARTMENT_ICONS[dept.id];
        return (
          <button
            key={dept.id}
            type="button"
            onClick={() => onSelect(dept)}
            className="card-elevated group flex flex-col p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-xl",
                DEPARTMENT_COLORS[dept.id]
              )}
            >
              <Icon className="size-6" strokeWidth={2} />
            </div>
            <p className="mt-4 text-xs font-bold text-muted-foreground">
              {dept.subtitle}
            </p>
            <h3 className="mt-1 font-display text-lg text-foreground">
              {dept.title}
            </h3>
            <p className="mt-2 flex-1 text-sm font-semibold leading-relaxed text-muted-foreground">
              {dept.description}
            </p>
            <p className="mt-3 text-xs font-extrabold text-primary group-hover:underline">
              {SIMULATIONS_PER_LEVEL} 个模拟场景/级 →
            </p>
          </button>
        );
      })}
    </div>
  );
}
