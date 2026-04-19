import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// GET /api/properties/[id] - Get single property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const properties = await query<any[]>(
      `SELECT 
        p.*,
        w.name_fr as wilaya_name_fr,
        w.name_en as wilaya_name_en,
        w.name_ar as wilaya_name_ar,
        w.code as wilaya_code,
        u.full_name as host_name,
        u.avatar_url as host_avatar,
        u.is_verified as host_verified,
        u.created_at as host_since,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM properties p
      JOIN wilayas w ON p.wilaya_id = w.id
      JOIN users u ON p.host_id = u.id
      LEFT JOIN reviews r ON p.id = r.property_id
      WHERE p.id = ?
      GROUP BY p.id`,
      [id]
    )

    if (!properties || properties.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    const property = properties[0]

    // Get amenities
    const amenities = await query<{ code: string; name_fr: string; name_en: string; name_ar: string; icon: string }[]>(
      `SELECT a.code, a.name_fr, a.name_en, a.name_ar, a.icon 
       FROM amenities a 
       JOIN property_amenities pa ON a.id = pa.amenity_id 
       WHERE pa.property_id = ?`,
      [id]
    )

    // Get images
    const images = await query<{ image_url: string; is_primary: boolean }[]>(
      `SELECT image_url, is_primary FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, sort_order ASC`,
      [id]
    )

    // Get reviews
    const reviews = await query<any[]>(
      `SELECT r.*, u.full_name as guest_name, u.avatar_url as guest_avatar
       FROM reviews r
       JOIN users u ON r.guest_id = u.id
       WHERE r.property_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    )

    // Get host's other properties count
    const hostPropertiesCount = await query<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM properties WHERE host_id = ? AND status = 'active'`,
      [property.host_id]
    )

    const primaryImage = images.find((i) => i.is_primary)?.image_url || images[0]?.image_url || null

    return NextResponse.json({
      property: {
        ...property,
        // Normalized fields expected by the UI
        title: property.title_fr || property.title_en || "Sans titre",
        description: property.description_fr || property.description_en || "",
        type: property.property_type,
        location: property.city,
        wilaya: property.wilaya_name_fr,
        price: Number(property.price_per_night) || 0,
        guests: property.max_guests || 1,
        rating: Number(property.avg_rating) || 0,
        reviewCount: Number(property.review_count) || 0,
        image: primaryImage,
        // Structured amenities + raw list for icon mapping
        amenities: amenities.map((a) => a.code),
        amenities_detail: amenities,
        images: images.map((i) => i.image_url),
        reviews: reviews.map((r) => ({
          ...r,
          user_name: r.guest_name || "Voyageur",
        })),
        host_properties_count: hostPropertiesCount[0]?.count || 0,
      },
    })
  } catch (error) {
    console.error("Property detail API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id] - Update property
export async function PUT(
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

    // Check ownership
    const properties = await query<{ host_id: number }[]>(
      "SELECT host_id FROM properties WHERE id = ?",
      [id]
    )

    if (!properties || properties.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    if (properties[0].host_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    // Build update query dynamically
    const allowedFields = [
      "title_fr", "title_en", "title_ar",
      "description_fr", "description_en", "description_ar",
      "property_type", "address", "city", "wilaya_id",
      "lat", "lng", "price_per_night",
      "bedrooms", "bathrooms", "max_guests", "area_sqm"
    ]

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

    // Update amenities if provided
    if (data.amenities) {
      await query("DELETE FROM property_amenities WHERE property_id = ?", [id])
      for (const amenityCode of data.amenities) {
        const amenityRows = await query<{ id: number }[]>(
          "SELECT id FROM amenities WHERE code = ?",
          [amenityCode]
        )
        if (amenityRows.length > 0) {
          await query(
            "INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)",
            [id, amenityRows[0].id]
          )
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update property API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id] - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const properties = await query<{ host_id: number }[]>(
      "SELECT host_id FROM properties WHERE id = ?",
      [id]
    )

    if (!properties || properties.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    if (properties[0].host_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    await query("DELETE FROM properties WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete property API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
