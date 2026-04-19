import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Cairo } from "next/font/google"
import { I18nProvider } from "@/lib/i18n-context"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Safra – Location de logements en Algérie",
  description:
    "Trouvez et réservez des logements uniques en Algérie. Appartements, villas, chalets et plus encore.",
  keywords: ["logement algérie", "location vacances", "réservation algérie", "safra"],
  openGraph: {
    title: "Safra – Location de logements en Algérie",
    description: "Trouvez et réservez des logements uniques en Algérie.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="bg-background">
      <body className={`${plusJakartaSans.variable} ${cairo.variable} font-sans antialiased`}>
        <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
