export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "teacher" | "admin";
  createdAt: string;
}
