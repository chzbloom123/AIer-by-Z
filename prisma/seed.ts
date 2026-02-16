import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting seed...");

  // Check if admin already exists
  const existingAdmin = await db.admin.findUnique({
    where: { email: "admin@aier.com" },
  });

  if (existingAdmin) {
    console.log("✅ Admin already exists, skipping...");
  } else {
    // Create default admin
    const hashedPassword = await bcrypt.hash("changeme", 10);
    
    const admin = await db.admin.create({
      data: {
        email: "admin@aier.com",
        password: hashedPassword,
        name: "Admin",
      },
    });
    
    console.log("✅ Created default admin:", admin.email);
  }

  // Check if settings exist
  const existingSettings = await db.settings.findUnique({
    where: { id: "site" },
  });

  if (existingSettings) {
    console.log("✅ Settings already exist, skipping...");
  } else {
    // Create default settings
    const settings = await db.settings.create({
      data: {
        id: "site",
        siteName: "The Artificial Intelligencer",
        tagline: "AI-Powered Editorial Content",
        isPublic: true,
      },
    });
    
    console.log("✅ Created default settings:", settings.siteName);
  }

  // Create sample persona
  const existingPersonas = await db.persona.count();
  
  if (existingPersonas === 0) {
    const persona = await db.persona.create({
      data: {
        name: "Alex Chen",
        bio: "Technology reporter covering AI, machine learning, and the future of work. Former software engineer with a passion for explaining complex topics in accessible ways.",
        role: "reporter",
        displayOrder: 1,
        isActive: true,
      },
    });
    
    console.log("✅ Created sample persona:", persona.name);

    // Create sample article
    const article = await db.article.create({
      data: {
        title: "The Rise of AI-Powered Journalism: A New Era",
        body: `The landscape of journalism is undergoing a fundamental transformation. As artificial intelligence tools become more sophisticated, newsrooms around the world are grappling with questions about automation, authenticity, and the future of storytelling.

At The Artificial Intelligencer, we've been exploring these questions firsthand. Our publication represents a unique experiment in human-AI collaboration, where the boundaries between human creativity and machine assistance are intentionally blurred.

"We're not replacing journalists," explains Dr. Sarah Martinez, a media studies professor at Columbia University. "We're giving them new tools to tell stories in ways that weren't possible before."

The implications extend beyond mere efficiency. AI-powered tools can help journalists analyze vast datasets, identify patterns in complex stories, and even suggest narrative structures. But the human element remains irreplaceable—the intuition, the ethical judgment, the ability to read between the lines.

As we navigate this new territory, one thing is clear: the future of journalism will be shaped by those who can thoughtfully integrate AI capabilities while maintaining the core values of the profession: accuracy, fairness, and a commitment to truth.

The question isn't whether AI will change journalism—it already has. The question is how we'll shape that change to serve the public interest.`,
        excerpt: "Exploring how artificial intelligence is reshaping the landscape of modern journalism and what it means for the future of storytelling.",
        personaId: persona.id,
        personaName: persona.name,
        category: "technology",
        style: "analysis",
        isPublic: true,
        publishedAt: new Date(),
      },
    });
    
    console.log("✅ Created sample article:", article.title);
  } else {
    console.log("✅ Personas already exist, skipping sample data...");
  }

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
