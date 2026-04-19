import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// GET /api/bookings - List user's bookings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") || "guest" // guest or host
    const status = searchParams.get("status")

    let sql = `
      SELECT 
        b.*,
        p.title_fr as property_title,
        p.city as property_city,
        p.address as property_address,
        w.name_fr as wilaya_name,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as property_image,
        guest.full_name as guest_name,
        guest.email as guest_email,
        guest.phone as guest_phone,
        host.full_name as host_name,
        host.phone as host_phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN wilayas w ON p.wilaya_id = w.id
      JOIN users guest ON b.guest_id = guest.id
      JOIN users host ON p.host_id = host.id
      WHERE 1=1
    `

    const params: (string | number)[] = []

    if (role === "guest") {
      sql += " AND b.guest_id = ?"
      params.push(user.id)
    } else if (role === "host") {
      sql += " AND p.host_id = ?"
      params.push(user.id)
    }

    if (status) {
      sql += " AND b.status = ?"
      params.push(status)
    }

    sql += " ORDER BY b.created_at DESC"

    const bookings = await query<any[]>(sql, params)

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Bookings API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const {
      property_id,
      check_in,
      check_out,
      guests_count,
      payment_method,
      special_requests,
    } = data

    if (!property_id || !check_in || !check_out || !guests_count) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 })
    }

    // Get property details and calculate price
    const properties = await query<{ price_per_night: number; max_guests: number; host_id: number; status: string }[]>(
      "SELECT price_per_night, max_guests, host_id, status FROM properties WHERE id = ?",
      [property_id]
    )

    if (!properties || properties.length === 0) {
      return NextResponse.json({ error: "property_not_found" }, { status: 404 })
    }

    const property = properties[0]

    if (property.status !== "active") {
      return NextResponse.json({ error: "property_not_available" }, { status: 400 })
    }

    if (guests_count > property.max_guests) {
      return NextResponse.json({ error: "too_many_guests" }, { status: 400 })
    }

    // Check for overlapping bookings
    const overlapping = await query<{ id: number }[]>(
      `SELECT id FROM bookings 
       WHERE property_id = ? 
       AND status IN ('pending', 'confirmed')
       AND ((check_in <= ? AND check_out > ?) OR (check_in < ? AND check_out >= ?) OR (check_in >= ? AND check_out <= ?))`,
      [property_id, check_in, check_in, check_out, check_out, check_in, check_out]
    )

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json({ error: "dates_unavailable" }, { status: 400 })
    }

    // Calculate total price
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const subtotal = property.price_per_night * nights
    const serviceFee = subtotal * 0.1 // 10% service fee
    const totalPrice = subtotal + serviceFee

    // Create booking
    const result = await query<{ insertId: number }>(
      `INSERT INTO bookings (
        property_id, guest_id, check_in, check_out, guests_count,
        total_price, service_fee, payment_method, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        property_id, user.id, check_in, check_out, guests_count,
        totalPrice, serviceFee, payment_method || "cash", special_requests || null
      ]
    )

    const bookingId = (result as any).insertId

    return NextResponse.json({
      success: true,
      bookingId,
      totalPrice,
      serviceFee,
      nights,
    })
  } catch (error) {
    console.error("Create booking API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
