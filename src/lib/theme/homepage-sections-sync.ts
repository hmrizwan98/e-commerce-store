import type { HomepageSection } from "@/types/homepage-section";

/**
 * Pure planning for "Publish homepage sections from the Customizer draft".
 *
 * The live storefront reads the `homepageSections` collection. The Customizer edits a COPY
 * (draft.homepageSections) plus a BASELINE: the id -> updatedAt of every live section at the
 * moment the copy was taken. Publishing must never overwrite or resurrect work done on the
 * live sections after that moment (e.g. through the old homepage editor), and must only delete
 * sections the merchant removed in the Customizer.
 */

/** id -> live updatedAt (ms) when the Customizer copied the sections. */
export type SectionsBaseline = Record<string, number>;

export interface LiveSectionMeta extends HomepageSection {
  updatedAt?: number;
}

export type SectionConflict =
  | { kind: "changed-elsewhere"; id: string; title: string }
  | { kind: "added-elsewhere"; id: string; title: string }
  | { kind: "deleted-elsewhere"; id: string; title: string }
  | { kind: "stale-draft"; detail: string };

export interface SectionPublishPlan {
  conflicts: SectionConflict[];
  /** Sections to create or replace (full content). */
  upserts: HomepageSection[];
  /** Ids to delete - only ones the merchant removed in the Customizer. */
  deletes: string[];
  /** Live sections nobody touched - left exactly as they are. */
  unchanged: string[];
}

/** Stable JSON (sorted keys) so equal content always compares equal. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

/** The merchant-editable content of a section (what publishing writes). */
export function sectionContent(s: Pick<HomepageSection, "type" | "title" | "order" | "isActive" | "config">) {
  return { type: s.type, title: s.title ?? "", order: s.order ?? 0, isActive: s.isActive !== false, config: s.config ?? {} };
}

export function sameSectionContent(a: HomepageSection, b: HomepageSection): boolean {
  return stableStringify(sectionContent(a)) === stableStringify(sectionContent(b));
}

/** Baseline for a set of live sections (what the Customizer records when it copies them). */
export function baselineFromLive(live: { id: string; updatedAt?: number }[]): SectionsBaseline {
  return Object.fromEntries(live.map((s) => [s.id, s.updatedAt ?? 0]));
}

export function planSectionPublish(input: {
  live: LiveSectionMeta[];
  draft: HomepageSection[];
  /** null/undefined = a draft saved before baselines existed. */
  baseline?: SectionsBaseline | null;
  /** When the draft doc was last saved (ms) - used only for drafts without a baseline. */
  draftUpdatedAt?: number;
}): SectionPublishPlan {
  const live = new Map(input.live.map((s) => [s.id, s]));
  const draft = new Map(input.draft.map((s) => [s.id, s]));
  const conflicts: SectionConflict[] = [];
  let baseline = input.baseline ?? null;

  if (!baseline) {
    // Older drafts: no record of what they were copied from.
    const identical = input.live.length === input.draft.length && input.draft.every((d) => live.has(d.id) && sameSectionContent(d, live.get(d.id)!));
    if (identical) return { conflicts: [], upserts: [], deletes: [], unchanged: input.live.map((s) => s.id) };
    const newestLive = Math.max(0, ...input.live.map((s) => s.updatedAt ?? 0));
    if (!input.draftUpdatedAt || newestLive > input.draftUpdatedAt) {
      conflicts.push({
        kind: "stale-draft",
        detail: "The live homepage sections were changed after this draft was saved.",
      });
      return { conflicts, upserts: [], deletes: [], unchanged: input.live.map((s) => s.id) };
    }
    // The draft was saved after every live change, so it was copied from the current live state.
    baseline = baselineFromLive(input.live);
  }

  for (const liveSection of input.live) {
    const id = liveSection.id;
    if (!(id in baseline)) {
      conflicts.push({ kind: "added-elsewhere", id, title: liveSection.title });
    } else if ((liveSection.updatedAt ?? 0) > baseline[id]) {
      conflicts.push({ kind: "changed-elsewhere", id, title: liveSection.title });
    }
  }
  for (const id of Object.keys(baseline)) {
    if (!live.has(id) && draft.has(id)) conflicts.push({ kind: "deleted-elsewhere", id, title: draft.get(id)!.title });
  }

  const upserts: HomepageSection[] = [];
  const unchanged: string[] = [];
  for (const d of input.draft) {
    const l = live.get(d.id);
    if (!l) {
      // New in the Customizer - but never resurrect a section someone deleted on the live site.
      if (!(d.id in baseline)) upserts.push(d);
    } else if (!sameSectionContent(d, l)) upserts.push(d);
    else unchanged.push(d.id);
  }
  // Only sections the merchant removed in the Customizer: present in the baseline, still live,
  // gone from the draft. Live sections added elsewhere are never deleted.
  const deletes = Object.keys(baseline).filter((id) => live.has(id) && !draft.has(id));

  return { conflicts, upserts, deletes, unchanged };
}
