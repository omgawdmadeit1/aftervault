export type VaultCategory =
  | "digital"
  | "financial"
  | "property"
  | "contacts"
  | "subscriptions"
  | "vehicles"
  | "wishes";

export type VaultItemType =
  | "account"
  | "document_location"
  | "autopay"
  | "contact"
  | "wish"
  | "vehicle"
  | "subscription"
  | "insurance"
  | "note";

export interface VaultItem {
  id: string;
  type: VaultItemType;
  category: VaultCategory;
  title: string;
  summary?: string;
  fields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  sourcePromptId?: string;
}

export interface DesignatedContact {
  id: string;
  name: string;
  email: string;
  relationship: string;
  isPrimary: boolean;
  notifyOnRelease: boolean;
}

export type ChecklistPhase = "immediate" | "day1" | "week1" | "month1" | "ongoing";

export interface ChecklistTask {
  id: string;
  phase: ChecklistPhase;
  title: string;
  description: string;
  templateId?: string;
  relatedItemIds: string[];
  completed: boolean;
  notes: string;
  estimatedMinutes: number;
}

export interface PromptDef {
  id: string;
  category: VaultCategory;
  question: string;
  help?: string;
  itemType: VaultItemType;
  fieldHints: string[];
}

export interface VaultState {
  version: number;
  onboardingComplete: boolean;
  ownerName: string;
  contacts: DesignatedContact[];
  items: VaultItem[];
  answeredPromptIds: string[];
  currentPromptIndex: number;
  releaseTriggered: boolean;
  releasedAt?: string;
  checklist: ChecklistTask[];
  referralShared: boolean;
}
