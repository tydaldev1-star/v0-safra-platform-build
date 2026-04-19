import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { query } from "./db"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: number
  email: string
  full_name: string
  phone: string | null
  role: "guest" | "host" | "admin"
  avatar_url: string | null
  is_verified: boolean
  verification_status: "pending" | "approved" | "rejected"
  created_at: Date
}

export interface Session {
  id: string
  user_id: number
  expires_at: Date
}

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create session
export async function createSession(userId: number): Promise<string> {
  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await query(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    [sessionId, userId, expiresAt]
  )

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return sessionId
}

// Get current session
export async function getSession(): Promise<{ user: User; session: Session } | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) return null

  const sessions = await query<Session[]>(
    "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()",
    [sessionId]
  )

  if (!sessions || sessions.length === 0) return null

  const session = sessions[0]

  const users = await query<User[]>(
    "SELECT id, email, full_name, phone, role, avatar_url, is_verified, verification_status, created_at FROM users WHERE id = ?",
    [session.user_id]
  )

  if (!users || users.length === 0) return null

  return { user: users[0], session }
}

// Get current user (convenience function)
export async function getCurrentUser(): Promise<User | null> {
  const result = await getSession()
  return result?.user || null
}

// Logout / destroy session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (sessionId) {
    await query("DELETE FROM sessions WHERE id = ?", [sessionId])
    cookieStore.delete("session_id")
  }
}

// Register user
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: "guest" | "host"
): Promise<{ success: boolean; error?: string; userId?: number }> {
  try {
    // Check if user exists
    const existing = await query<{ id: number }[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    )

    if (existing && existing.length > 0) {
      return { success: false, error: "email_exists" }
    }

    const passwordHash = await hashPassword(password)

    const result = await query<{ insertId: number }>(
      "INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)",
      [email, passwordHash, fullName, phone, role]
    )

    return { success: true, userId: (result as any).insertId }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "server_error" }
  }
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const users = await query<(User & { password_hash: string })[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )

    if (!users || users.length === 0) {
      return { success: false, error: "invalid_credentials" }
    }

    const user = users[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return { success: false, error: "invalid_credentials" }
    }

    // Create session
    await createSession(user.id)

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword as User }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "server_error" }
  }
}
