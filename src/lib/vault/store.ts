import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateChecklist } from "./checklist";
import { CATEGORY_META, PROMPTS, getNextPrompt } from "./prompts";
import type {
  ChecklistTask,
  DesignatedContact,
  VaultCategory,
  VaultItem,
  VaultState,
} from "./types";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

const emptyState = (): VaultState => ({
  version: 1,
  onboardingComplete: false,
  ownerName: "",
  contacts: [],
  items: [],
  answeredPromptIds: [],
  currentPromptIndex: 0,
  releaseTriggered: false,
  checklist: [],
  referralShared: false,
});

function sampleVault(): Pick<
  VaultState,
  "ownerName" | "contacts" | "items" | "answeredPromptIds" | "onboardingComplete"
> {
  const now = new Date().toISOString();
  const items: VaultItem[] = [
    {
      id: uid("item"),
      type: "account",
      category: "digital",
      title: "Primary email — jordan@example.com",
      summary: "Recovery codes in household binder, tab ‘Digital’",
      fields: {
        "Email address": "jordan@example.com",
        "Recovery method": "Printed codes in binder",
        "Who else has access": "Alex (spouse) knows recovery phrase location",
      },
      createdAt: now,
      updatedAt: now,
      sourcePromptId: "p-email-access",
    },
    {
      id: uid("item"),
      type: "autopay",
      category: "financial",
      title: "First National checking — household bills",
      summary: "Mortgage, utilities, and two insurance drafts",
      fields: {
        "Bank name": "First National",
        "Account nickname": "Household checking ****4821",
        "What runs through it": "Mortgage, electric, water, life insurance",
      },
      createdAt: now,
      updatedAt: now,
      sourcePromptId: "p-bank-autopay",
    },
    {
      id: uid("item"),
      type: "insurance",
      category: "financial",
      title: "Life insurance — Harbor Mutual",
      summary: "Policy packet in fire safe",
      fields: {
        Company: "Harbor Mutual",
        "Where documents are": "Fire safe, bottom shelf",
        "Agent / phone": "Sam Rivera · 555-0142",
      },
      createdAt: now,
      updatedAt: now,
      sourcePromptId: "p-life-insurance",
    },
    {
      id: uid("item"),
      type: "document_location",
      category: "property",
      title: "Home deed location",
      summary: "Original in safe deposit box #214",
      fields: {
        "Document type": "Warranty deed",
        "Physical location": "Safe deposit box 214, First National",
        "Digital copy location": "Encrypted drive labeled HOUSE",
      },
      createdAt: now,
      updatedAt: now,
      sourcePromptId: "p-home-deed",
    },
    {
      id: uid("item"),
      type: "contact",
      category: "contacts",
      title: "HR contact — Northline Logistics",
      fields: {
        Name: "Pat Okonkwo",
        Role: "HR business partner",
        "Email or phone": "pat.o@northline.example · 555-0199",
      },
      createdAt: now,
      updatedAt: now,
      sourcePromptId: "p-employer",
    },
    {
      id: uid("item"),
      type: "subscription",
      category: "subscriptions",
      title: "Streaming & software stack",
      summary: "Netflix, Adobe, iCloud+ on Visa ending 3310",
      fields: {
        Service: "Netflix, Adobe CC, iCloud+",
        "Billing account": "Visa ···3310",
        "Approx monthly cost": "$78",
      },
      createdAt: now,
      updatedAt: now,
      sourcePromptId: "p-streaming",
    },
    {
      id: uid("item"),
      type: "vehicle",
      category: "vehicles",
      title: "2019 Subaru Outback",
      fields: {
        Vehicle: "2019 Subaru Outback, silver",
        "Title location": "Fire safe with insurance card",
        "Registered owner": "Jordan Lee",
      },
      createdAt: now,
      updatedAt: now,
      sourcePromptId: "p-vehicle-title",
    },
    {
      id: uid("item"),
      type: "wish",
      category: "wishes",
      title: "Short-term pet care",
      summary: "Neighbor Maya has a key and can take the dog for 2 weeks",
      fields: {
        Topic: "Dog — Maple",
        Preference: "Maya Chen next door first; food in pantry bin",
        "Who should handle it": "Maya · 555-0160",
      },
      createdAt: now,
      updatedAt: now,
      sourcePromptId: "p-practical-wishes",
    },
  ];

  return {
    ownerName: "Jordan Lee",
    onboardingComplete: true,
    answeredPromptIds: items.map((i) => i.sourcePromptId!).filter(Boolean),
    contacts: [
      {
        id: uid("contact"),
        name: "Alex Lee",
        email: "alex@example.com",
        relationship: "Spouse",
        isPrimary: true,
        notifyOnRelease: true,
      },
      {
        id: uid("contact"),
        name: "Sam Rivera",
        email: "sam@example.com",
        relationship: "Sibling",
        isPrimary: false,
        notifyOnRelease: true,
      },
    ],
    items,
  };
}

