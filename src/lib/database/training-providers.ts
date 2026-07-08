export type TrainingProviderStatus = "active" | "suspended";

export type TrainingProvider = {
  id: string;
  user_id: string;
  business_id: string | null;
  display_name: string;
  bio: string;
  status: TrainingProviderStatus;
  created_at: string;
};

export type TrainingProviderInsert = Pick<TrainingProvider, "user_id"> &
  Partial<Pick<TrainingProvider, "business_id" | "display_name" | "bio" | "status">>;

export type TrainingProviderUpdate = Partial<
  Pick<TrainingProvider, "display_name" | "bio" | "status" | "business_id">
>;

export const TRAINING_PROVIDERS_TABLE = "training_providers" as const;
