import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query, transaction } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "host" && user.role !== "admin")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title_fr, title_en, title_ar,
      description_fr, description_en, description_ar,
      property_type, address, city, wilaya_id,
      lat, lng, price_per_night,
      bedrooms, bathrooms, max_guests, area_sqm,
      amenities, images,
    } = body

    // Validate required fields
    if (!title_fr || !property_type || !address || !city || !wilaya_id || !lat || !lng || !price_per_night) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 })
    }

    const propertyId = await transaction(async (conn) => {
      // Insert property
      const [result]: any = await conn.execute(
        `INSERT INTO properties
          (host_id, title_fr, title_en, title_ar,
           description_fr, description_en, description_ar,
           property_type, address, city, wilaya_id,
           lat, lng, price_per_night,
           bedrooms, bathrooms, max_guests, area_sqm, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          user.id,
          title_fr, title_en || null, title_ar || null,
          description_fr || null, description_en || null, description_ar || null,
          property_type, address, city, wilaya_id,
          lat, lng, price_per_night,
          bedrooms || 1, bathrooms || 1, max_guests || 2, area_sqm || null,
        ]
      )
      const newId = result.insertId

      // Insert images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await conn.execute(
            `INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)`,
            [newId, images[i], i === 0 ? 1 : 0, i]
          )
        }
      }

      // Insert amenities
      if (amenities && amenities.length > 0) {
        for (const amenityId of amenities) {
          await conn.execute(
            `INSERT IGNORE INTO property_amenities (property_id, amenity_id) VALUES (?, ?)`,
            [newId, amenityId]
          )
        }
      }

      return newId
    })

    return NextResponse.json({ success: true, propertyId })
  } catch (error: any) {
    console.error("[v0] New listing error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
