import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
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
      `SELECT b.id, b.check_in, b.check_out, b.total_price, b.status, b.guests_count,
              b.payment_status, b.created_at,
              u.full_name AS guest_name, u.phone AS guest_phone, u.email AS guest_email,
              p.title_fr AS property_title,
              (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC LIMIT 1) AS property_image
       FROM bookings b
       JOIN users u ON b.guest_id = u.id
       JOIN properties p ON b.property_id = p.id
       WHERE b.property_id IN (${placeholders})
       ORDER BY b.created_at DESC`,
      propertyIds
    )

    const transformed = bookings.map((b) => ({
      id: b.id,
      guest_name: b.guest_name || "Voyageur",
      guest_phone: b.guest_phone || "",
      guest_email: b.guest_email || "",
      property_title: b.property_title || "Logement",
      property_image: b.property_image || null,
      check_in: b.check_in,
      check_out: b.check_out,
      guests_count: b.guests_count || 1,
      total_price: Number(b.total_price) || 0,
      payment_status: b.payment_status || "pending",
      status: b.status || "pending",
      created_at: b.created_at,
    }))

    return NextResponse.json({ bookings: transformed })
  } catch (error) {
    console.error("Host bookings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
