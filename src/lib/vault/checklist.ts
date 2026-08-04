import type { ChecklistPhase, ChecklistTask, VaultItem } from "./types";

const PHASE_ORDER: ChecklistPhase[] = ["immediate", "day1", "week1", "month1", "ongoing"];

export const PHASE_LABELS: Record<ChecklistPhase, string> = {
  immediate: "Immediate",
  day1: "Day 1",
  week1: "Week 1",
  month1: "Month 1",
  ongoing: "Ongoing",
};

function id() {
  return `task_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateChecklist(items: VaultItem[], ownerName: string): ChecklistTask[] {
  const tasks: ChecklistTask[] = [
    {
      id: id(),
      phase: "immediate",
      title: "Secure the primary phone and email",
      description:
        "Locate the device and confirm recovery access for the primary email. Most other accounts hang on this.",
      relatedItemIds: items.filter((i) => i.category === "digital").map((i) => i.id),
      completed: false,
      notes: "",
      estimatedMinutes: 45,
      templateId: undefined,
    },
    {
      id: id(),
      phase: "immediate",
      title: "Notify the primary designated contacts",
      description: "Call or message the people listed as designated contacts so they know the plan is active.",
      relatedItemIds: [],
      completed: false,
      notes: "",
      estimatedMinutes: 30,
    },
    {
      id: id(),
      phase: "day1",
      title: "Contact the primary bank about auto-pays",
      description: `Start with the account that handles most automatic payments for ${ownerName || "the account holder"}. Request freeze guidance — do not close accounts hastily.`,
      relatedItemIds: items.filter((i) => i.type === "autopay" || i.category === "financial").map((i) => i.id),
      completed: false,
      notes: "",
      estimatedMinutes: 60,
      templateId: "t-bank",
    },
    {
      id: id(),
      phase: "day1",
      title: "Locate the deed / title documents",
      description: "Use the vault notes to find physical or digital deed and vehicle titles.",
      relatedItemIds: items.filter((i) => i.type === "document_location" || i.category === "property").map((i) => i.id),
      completed: false,
      notes: "",
      estimatedMinutes: 40,
    },
    {
      id: id(),
      phase: "week1",
      title: "Notify Social Security (if applicable)",
      description: "Operational notification only. Use the SSA template and confirm any benefit stoppage process.",
      relatedItemIds: [],
      completed: false,
      notes: "",
      estimatedMinutes: 50,
      templateId: "t-ssa",
    },
    {
      id: id(),
      phase: "week1",
      title: "Cancel high-priority subscriptions",
      description: "Work down the subscription list from the vault. Prefer written confirmation of cancellation.",
      relatedItemIds: items.filter((i) => i.category === "subscriptions").map((i) => i.id),
      completed: false,
      notes: "",
      estimatedMinutes: 90,
      templateId: "t-subscription",
    },
    {
      id: id(),
      phase: "week1",
      title: "Notify employer / HR if still relevant",
      description: "Use the employer contact from the vault if one was recorded.",
      relatedItemIds: items.filter((i) => i.category === "contacts").map((i) => i.id),
      completed: false,
      notes: "",
      estimatedMinutes: 40,
      templateId: "t-employer",
    },
    {
      id: id(),
      phase: "month1",
      title: "Open insurance claims where policies exist",
      description: "Life, auto, home — use vault policy locations and the insurer template.",
      relatedItemIds: items.filter((i) => i.type === "insurance").map((i) => i.id),
      completed: false,
      notes: "",
      estimatedMinutes: 120,
      templateId: "t-insurer",
    },
    {
      id: id(),
      phase: "month1",
      title: "Transfer or retitle vehicle(s)",
      description: "Gather title, insurance card, and registration details from the vault before visiting the DMV.",
      relatedItemIds: items.filter((i) => i.category === "vehicles").map((i) => i.id),
      completed: false,
      notes: "",
      estimatedMinutes: 180,
    },
    {
      id: id(),
      phase: "ongoing",
      title: "Review practical wishes and non-legal preferences",
      description: "Follow the operational wishes captured in the vault (care of pets, home, short-term logistics).",
      relatedItemIds: items.filter((i) => i.category === "wishes").map((i) => i.id),
      completed: false,
      notes: "",
      estimatedMinutes: 60,
    },
    {
      id: id(),
      phase: "ongoing",
      title: "Utility and home service transitions",
      description: "Keep essential services active while transferring accounts into a surviving household member’s name.",
      relatedItemIds: items.filter((i) => i.category === "subscriptions").map((i) => i.id),
      completed: false,
      notes: "",
      estimatedMinutes: 90,
      templateId: "t-utility",
    },
  ];

  // Add one task per high-signal vault item for personalization
  for (const item of items.slice(0, 8)) {
    if (tasks.some((t) => t.relatedItemIds.includes(item.id) && t.title.includes(item.title))) continue;
    tasks.push({
      id: id(),
      phase: item.category === "financial" ? "day1" : item.category === "digital" ? "immediate" : "week1",
      title: `Review: ${item.title}`,
      description: item.summary || `Use the vault entry for ${item.title} and complete any related notifications.`,
      relatedItemIds: [item.id],
      completed: false,
      notes: "",
      estimatedMinutes: 25,
    });
  }

  return tasks.sort(
    (a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase),
  );
}

export function checklistStats(tasks: ChecklistTask[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const minutesLeft = tasks.filter((t) => !t.completed).reduce((s, t) => s + t.estimatedMinutes, 0);
  const byPhase = PHASE_ORDER.map((phase) => {
    const phaseTasks = tasks.filter((t) => t.phase === phase);
    const phaseDone = phaseTasks.filter((t) => t.completed).length;
    return {
      phase,
      label: PHASE_LABELS[phase],
      total: phaseTasks.length,
      done: phaseDone,
      pct: phaseTasks.length ? Math.round((phaseDone / phaseTasks.length) * 100) : 0,
    };
  });
  return {
    total,
    done,
    pct: total ? Math.round((done / total) * 100) : 0,
    minutesLeft,
    byPhase,
  };
}
