import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export interface PropertyRow {
  id: number
  host_id: number
  title_fr: string
  title_en: string | null
  title_ar: string | null
  description_fr: string | null
  description_en: string | null
  description_ar: string | null
  property_type: string
  address: string
  city: string
  wilaya_id: number
  wilaya_name_fr: string
  wilaya_name_en: string
  wilaya_name_ar: string
  lat: number
  lng: number
  price_per_night: number
  bedrooms: number
  bathrooms: number
  max_guests: number
  area_sqm: number | null
  status: string
  is_featured: boolean
  created_at: Date
  avg_rating: number | null
  review_count: number
  primary_image: string | null
  host_name: string
}

// GET /api/properties - List properties with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const wilaya = searchParams.get("wilaya")
    const type = searchParams.get("type")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const guests = searchParams.get("guests")
    const bedrooms = searchParams.get("bedrooms")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const featured = searchParams.get("featured")
    const hostId = searchParams.get("hostId")

    let sql = `
      SELECT 
        p.*,
        w.name_fr as wilaya_name_fr,
        w.name_en as wilaya_name_en,
        w.name_ar as wilaya_name_ar,
        u.full_name as host_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM properties p
      JOIN wilayas w ON p.wilaya_id = w.id
      JOIN users u ON p.host_id = u.id
      LEFT JOIN reviews r ON p.id = r.property_id
      WHERE p.status = 'active'
    `

    const params: (string | number)[] = []

    if (wilaya) {
      sql += " AND w.name_fr LIKE ?"
      params.push(`%${wilaya}%`)
    }

    if (type) {
      sql += " AND p.property_type = ?"
      params.push(type)
    }

    if (minPrice) {
      sql += " AND p.price_per_night >= ?"
      params.push(parseFloat(minPrice))
    }

    if (maxPrice) {
      sql += " AND p.price_per_night <= ?"
      params.push(parseFloat(maxPrice))
    }

    if (guests) {
      sql += " AND p.max_guests >= ?"
      params.push(parseInt(guests))
    }

    if (bedrooms) {
      sql += " AND p.bedrooms >= ?"
      params.push(parseInt(bedrooms))
    }

    if (search) {
      sql += " AND (p.title_fr LIKE ? OR p.title_en LIKE ? OR p.city LIKE ? OR p.address LIKE ?)"
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (featured === "true") {
      sql += " AND p.is_featured = 1"
    }

    if (hostId) {
      sql += " AND p.host_id = ?"
      params.push(parseInt(hostId))
    }

    sql += " GROUP BY p.id ORDER BY p.is_featured DESC, p.created_at DESC"
    sql += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`

    const properties = await query<PropertyRow[]>(sql, params)

    // Get amenities for each property
    const propertiesWithAmenities = await Promise.all(
      properties.map(async (property) => {
        const amenities = await query<{ code: string }[]>(
          `SELECT a.code FROM amenities a 
           JOIN property_amenities pa ON a.id = pa.amenity_id 
           WHERE pa.property_id = ?`,
          [property.id]
        )

        const images = await query<{ image_url: string; is_primary: boolean }[]>(
          `SELECT image_url, is_primary FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, sort_order ASC`,
          [property.id]
        )

        return {
          ...property,
          amenities: amenities.map((a) => a.code),
          images: images.map((i) => i.image_url),
        }
      })
    )

    // Get total count
    let countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM properties p
      JOIN wilayas w ON p.wilaya_id = w.id
      WHERE p.status = 'active'
    `
    // Remove limit/offset params for count query
    const countParams = params.slice(0, -2)
    
    // Rebuild WHERE clauses for count (same conditions as above)
    let countWhere = ""
    let paramIndex = 0
    
    if (wilaya) { countWhere += " AND w.name_fr LIKE ?"; paramIndex++ }
    if (type) { countWhere += " AND p.property_type = ?"; paramIndex++ }
    if (minPrice) { countWhere += " AND p.price_per_night >= ?"; paramIndex++ }
    if (maxPrice) { countWhere += " AND p.price_per_night <= ?"; paramIndex++ }
    if (guests) { countWhere += " AND p.max_guests >= ?"; paramIndex++ }
    if (bedrooms) { countWhere += " AND p.bedrooms >= ?"; paramIndex++ }
    if (search) { countWhere += " AND (p.title_fr LIKE ? OR p.title_en LIKE ? OR p.city LIKE ? OR p.address LIKE ?)"; paramIndex += 4 }
    if (featured === "true") { countWhere += " AND p.is_featured = 1" }
    if (hostId) { countWhere += " AND p.host_id = ?"; paramIndex++ }

    const countResult = await query<{ total: number }[]>(countSql + countWhere, countParams)
    const total = countResult[0]?.total || 0

    const normalized = propertiesWithAmenities.map((p) => ({
      id: p.id,
      host_id: p.host_id,
      title: p.title_fr || p.title_en || "Sans titre",
      title_fr: p.title_fr,
      title_en: p.title_en,
      title_ar: p.title_ar,
      description: p.description_fr || p.description_en || "",
      description_fr: p.description_fr,
      description_en: p.description_en,
      description_ar: p.description_ar,
      type: p.property_type,
      property_type: p.property_type,
      location: p.city,
      address: p.address,
      city: p.city,
      wilaya: p.wilaya_name_fr,
      wilaya_name_fr: p.wilaya_name_fr,
      wilaya_name_en: p.wilaya_name_en,
      wilaya_name_ar: p.wilaya_name_ar,
      wilaya_id: p.wilaya_id,
      lat: p.lat,
      lng: p.lng,
      price: Number(p.price_per_night) || 0,
      price_per_night: Number(p.price_per_night) || 0,
      bedrooms: p.bedrooms || 0,
      bathrooms: p.bathrooms || 0,
      guests: p.max_guests || 1,
      max_guests: p.max_guests || 1,
      area_sqm: p.area_sqm,
      rating: Number(p.avg_rating) || 0,
      avg_rating: Number(p.avg_rating) || 0,
      reviewCount: Number(p.review_count) || 0,
      review_count: Number(p.review_count) || 0,
      image: (p as any).primary_image || (p as any).images?.[0] || null,
      images: (p as any).images || [],
      amenities: (p as any).amenities || [],
      host_name: p.host_name,
      status: p.status,
      is_featured: p.is_featured,
      isNew: new Date(p.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
      created_at: p.created_at,
    }))

    return NextResponse.json({
      properties: normalized,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("[v0] Properties API error:", error?.message || error)
    // Return empty result so the home page still renders without crashing
    return NextResponse.json({ properties: [], total: 0, limit: 20, offset: 0 })
  }
}

// POST /api/properties - Create new property
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    if (user.role !== "host" && user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const data = await request.json()

    const {
      title_fr,
      title_en,
      title_ar,
      description_fr,
      description_en,
      description_ar,
      property_type,
      address,
      city,
      wilaya_id,
      lat,
      lng,
      price_per_night,
      bedrooms,
      bathrooms,
      max_guests,
      area_sqm,
      amenities,
      images,
    } = data

    // Validate required fields
    if (!title_fr || !property_type || !address || !city || !wilaya_id || !lat || !lng || !price_per_night) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 })
    }

    // Insert property
    const result = await query<{ insertId: number }>(
      `INSERT INTO properties (
        host_id, title_fr, title_en, title_ar, description_fr, description_en, description_ar,
        property_type, address, city, wilaya_id, lat, lng, price_per_night,
        bedrooms, bathrooms, max_guests, area_sqm, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        user.id, title_fr, title_en || null, title_ar || null,
        description_fr || null, description_en || null, description_ar || null,
        property_type, address, city, wilaya_id, lat, lng, price_per_night,
        bedrooms || 1, bathrooms || 1, max_guests || 2, area_sqm || null
      ]
    )

    const propertyId = (result as any).insertId

    // Insert amenities
    if (amenities && amenities.length > 0) {
      for (const amenityCode of amenities) {
        const amenityRows = await query<{ id: number }[]>(
          "SELECT id FROM amenities WHERE code = ?",
          [amenityCode]
        )
        if (amenityRows.length > 0) {
          await query(
            "INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)",
            [propertyId, amenityRows[0].id]
          )
        }
      }
    }

    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query(
          "INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)",
          [propertyId, images[i], i === 0, i]
        )
      }
    }

    return NextResponse.json({
      success: true,
      propertyId,
    })
  } catch (error) {
    console.error("Create property API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
