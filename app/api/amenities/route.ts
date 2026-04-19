import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const amenities = await query<any[]>(
      "SELECT id, code, name_fr, name_en, name_ar, icon FROM amenities ORDER BY name_fr ASC"
    )
    return NextResponse.json({ amenities })
  } catch (error) {
    console.error("[v0] Amenities error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
