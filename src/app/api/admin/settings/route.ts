import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/settings - Fetch settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await db.settings.findUnique({
      where: { id: "site" },
    });

    if (!settings) {
      settings = await db.settings.create({
        data: {
          id: "site",
          siteName: "The Artificial Intelligencer",
          tagline: null,
          isPublic: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { siteName, tagline, isPublic } = body;

    const settings = await db.settings.upsert({
      where: { id: "site" },
      update: {
        siteName: siteName ?? undefined,
        tagline: tagline ?? null,
        isPublic: isPublic ?? undefined,
      },
      create: {
        id: "site",
        siteName: siteName || "The Artificial Intelligencer",
        tagline: tagline || null,
        isPublic: isPublic ?? true,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
