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

    // Get host's properties
    const { data: properties } = await supabase
      .from("properties")
      .select("id, rating, status")
      .eq("host_id", session.user_id)

    const totalProperties = properties?.filter((p) => p.status === "active").length || 0
    const propertyIds = properties?.map((p) => p.id) || []

    // Calculate average rating
    const ratings = properties?.filter((p) => p.rating).map((p) => p.rating) || []
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : 0

    // Get bookings stats
    let totalRevenue = 0
    let activeBookings = 0

    if (propertyIds.length > 0) {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("total_price, status")
        .in("property_id", propertyIds)

      if (bookings) {
        totalRevenue = bookings
          .filter((b) => b.status === "confirmed")
          .reduce((sum, b) => sum + (b.total_price || 0), 0)

        activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length
      }
    }

    return NextResponse.json({
      totalRevenue,
      activeBookings,
      averageRating,
      totalProperties,
    })
  } catch (error) {
    console.error("Host stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
