import type { PromptDef, VaultCategory } from "./types";

export const CATEGORY_META: Record<
  VaultCategory,
  { label: string; description: string; weight: number }
> = {
  digital: {
    label: "Digital accounts",
    description: "Email, phone, password recovery, cloud storage",
    weight: 1,
  },
  financial: {
    label: "Financial & auto-pays",
    description: "Banks, cards, auto-pays, insurance policies",
    weight: 1.2,
  },
  property: {
    label: "Property & documents",
    description: "Deeds, titles, safe locations, storage units",
    weight: 1,
  },
  contacts: {
    label: "People to notify",
    description: "Employer, attorney, accountant, close friends",
    weight: 0.9,
  },
  subscriptions: {
    label: "Subscriptions & services",
    description: "Streaming, utilities, memberships, software",
    weight: 0.8,
  },
  vehicles: {
    label: "Vehicles",
    description: "Cars, titles, insurance, keys",
    weight: 0.7,
  },
  wishes: {
    label: "Practical wishes",
    description: "Non-legal preferences for practical matters",
    weight: 0.6,
  },
};

export const PROMPTS: PromptDef[] = [
  {
    id: "p-email-access",
    category: "digital",
    question: "Does anyone else know the password or recovery method for your primary email?",
    help: "Primary email is often the master key to everything else.",
    itemType: "account",
    fieldHints: ["Email address", "Recovery method", "Who else has access"],
  },
  {
    id: "p-phone-pin",
    category: "digital",
    question: "How would someone unlock your phone if they needed to?",
    help: "Passcode, biometrics, or a sealed note location.",
    itemType: "note",
    fieldHints: ["Device", "Access method", "Where details live"],
  },
  {
    id: "p-bank-autopay",
    category: "financial",
    question: "Which bank account handles the majority of your automatic bill pays?",
    help: "This is usually the first account to secure after a death.",
    itemType: "autopay",
    fieldHints: ["Bank name", "Account nickname", "What runs through it"],
  },
  {
    id: "p-life-insurance",
    category: "financial",
    question: "Do you have a life insurance policy someone might not know about?",
    help: "Company, policy number location, and agent contact if known.",
    itemType: "insurance",
    fieldHints: ["Company", "Where documents are", "Agent / phone"],
  },
  {
    id: "p-home-deed",
    category: "property",
    question: "Where is the physical deed or title for your primary home kept?",
    help: "Safe, file cabinet, attorney, or digital vault location.",
    itemType: "document_location",
    fieldHints: ["Document type", "Physical location", "Digital copy location"],
  },
  {
    id: "p-safe-combo",
    category: "property",
    question: "Is there a safe, lockbox, or storage unit someone should know about?",
    itemType: "note",
    fieldHints: ["What it is", "Where it is", "How to access"],
  },
  {
    id: "p-employer",
    category: "contacts",
    question: "Who should be the first person contacted at work for practical matters?",
    itemType: "contact",
    fieldHints: ["Name", "Role", "Email or phone"],
  },
  {
    id: "p-attorney",
    category: "contacts",
    question: "Do you have an attorney, CPA, or financial advisor your people should call?",
    itemType: "contact",
    fieldHints: ["Name", "Role", "Contact info"],
  },
  {
    id: "p-streaming",
    category: "subscriptions",
    question: "Which subscriptions auto-renew that your family would want to cancel first?",
    itemType: "subscription",
    fieldHints: ["Service", "Billing account", "Approx monthly cost"],
  },
  {
    id: "p-utilities",
    category: "subscriptions",
    question: "Which utilities and home services are in your name?",
    itemType: "subscription",
    fieldHints: ["Provider", "Account number location", "Service address"],
  },
  {
    id: "p-vehicle-title",
    category: "vehicles",
    question: "Where is the title for your primary vehicle, and who is listed as owner?",
    itemType: "vehicle",
    fieldHints: ["Vehicle", "Title location", "Registered owner"],
  },
  {
    id: "p-vehicle-insurance",
    category: "vehicles",
    question: "Who is your auto insurer, and where is the policy card?",
    itemType: "insurance",
    fieldHints: ["Insurer", "Policy location", "Agent contact"],
  },
  {
    id: "p-practical-wishes",
    category: "wishes",
    question: "Are there practical wishes (not legal) you want your people to know first?",
    help: "Examples: who gets the dog short-term, preferred funeral home contact, house plant care.",
    itemType: "wish",
    fieldHints: ["Topic", "Preference", "Who should handle it"],
  },
  {
    id: "p-cloud-storage",
    category: "digital",
    question: "Where do important digital files live (cloud, external drive, laptop folders)?",
    itemType: "document_location",
    fieldHints: ["Service or device", "Folder path", "Access notes"],
  },
];

export function getNextPrompt(answeredIds: string[], index: number): PromptDef | null {
  const remaining = PROMPTS.filter((p) => !answeredIds.includes(p.id));
  if (remaining.length === 0) return null;
  return remaining[index % remaining.length] ?? remaining[0] ?? null;
}
