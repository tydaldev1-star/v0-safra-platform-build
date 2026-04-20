import type { Metadata } from "next"
import { Inter, DM_Sans, Cairo } from "next/font/google"
import { I18nProvider } from "@/lib/i18n-context"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
      <body className={`${inter.variable} ${dmSans.variable} ${cairo.variable} font-sans antialiased`}>
        <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
