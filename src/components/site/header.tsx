import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold hover:opacity-80 transition-opacity">
          The Artificial Intelligencer
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
