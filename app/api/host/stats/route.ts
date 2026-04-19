import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "host") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get host's properties
    const properties = await query<{ id: number; rating: number; status: string }[]>(
      "SELECT id, rating, status FROM properties WHERE host_id = ?",
      [user.id]
    )

    const totalProperties = properties.filter((p) => p.status === "active").length
    const propertyIds = properties.map((p) => p.id)

    // Average rating
    const ratings = properties.filter((p) => p.rating).map((p) => Number(p.rating))
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0

    let totalRevenue = 0
    let activeBookings = 0

    if (propertyIds.length > 0) {
      const placeholders = propertyIds.map(() => "?").join(",")
      const bookings = await query<{ total_price: number; status: string }[]>(
        `SELECT total_price, status FROM bookings WHERE property_id IN (${placeholders})`,
        propertyIds
      )
      totalRevenue = bookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + Number(b.total_price || 0), 0)
      activeBookings = bookings.filter(
        (b) => b.status === "confirmed" || b.status === "pending"
      ).length
    }

    return NextResponse.json({ totalRevenue, activeBookings, averageRating, totalProperties })
  } catch (error) {
    console.error("Host stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
