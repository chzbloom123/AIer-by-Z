import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/persona/[id] - Fetch single persona
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const persona = await db.persona.findUnique({
      where: { id },
    });

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    return NextResponse.json(persona);
  } catch (error) {
    console.error("Error fetching persona:", error);
    return NextResponse.json(
      { error: "Failed to fetch persona" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/persona/[id] - Update persona
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, bio, role, profileImageUrl, moreInfoText, externalLinks, displayOrder, isActive } = body;

    // Check if persona exists
    const existing = await db.persona.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // If name is changing, update all articles with this persona
    if (name && name !== existing.name) {
      await db.article.updateMany({
        where: { personaId: id },
        data: { personaName: name },
      });
    }

    const persona = await db.persona.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        bio: bio ?? existing.bio,
        role: role ?? existing.role,
        profileImageUrl: profileImageUrl ?? existing.profileImageUrl,
        moreInfoText: moreInfoText ?? existing.moreInfoText,
        externalLinks: externalLinks !== undefined 
          ? (externalLinks ? JSON.stringify(externalLinks) : null)
          : existing.externalLinks,
        displayOrder: displayOrder ?? existing.displayOrder,
        isActive: isActive ?? existing.isActive,
      },
    });

    return NextResponse.json(persona);
  } catch (error) {
    console.error("Error updating persona:", error);
    return NextResponse.json(
      { error: "Failed to update persona" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/persona/[id] - Delete persona (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if persona has articles
    const articleCount = await db.article.count({
      where: { personaId: id },
    });

    if (articleCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete persona with ${articleCount} articles. Delete or reassign articles first.` },
        { status: 400 }
      );
    }

    // Soft delete
    const persona = await db.persona.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(persona);
  } catch (error) {
    console.error("Error deleting persona:", error);
    return NextResponse.json(
      { error: "Failed to delete persona" },
      { status: 500 }
    );
  }
}
