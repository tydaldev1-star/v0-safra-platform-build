import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// GET /api/admin/stats - Get admin dashboard stats
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    // Get various stats
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      pendingHosts,
      pendingProperties,
      recentBookings,
      revenue
    ] = await Promise.all([
      query<{ count: number }[]>("SELECT COUNT(*) as count FROM users"),
      query<{ count: number }[]>("SELECT COUNT(*) as count FROM properties WHERE status = 'active'"),
      query<{ count: number }[]>("SELECT COUNT(*) as count FROM bookings"),
      query<{ count: number }[]>("SELECT COUNT(*) as count FROM users WHERE role = 'host' AND verification_status = 'pending'"),
      query<{ count: number }[]>("SELECT COUNT(*) as count FROM properties WHERE status = 'pending'"),
      query<any[]>(`
        SELECT 
          b.*,
          p.title_fr as property_title,
          guest.full_name as guest_name,
          host.full_name as host_name
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users guest ON b.guest_id = guest.id
        JOIN users host ON p.host_id = host.id
        ORDER BY b.created_at DESC
        LIMIT 10
      `),
      query<{ total: number }[]>(`
        SELECT COALESCE(SUM(service_fee), 0) as total 
        FROM bookings 
        WHERE payment_status = 'paid'
      `)
    ])

    return NextResponse.json({
      totalUsers: totalUsers[0]?.count || 0,
      totalProperties: totalProperties[0]?.count || 0,
      totalBookings: totalBookings[0]?.count || 0,
      pendingHosts: pendingHosts[0]?.count || 0,
      pendingProperties: pendingProperties[0]?.count || 0,
      totalRevenue: Number(revenue[0]?.total) || 0,
      recentBookings,
    })
  } catch (error) {
    console.error("Admin stats API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
