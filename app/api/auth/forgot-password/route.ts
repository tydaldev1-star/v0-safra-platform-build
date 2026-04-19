import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Check user exists
    const users = await query<any[]>(
      "SELECT id, full_name, email FROM users WHERE email = ? LIMIT 1",
      [email]
    )

    // Always return success to prevent email enumeration
    if (!users || users.length === 0) {
      return NextResponse.json({ success: true })
    }

    const user = users[0]

    // Invalidate old tokens
    await query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
      [user.id]
    )

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, token, expiresAt]
    )

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`

    // Send reset email
    await sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe – Safra",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="background: #2D4A8A; padding: 32px; text-align: center;">
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO%20%281%29-46P3pSQI4Bez4mG8raNHkmIAi5t5Dz.png" alt="Safra" style="height: 52px; width: auto;" />
            </div>
            <div style="padding: 36px 32px;">
              <h2 style="color: #2D4A8A; margin: 0 0 8px;">Réinitialiser votre mot de passe</h2>
              <p style="color: #666; margin: 0 0 24px; font-size: 15px;">Bonjour ${user.full_name},</p>
              <p style="color: #444; margin: 0 0 28px; line-height: 1.6;">
                Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Safra.<br/>
                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien expire dans <strong>1 heure</strong>.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background: #F4872A; color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              <p style="color: #888; font-size: 13px; margin: 24px 0 0; border-top: 1px solid #eee; padding-top: 20px;">
                Si vous n'avez pas demandé la réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] forgot-password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
