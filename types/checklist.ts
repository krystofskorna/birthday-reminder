// Checklist types for Celebration Checklists feature

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  items: { id?: string; text: string }[]; // Template items - id is optional, text is required
}

export interface Checklist {
  items: ChecklistItem[];
  templateId?: string; // Reference to template if created from one
}

