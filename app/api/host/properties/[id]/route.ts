import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

// DELETE /api/host/properties/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "host" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const rows = await query<{ host_id: number }[]>(
      "SELECT host_id FROM properties WHERE id = ?",
      [id]
    )
    if (!rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (rows[0].host_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check for active bookings
    const active = await query<{ cnt: number }[]>(
      "SELECT COUNT(*) AS cnt FROM bookings WHERE property_id = ? AND status IN ('pending','confirmed')",
      [id]
    )
    if (active[0]?.cnt > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un logement avec des réservations actives." },
        { status: 409 }
      )
    }

    await query("DELETE FROM properties WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete property error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/host/properties/[id] — toggle status active/inactive
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "host" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const rows = await query<{ host_id: number }[]>(
      "SELECT host_id FROM properties WHERE id = ?",
      [id]
    )
    if (!rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (rows[0].host_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await query("UPDATE properties SET status = ? WHERE id = ?", [status, id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update property error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
