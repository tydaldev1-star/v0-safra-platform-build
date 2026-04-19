import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { sendEmail, generateOTP, getOTPEmailTemplate } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, locale } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if pending registration exists
    const pendingResults = await query(
      "SELECT * FROM pending_registrations WHERE email = ?",
      [email]
    )

    if (!Array.isArray(pendingResults) || pendingResults.length === 0) {
      return NextResponse.json(
        { error: "No pending registration found for this email" },
        { status: 400 }
      )
    }

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update pending registration with new OTP
    await query(
      "UPDATE pending_registrations SET otp_code = ?, expires_at = ? WHERE email = ?",
      [otp, expiresAt, email]
    )

    // Send OTP email
    const emailTemplate = getOTPEmailTemplate(otp, locale || "fr")
    const emailResult = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "New verification code sent",
    })
  } catch (error) {
    console.error("Resend OTP error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
