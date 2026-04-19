import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "host" && user.role !== "admin")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const docType = formData.get("doc_type") as string | null

    if (!file || !docType) {
      return NextResponse.json({ error: "Fichier ou type manquant." }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Type de fichier non autorisé. Utilisez JPG, PNG, WEBP ou PDF." }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Le fichier ne doit pas dépasser 10 Mo." }, { status: 400 })
    }

    // Save file to public/uploads/documents/
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${user.id}_${docType}_${Date.now()}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents")
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(path.join(uploadDir, filename), buffer)

    const fileUrl = `/uploads/documents/${filename}`

    // Update user record based on doc type
    if (docType === "id_doc") {
      await query(
        "UPDATE users SET id_document_url = ?, verification_status = 'pending' WHERE id = ?",
        [fileUrl, user.id]
      )
    }

    return NextResponse.json({ success: true, url: fileUrl, doc_type: docType })
  } catch (error: any) {
    console.error("[v0] Document upload error:", error)
    return NextResponse.json({ error: "Erreur lors du téléchargement." }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const [userData] = await query<any[]>(
      "SELECT id_document_url, verification_status, is_verified FROM users WHERE id = ?",
      [user.id]
    )

    return NextResponse.json({
      id_document_url: userData?.id_document_url || null,
      verification_status: userData?.verification_status || "pending",
      is_verified: userData?.is_verified || false,
    })
  } catch (error) {
    console.error("[v0] Document fetch error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
