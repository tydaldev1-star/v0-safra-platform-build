import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get current user session
    const sessionToken = cookieStore.get("session_token")?.value
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from session
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get host properties
    const { data: properties, error } = await supabase
      .from("properties")
      .select("*")
      .eq("host_id", session.user_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching host properties:", error)
      return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
    }

    // Transform data
    const transformedProperties = properties.map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      wilaya: p.wilaya,
      type: p.type,
      price: p.price,
      rating: p.rating || 4.8,
      reviewCount: p.review_count || 0,
      image: p.image_url || "/images/property-1.jpg",
      status: p.status || "pending",
    }))

    return NextResponse.json({ properties: transformedProperties })
  } catch (error) {
    console.error("Host properties error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
