export type UserRole = "user" | "pro" | "admin";

export function getUserRole(): UserRole {
  const role = localStorage.getItem("user_role");
  if (role === "pro" || role === "admin") {
    return role;
  }
  return "user";
}

export function isAdmin(): boolean {
  return getUserRole() === "admin";
}

export function isPro(): boolean {
  const role = getUserRole();
  return role === "pro" || role === "admin";
}
