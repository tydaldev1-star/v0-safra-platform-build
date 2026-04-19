import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    let sql = `
      SELECT
        p.id,
        p.title_fr                                                              AS title,
        p.city                                                                  AS location,
        w.name_fr                                                               AS wilaya,
        p.property_type                                                         AS type,
        p.price_per_night                                                       AS price,
        p.status,
        p.is_featured,
        p.created_at,
        u.full_name                                                             AS host_name,
        u.email                                                                 AS host_email,
        u.verification_status                                                   AS host_status,
        COALESCE(AVG(r.rating), 0)                                              AS avg_rating,
        COUNT(DISTINCT r.id)                                                    AS review_count,
        COUNT(DISTINCT b.id)                                                    AS booking_count,
        (SELECT image_url FROM property_images
         WHERE property_id = p.id ORDER BY is_primary DESC LIMIT 1)            AS image
      FROM properties p
      JOIN wilayas  w ON w.id = p.wilaya_id
      JOIN users    u ON u.id = p.host_id
      LEFT JOIN reviews  r ON r.property_id = p.id
      LEFT JOIN bookings b ON b.property_id = p.id
    `
    const params: any[] = []
    const conditions: string[] = []

    if (search) {
      conditions.push("(p.title_fr LIKE ? OR p.city LIKE ? OR u.full_name LIKE ?)")
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    if (status) {
      conditions.push("p.status = ?")
      params.push(status)
    }

    if (conditions.length) sql += " WHERE " + conditions.join(" AND ")
    sql += " GROUP BY p.id ORDER BY p.created_at DESC"

    const rows = await query<any[]>(sql, params)

    const properties = rows.map((p) => ({
      id: p.id,
      title: p.title || "Sans titre",
      location: p.location || "",
      wilaya: p.wilaya || "",
      type: p.type || "",
      price: Number(p.price) || 0,
      status: p.status || "pending",
      is_featured: Boolean(p.is_featured),
      created_at: p.created_at,
      host_name: p.host_name || "",
      host_email: p.host_email || "",
      host_status: p.host_status || "pending",
      avg_rating: Number(p.avg_rating).toFixed(1),
      review_count: Number(p.review_count),
      booking_count: Number(p.booking_count),
      image: p.image || null,
    }))

    return NextResponse.json({ properties })
  } catch (error) {
    console.error("Admin properties API error:", error)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
