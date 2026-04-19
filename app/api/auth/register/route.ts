import { NextRequest, NextResponse } from "next/server"
import { registerUser, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, role } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "missing_fields" },
        { status: 400 }
      )
    }

    // Validate role
    if (role && !["guest", "host"].includes(role)) {
      return NextResponse.json(
        { error: "invalid_role" },
        { status: 400 }
      )
    }

    const result = await registerUser(
      email,
      password,
      fullName,
      phone || "",
      role || "guest"
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Create session for auto-login
    await createSession(result.userId!)

    return NextResponse.json({
      success: true,
      userId: result.userId,
    })
  } catch (error) {
    console.error("Register API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
