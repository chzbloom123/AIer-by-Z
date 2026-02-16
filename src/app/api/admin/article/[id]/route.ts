import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/article/[id] - Fetch single article
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
    const article = await db.article.findUnique({
      where: { id },
      include: {
        persona: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/article/[id] - Update article
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
    const {
      title,
      body: articleBody,
      excerpt,
      featuredImageUrl,
      personaId,
      category,
      tags,
      style,
      isPublic,
      publishedAt,
    } = body;

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // If persona is changing, get new persona name
    let personaName = existing.personaName;
    if (personaId && personaId !== existing.personaId) {
      const persona = await db.persona.findUnique({ where: { id: personaId } });
      if (persona) {
        personaName = persona.name;
      }
    }

    // Generate excerpt if body changed and no excerpt provided
    let finalExcerpt = excerpt ?? existing.excerpt;
    if (articleBody && !excerpt) {
      finalExcerpt = articleBody.slice(0, 200).trim() + "...";
    }

    const article = await db.article.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        body: articleBody ?? existing.body,
        excerpt: finalExcerpt,
        featuredImageUrl: featuredImageUrl ?? existing.featuredImageUrl,
        personaId: personaId ?? existing.personaId,
        personaName,
        category: category ?? existing.category,
        tags: tags !== undefined ? (tags ? JSON.stringify(tags) : null) : existing.tags,
        style: style ?? existing.style,
        isPublic: isPublic ?? existing.isPublic,
        publishedAt: publishedAt ? new Date(publishedAt) : existing.publishedAt,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/article/[id] - Delete article
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

    await db.article.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
