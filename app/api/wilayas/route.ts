import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/wilayas - List all wilayas
export async function GET() {
  try {
    const wilayas = await query<any[]>(
      `SELECT 
        w.*,
        COUNT(DISTINCT p.id) as property_count
       FROM wilayas w
       LEFT JOIN properties p ON w.id = p.wilaya_id AND p.status = 'active'
       GROUP BY w.id
       ORDER BY w.name_fr ASC`
    )

    return NextResponse.json({ wilayas })
  } catch (error) {
    console.error("Wilayas API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
