import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/personas - Fetch all personas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const personas = await db.persona.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return NextResponse.json(personas);
  } catch (error) {
    console.error("Error fetching personas:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 }
    );
  }
}

// POST /api/admin/personas - Create a new persona
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, role, profileImageUrl, moreInfoText, externalLinks, displayOrder } = body;

    if (!name || !bio || !role) {
      return NextResponse.json(
        { error: "Name, bio, and role are required" },
        { status: 400 }
      );
    }

    const persona = await db.persona.create({
      data: {
        name,
        bio,
        role,
        profileImageUrl: profileImageUrl || null,
        moreInfoText: moreInfoText || null,
        externalLinks: externalLinks ? JSON.stringify(externalLinks) : null,
        displayOrder: displayOrder || 0,
        isActive: true,
      },
    });

    return NextResponse.json(persona);
  } catch (error) {
    console.error("Error creating persona:", error);
    return NextResponse.json(
      { error: "Failed to create persona" },
      { status: 500 }
    );
  }
}
