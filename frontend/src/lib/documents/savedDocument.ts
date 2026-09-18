export type SavedDocumentSummary = {
  id: number;
  documentType: string;
  createdAt: string;
  updatedAt: string;
};

export type SavedDocument = SavedDocumentSummary & {
  fields: Record<string, unknown>;
};
