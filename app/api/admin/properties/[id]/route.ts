import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// PATCH /api/admin/properties/[id] - Update property status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    const allowedFields = ["status", "is_featured"]
    const updates: string[] = []
    const values: any[] = []

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`)
        values.push(data[field])
      }
    }

    if (updates.length > 0) {
      values.push(id)
      await query(
        `UPDATE properties SET ${updates.join(", ")} WHERE id = ?`,
        values
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin update property API error:", error)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}

// DELETE /api/admin/properties/[id] - Delete a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }
    const { id } = await params
    // Check for active bookings first
    const activeBookings = await query<any[]>(
      "SELECT id FROM bookings WHERE property_id = ? AND status IN ('pending','confirmed')",
      [id]
    )
    if (activeBookings.length > 0) {
      return NextResponse.json({ error: "active_bookings", message: "Des réservations actives existent pour cette annonce." }, { status: 400 })
    }
    await query("DELETE FROM properties WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete property API error:", error)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
