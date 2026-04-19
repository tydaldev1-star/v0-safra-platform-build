import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { I18nProvider } from "@/lib/i18n-context"
import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
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
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
