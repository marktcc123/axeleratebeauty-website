"use client";

import { useMemo, useState } from "react";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { concernFilters, type ConcernFilter, type FacialProgram } from "@/data/facial-programs";

export function ProgramsExplorer({ programs }: { programs: FacialProgram[] }) {
  const [concern, setConcern] = useState<ConcernFilter | "all">("all");
  const visible = useMemo(
    () => (concern === "all" ? programs : programs.filter((program) => program.concernFilter === concern)),
    [concern, programs],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by cosmetic skin concern">
        {concernFilters.map((filter) => {
          const selected = concern === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setConcern(filter.id)}
              className={`border px-3 py-2 text-sm ${selected ? "border-charcoal bg-charcoal text-cream" : "border-sand-200 bg-white text-stone-deep"}`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {visible.map((program) => (
          <ProgramCard key={program.id} program={program} featured />
        ))}
      </div>
    </div>
  );
}
