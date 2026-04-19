import nodemailer from "nodemailer"

// Debug: Log SMTP config on module load
console.log("[v0] SMTP_USER:", process.env.SMTP_USER || "NOT SET")
console.log("[v0] SMTP_PASSWORD length:", process.env.SMTP_PASSWORD?.length || 0)
console.log("[v0] SMTP_HOST:", process.env.SMTP_HOST || "NOT SET")

// SMTP Configuration from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
  const fromName = process.env.SMTP_FROM_NAME || "Safra"

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// OTP Email Template
export function getOTPEmailTemplate(otp: string, locale: string = "fr") {
  const translations = {
    fr: {
      subject: "Code de vérification Safra",
      title: "Vérifiez votre adresse email",
      greeting: "Bonjour,",
      message: "Votre code de vérification pour Safra est :",
      warning: "Ce code expire dans 10 minutes. Ne partagez jamais ce code avec personne.",
      footer: "Si vous n'avez pas demandé ce code, ignorez cet email.",
      team: "L'équipe Safra",
    },
    en: {
      subject: "Safra Verification Code",
      title: "Verify your email address",
      greeting: "Hello,",
      message: "Your Safra verification code is:",
      warning: "This code expires in 10 minutes. Never share this code with anyone.",
      footer: "If you didn't request this code, please ignore this email.",
      team: "The Safra Team",
    },
    ar: {
      subject: "رمز التحقق من صفرة",
      title: "تحقق من بريدك الإلكتروني",
      greeting: "مرحبا،",
      message: "رمز التحقق الخاص بك لـ صفرة هو:",
      warning: "ينتهي هذا الرمز خلال 10 دقائق. لا تشارك هذا الرمز مع أي شخص.",
      footer: "إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.",
      team: "فريق صفرة",
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.fr
  const direction = locale === "ar" ? "rtl" : "ltr"

  return {
    subject: t.subject,
    html: `
<!DOCTYPE html>
<html dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2D4A8A 0%, #1e3a6e 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px;">SAFRA</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">Location de Vacances</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #2D4A8A; font-size: 20px; font-weight: 600;">${t.title}</h2>
              <p style="margin: 0 0 24px; color: #555; font-size: 15px; line-height: 1.6;">${t.greeting}<br>${t.message}</p>
              <!-- OTP Code -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: 700; color: #2D4A8A; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
              <p style="margin: 24px 0 0; color: #888; font-size: 13px; line-height: 1.5; padding: 16px; background-color: #fff8e6; border-radius: 8px; border-left: 4px solid #F4872A;">
                ${t.warning}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px; color: #888; font-size: 12px;">${t.footer}</p>
              <p style="margin: 0; color: #2D4A8A; font-size: 13px; font-weight: 600;">${t.team}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }
}

// Welcome Email Template
export function getWelcomeEmailTemplate(fullName: string, locale: string = "fr") {
  const translations = {
    fr: {
      subject: "Bienvenue sur Safra !",
      title: "Bienvenue sur Safra",
      greeting: `Bonjour ${fullName},`,
      message: "Votre compte a été créé avec succès. Vous pouvez maintenant explorer des milliers de logements à travers l'Algérie.",
      cta: "Découvrir les logements",
      footer: "Merci de faire confiance à Safra pour vos vacances.",
      team: "L'équipe Safra",
    },
    en: {
      subject: "Welcome to Safra!",
      title: "Welcome to Safra",
      greeting: `Hello ${fullName},`,
      message: "Your account has been successfully created. You can now explore thousands of properties across Algeria.",
      cta: "Discover properties",
      footer: "Thank you for choosing Safra for your holidays.",
      team: "The Safra Team",
    },
    ar: {
      subject: "مرحبا بك في صفرة!",
      title: "مرحبا بك في صفرة",
      greeting: `مرحبا ${fullName}،`,
      message: "تم إنشاء حسابك بنجاح. يمكنك الآن استكشاف آلاف العقارات في جميع أنحاء الجزائر.",
      cta: "اكتشف العقارات",
      footer: "شكرا لاختيارك صفرة لعطلاتك.",
      team: "فريق صفرة",
    },
  }

  const t = translations[locale as keyof typeof translations] || translations.fr
  const direction = locale === "ar" ? "rtl" : "ltr"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://safra.dz"

  return {
    subject: t.subject,
    html: `
<!DOCTYPE html>
<html dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2D4A8A 0%, #1e3a6e 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px;">SAFRA</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">Location de Vacances</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #2D4A8A; font-size: 20px; font-weight: 600;">${t.title}</h2>
              <p style="margin: 0 0 24px; color: #555; font-size: 15px; line-height: 1.6;">${t.greeting}</p>
              <p style="margin: 0 0 32px; color: #555; font-size: 15px; line-height: 1.6;">${t.message}</p>
              <a href="${baseUrl}/search" style="display: inline-block; background-color: #F4872A; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">${t.cta}</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px; color: #888; font-size: 12px;">${t.footer}</p>
              <p style="margin: 0; color: #2D4A8A; font-size: 13px; font-weight: 600;">${t.team}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }
}