interface VaultStore extends VaultState {
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  hydrateDemo: () => void;
  completeOnboarding: (input: {
    ownerName: string;
    contacts: Omit<DesignatedContact, "id">[];
  }) => void;
  addContact: (contact: Omit<DesignatedContact, "id">) => void;
  removeContact: (id: string) => void;
  answerPrompt: (input: {
    promptId: string;
    title: string;
    summary?: string;
    fields: Record<string, string>;
  }) => void;
  skipPrompt: (promptId: string) => void;
  addItem: (item: Omit<VaultItem, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, patch: Partial<VaultItem>) => void;
  deleteItem: (id: string) => void;
  triggerRelease: () => void;
  resetRelease: () => void;
  toggleTask: (taskId: string) => void;
  setTaskNotes: (taskId: string, notes: string) => void;
  markReferralShared: () => void;
  resetAll: () => void;
  completeness: () => {
    overall: number;
    byCategory: { category: VaultCategory; label: string; pct: number; count: number }[];
  };
  currentPrompt: () => ReturnType<typeof getNextPrompt>;
}

const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => ({
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }));

export const useVaultStore = create<VaultStore>()(
  persist(
    (set, get) => ({
      ...emptyState(),
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      hydrateDemo: () => {
        const sample = sampleVault();
        const checklist = generateChecklist(sample.items, sample.ownerName);
        set({
          ...emptyState(),
          ...sample,
          checklist,
          releaseTriggered: false,
          releasedAt: undefined,
          referralShared: false,
          _hasHydrated: true,
        });
      },

      completeOnboarding: ({ ownerName, contacts }) => {
        set({
          ownerName: ownerName.trim(),
          onboardingComplete: true,
          contacts: contacts.map((c) => ({ ...c, id: uid("contact") })),
        });
      },

      addContact: (contact) =>
        set((s) => ({
          contacts: [...s.contacts, { ...contact, id: uid("contact") }],
        })),

      removeContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      answerPrompt: ({ promptId, title, summary, fields }) => {
        const prompt = PROMPTS.find((p) => p.id === promptId);
        if (!prompt) return;
        const now = new Date().toISOString();
        const item: VaultItem = {
          id: uid("item"),
          type: prompt.itemType,
          category: prompt.category,
          title: title.trim() || prompt.question,
          summary,
          fields,
          createdAt: now,
          updatedAt: now,
          sourcePromptId: promptId,
        };
        set((s) => ({
          items: [item, ...s.items],
          answeredPromptIds: s.answeredPromptIds.includes(promptId)
            ? s.answeredPromptIds
            : [...s.answeredPromptIds, promptId],
          currentPromptIndex: s.currentPromptIndex + 1,
        }));
      },

      skipPrompt: (promptId) =>
        set((s) => ({
          answeredPromptIds: s.answeredPromptIds.includes(promptId)
            ? s.answeredPromptIds
            : [...s.answeredPromptIds, promptId],
          currentPromptIndex: s.currentPromptIndex + 1,
        })),

      addItem: (item) => {
        const now = new Date().toISOString();
        set((s) => ({
          items: [
            { ...item, id: uid("item"), createdAt: now, updatedAt: now },
            ...s.items,
          ],
        }));
      },

      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i,
          ),
        })),

      deleteItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      triggerRelease: () => {
        const s = get();
        const checklist = generateChecklist(s.items, s.ownerName);
        set({
          releaseTriggered: true,
          releasedAt: new Date().toISOString(),
          checklist,
        });
      },

      resetRelease: () =>
        set({
          releaseTriggered: false,
          releasedAt: undefined,
          checklist: [],
          referralShared: false,
        }),

      toggleTask: (taskId) =>
        set((s) => ({
          checklist: s.checklist.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          ),
        })),

      setTaskNotes: (taskId, notes) =>
        set((s) => ({
          checklist: s.checklist.map((t) => (t.id === taskId ? { ...t, notes } : t)),
        })),

      markReferralShared: () => set({ referralShared: true }),

      resetAll: () => set({ ...emptyState(), _hasHydrated: true }),

      completeness: () => {
        const { items } = get();
        const byCategory = (Object.keys(CATEGORY_META) as VaultCategory[]).map((category) => {
          const count = items.filter((i) => i.category === category).length;
          const pct = Math.min(100, Math.round((count / 2) * 100));
          return {
            category,
            label: CATEGORY_META[category].label,
            pct,
            count,
          };
        });
        const weighted = byCategory.reduce((sum, row) => {
          const w = CATEGORY_META[row.category].weight;
          return sum + row.pct * w;
        }, 0);
        const weightTotal = byCategory.reduce(
          (sum, row) => sum + CATEGORY_META[row.category].weight,
          0,
        );
        return {
          overall: Math.round(weighted / weightTotal),
          byCategory,
        };
      },

      currentPrompt: () => {
        const s = get();
        return getNextPrompt(s.answeredPromptIds, s.currentPromptIndex);
      },
    }),
    {
      name: "aftervault-v1",
      storage,
      skipHydration: true,
      partialize: (s) => ({
        version: s.version,
        onboardingComplete: s.onboardingComplete,
        ownerName: s.ownerName,
        contacts: s.contacts,
        items: s.items,
        answeredPromptIds: s.answeredPromptIds,
        currentPromptIndex: s.currentPromptIndex,
        releaseTriggered: s.releaseTriggered,
        releasedAt: s.releasedAt,
        checklist: s.checklist,
        referralShared: s.referralShared,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export type { ChecklistTask, DesignatedContact, VaultItem };
