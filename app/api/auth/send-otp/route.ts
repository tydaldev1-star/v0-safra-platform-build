import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { sendEmail, generateOTP, getOTPEmailTemplate } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone, role, locale } = body

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password and full name are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if email already exists in users table
    const existingUser = await query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    )

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Delete any existing pending registration for this email
    await query(
      "DELETE FROM pending_registrations WHERE email = ?",
      [email]
    )

    // Store pending registration with OTP
    await query(
      `INSERT INTO pending_registrations 
        (email, password_hash, full_name, phone, role, locale, otp_code, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        passwordHash,
        fullName,
        phone || null,
        role || "guest",
        locale || "fr",
        otp,
        expiresAt,
      ]
    )

    // Send OTP email
    const emailTemplate = getOTPEmailTemplate(otp, locale || "fr")
    const emailResult = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error)
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      email: email,
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
