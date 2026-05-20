import { NextResponse } from "next/server"
import { client } from "@/lib/sanity"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const artists = await client.fetch(
      `*[_type == "artist"] | order(name.zh asc, name.en asc){
        _id,
        name
      }`
    )

    return NextResponse.json({ success: true, artists })
  } catch (error) {
    console.error("Fetch artists error:", error)
    return NextResponse.json(
      { success: false, error: "Could not load artists." },
      { status: 500 }
    )
  }
}
