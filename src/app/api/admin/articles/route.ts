import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/articles - Fetch all articles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articles = await db.article.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        persona: {
          select: { name: true, role: true },
        },
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST /api/admin/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!title || !articleBody || !personaId) {
      return NextResponse.json(
        { error: "Title, body, and persona are required" },
        { status: 400 }
      );
    }

    // Get persona name
    const persona = await db.persona.findUnique({
      where: { id: personaId },
    });

    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found" },
        { status: 400 }
      );
    }

    // Generate excerpt if not provided
    const finalExcerpt = excerpt || articleBody.slice(0, 200).trim() + "...";

    const article = await db.article.create({
      data: {
        title,
        body: articleBody,
        excerpt: finalExcerpt,
        featuredImageUrl: featuredImageUrl || null,
        personaId,
        personaName: persona.name,
        category: category || null,
        tags: tags ? JSON.stringify(tags) : null,
        style: style || null,
        isPublic: isPublic ?? true,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
