import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// GET /api/bookings/[id] - Get single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const bookings = await query<any[]>(
      `SELECT 
        b.*,
        p.id as property_id,
        p.title_fr as property_title,
        p.city as property_city,
        p.address as property_address,
        p.lat as property_lat,
        p.lng as property_lng,
        p.price_per_night,
        w.name_fr as wilaya_name,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as property_image,
        guest.full_name as guest_name,
        guest.email as guest_email,
        guest.phone as guest_phone,
        host.id as host_id,
        host.full_name as host_name,
        host.phone as host_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN wilayas w ON p.wilaya_id = w.id
      JOIN users guest ON b.guest_id = guest.id
      JOIN users host ON p.host_id = host.id
      WHERE b.id = ?`,
      [id]
    )

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    const booking = bookings[0]

    // Check authorization
    if (booking.guest_id !== user.id && booking.host_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Booking detail API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const { status, payment_status } = data

    // Get booking with ownership info
    const bookings = await query<{ guest_id: number; host_id: number; status: string }[]>(
      `SELECT b.guest_id, p.host_id, b.status 
       FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       WHERE b.id = ?`,
      [id]
    )

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    const booking = bookings[0]

    // Authorization rules:
    // - Guest can cancel their own booking
    // - Host can confirm or cancel bookings for their properties
    // - Admin can do anything
    const isGuest = booking.guest_id === user.id
    const isHost = booking.host_id === user.id
    const isAdmin = user.role === "admin"

    if (!isGuest && !isHost && !isAdmin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    // Update logic
    const updates: string[] = []
    const values: any[] = []

    if (status) {
      // Validate status transitions
      if (status === "cancelled") {
        if (!isGuest && !isHost && !isAdmin) {
          return NextResponse.json({ error: "cannot_cancel" }, { status: 403 })
        }
      } else if (status === "confirmed") {
        if (!isHost && !isAdmin) {
          return NextResponse.json({ error: "cannot_confirm" }, { status: 403 })
        }
      } else if (status === "completed") {
        if (!isHost && !isAdmin) {
          return NextResponse.json({ error: "cannot_complete" }, { status: 403 })
        }
      }

      updates.push("status = ?")
      values.push(status)
    }

    if (payment_status && (isHost || isAdmin)) {
      updates.push("payment_status = ?")
      values.push(payment_status)
    }

    if (updates.length > 0) {
      values.push(id)
      await query(
        `UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`,
        values
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update booking API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
