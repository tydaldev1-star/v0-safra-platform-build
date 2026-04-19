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

    // Get host's properties first
    const { data: properties } = await supabase
      .from("properties")
      .select("id")
      .eq("host_id", session.user_id)

    if (!properties || properties.length === 0) {
      return NextResponse.json({ bookings: [] })
    }

    const propertyIds = properties.map((p) => p.id)

    // Get bookings for host's properties
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        check_in,
        check_out,
        total_price,
        status,
        users!bookings_user_id_fkey(full_name),
        properties!bookings_property_id_fkey(title)
      `)
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching host bookings:", error)
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }

    // Transform data
    const transformedBookings = (bookings || []).map((b: any) => ({
      id: b.id,
      guest_name: b.users?.full_name || "Guest",
      property_title: b.properties?.title || "Property",
      check_in: b.check_in,
      check_out: b.check_out,
      total_price: b.total_price,
      status: b.status || "pending",
    }))

    return NextResponse.json({ bookings: transformedBookings })
  } catch (error) {
    console.error("Host bookings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
