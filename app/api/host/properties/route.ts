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
      `SELECT p.id, p.title_fr, p.city, w.name_fr AS wilaya, p.property_type, p.price_per_night,
              p.status, p.created_at,
              COALESCE(AVG(r.rating), 0) AS avg_rating,
              COUNT(DISTINCT r.id) AS review_count,
              (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS image
       FROM properties p
       JOIN wilayas w ON p.wilaya_id = w.id
       LEFT JOIN reviews r ON r.property_id = p.id
       WHERE p.host_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [user.id]
    )

    const transformed = properties.map((p) => ({
      id: p.id,
      title: p.title_fr,
      location: p.city,
      wilaya: p.wilaya,
      type: p.property_type,
      price: Number(p.price_per_night),
      rating: Number(p.avg_rating) || 0,
      reviewCount: Number(p.review_count) || 0,
      image: p.image || "/images/property-1.jpg",
      status: p.status || "pending",
    }))

    return NextResponse.json({ properties: transformed })
  } catch (error) {
    console.error("Host properties error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
