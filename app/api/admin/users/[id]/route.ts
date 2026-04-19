import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// PATCH /api/admin/users/[id] - Update user (verify, change role, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    const allowedFields = ["role", "is_verified", "verification_status"]
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
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin update user API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Don't allow deleting self
    if (parseInt(id) === user.id) {
      return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 })
    }

    await query("DELETE FROM users WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete user API error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
