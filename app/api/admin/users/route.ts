import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const verificationStatus = searchParams.get("verification_status")

    let sql = `
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.role, 
        u.avatar_url, u.is_verified, u.verification_status,
        u.id_document_url, u.created_at,
        COUNT(DISTINCT p.id) as properties_count,
        COUNT(DISTINCT b.id) as bookings_count
      FROM users u
      LEFT JOIN properties p ON u.id = p.host_id
      LEFT JOIN bookings b ON u.id = b.guest_id
      WHERE 1=1
    `

    const params: string[] = []

    if (role) {
      sql += " AND u.role = ?"
      params.push(role)
    }

    if (verificationStatus) {
      sql += " AND u.verification_status = ?"
      params.push(verificationStatus)
    }

    sql += " GROUP BY u.id ORDER BY u.created_at DESC"

    const users = await query<any[]>(sql, params)

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
