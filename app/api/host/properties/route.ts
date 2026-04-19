import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "host") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const properties = await query<any[]>(
      `SELECT p.id, p.title, p.location, p.wilaya, p.type, p.price,
              p.rating, p.review_count, p.status, p.created_at,
              (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS image
       FROM properties p
       WHERE p.host_id = ?
       ORDER BY p.created_at DESC`,
      [user.id]
    )

    const transformed = properties.map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      wilaya: p.wilaya,
      type: p.type,
      price: p.price,
      rating: p.rating || 0,
      reviewCount: p.review_count || 0,
      image: p.image || "/images/property-1.jpg",
      status: p.status || "pending",
    }))

    return NextResponse.json({ properties: transformed })
  } catch (error) {
    console.error("Host properties error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
