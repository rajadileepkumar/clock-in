export type Role = "ADMIN" | "USER";
export type Status = "Y" | "N";
type User = {
  id: number
  full_name: string
  email: string
  role: Role,
  status: Status, 
  created_at?: string,
  updated_at?: string,
  [key: string]: unknown
}
export type { User }