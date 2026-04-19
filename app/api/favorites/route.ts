import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// GET /api/favorites - List user's favorites
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const favorites = await query<any[]>(
      `SELECT 
        p.*,
        w.name_fr as wilaya_name_fr,
        w.name_en as wilaya_name_en,
        w.name_ar as wilaya_name_ar,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
       FROM favorites f
       JOIN properties p ON f.property_id = p.id
       JOIN wilayas w ON p.wilaya_id = w.id
       LEFT JOIN reviews r ON p.id = r.property_id
       WHERE f.user_id = ? AND p.status = 'active'
       GROUP BY p.id
       ORDER BY f.created_at DESC`,
      [user.id]
    )

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("Favorites API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}

// POST /api/favorites - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { property_id } = await request.json()

    if (!property_id) {
      return NextResponse.json({ error: "missing_property_id" }, { status: 400 })
    }

    // Check if already favorited
    const existing = await query<{ user_id: number }[]>(
      "SELECT user_id FROM favorites WHERE user_id = ? AND property_id = ?",
      [user.id, property_id]
    )

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, message: "already_favorited" })
    }

    await query(
      "INSERT INTO favorites (user_id, property_id) VALUES (?, ?)",
      [user.id, property_id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add favorite API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("property_id")

    if (!propertyId) {
      return NextResponse.json({ error: "missing_property_id" }, { status: 400 })
    }

    await query(
      "DELETE FROM favorites WHERE user_id = ? AND property_id = ?",
      [user.id, propertyId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove favorite API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
