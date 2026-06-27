export type UserRole = "owner" | "admin" | "member";

export type UsersProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  country: string;
  created_at: string;
};

export type UsersProfileInsert = Pick<
  UsersProfile,
  "user_id" | "full_name" | "email"
> &
  Partial<Pick<UsersProfile, "role" | "country">>;

export type UsersProfileUpdate = Partial<
  Pick<UsersProfile, "full_name" | "email" | "role" | "country">
>;

export const USERS_PROFILE_TABLE = "users_profile" as const;
