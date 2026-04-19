import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getSessionUser(sessionToken)
    if (!user || user.role !== "host") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get host's property IDs
    const properties = await query<{ id: number }[]>(
      "SELECT id FROM properties WHERE host_id = ?",
      [user.id]
    )

    if (!properties.length) {
      return NextResponse.json({ bookings: [] })
    }

    const propertyIds = properties.map((p) => p.id)
    const placeholders = propertyIds.map(() => "?").join(",")

    const bookings = await query<any[]>(
      `SELECT b.id, b.check_in, b.check_out, b.total_price, b.status, b.created_at,
              u.full_name AS guest_name,
              p.title AS property_title
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN properties p ON b.property_id = p.id
       WHERE b.property_id IN (${placeholders})
       ORDER BY b.created_at DESC`,
      propertyIds
    )

    const transformed = bookings.map((b) => ({
      id: b.id,
      guest_name: b.guest_name || "Guest",
      property_title: b.property_title || "Property",
      check_in: b.check_in,
      check_out: b.check_out,
      total_price: b.total_price,
      status: b.status || "pending",
    }))

    return NextResponse.json({ bookings: transformed })
  } catch (error) {
    console.error("Host bookings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
