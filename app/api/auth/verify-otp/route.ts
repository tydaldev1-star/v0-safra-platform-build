import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { createSession } from "@/lib/auth"
import { sendEmail, getWelcomeEmailTemplate } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      )
    }

    // Find pending registration
    const pendingResults = await query(
      `SELECT * FROM pending_registrations 
       WHERE email = ? AND otp_code = ? AND expires_at > NOW()`,
      [email, otp]
    )

    if (!Array.isArray(pendingResults) || pendingResults.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      )
    }

    const pending = pendingResults[0] as {
      email: string
      password_hash: string
      full_name: string
      phone: string | null
      role: string
      locale: string
    }

    // Create user account
    const insertResult = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, verification_status)
       VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
      [
        pending.email,
        pending.password_hash,
        pending.full_name,
        pending.phone,
        pending.role,
        pending.role === "host" ? "pending" : "approved",
      ]
    )

    const userId = (insertResult as { insertId: number }).insertId

    // Delete pending registration
    await query(
      "DELETE FROM pending_registrations WHERE email = ?",
      [email]
    )

    // Create session
    const sessionToken = await createSession(userId)

    // Send welcome email
    const welcomeTemplate = getWelcomeEmailTemplate(pending.full_name, pending.locale)
    sendEmail({
      to: pending.email,
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html,
    }).catch((err) => console.error("Welcome email error:", err))

    // Get the created user
    const userResults = await query(
      "SELECT id, email, full_name, phone, role, avatar_url, is_verified, verification_status FROM users WHERE id = ?",
      [userId]
    )

    const user = (userResults as unknown[])[0]

    const response = NextResponse.json({
      success: true,
      user,
      message: "Account created successfully",
    })

    // Set session cookie
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
