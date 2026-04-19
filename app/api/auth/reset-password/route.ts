import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "password_too_short" }, { status: 400 })
    }

    // Validate token
    const tokens = await query<any[]>(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at
       FROM password_reset_tokens prt
       WHERE prt.token = ? LIMIT 1`,
      [token]
    )

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 })
    }

    const resetToken = tokens[0]

    if (resetToken.used_at) {
      return NextResponse.json({ error: "token_used" }, { status: 400 })
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ error: "token_expired" }, { status: 400 })
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update password and mark token used
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, resetToken.user_id])
    await query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?", [resetToken.id])

    // Invalidate all sessions for this user
    await query("DELETE FROM sessions WHERE user_id = ?", [resetToken.user_id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] reset-password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Validate token (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false, error: "No token" }, { status: 400 })
    }

    const tokens = await query<any[]>(
      `SELECT id, expires_at, used_at FROM password_reset_tokens WHERE token = ? LIMIT 1`,
      [token]
    )

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ valid: false, error: "invalid_token" })
    }

    const resetToken = tokens[0]

    if (resetToken.used_at) {
      return NextResponse.json({ valid: false, error: "token_used" })
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "token_expired" })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("[v0] validate-token error:", error)
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 })
  }
}
