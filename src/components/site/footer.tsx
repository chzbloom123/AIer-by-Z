export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container max-w-7xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} The Artificial Intelligencer. All rights reserved.</p>
      </div>
    </footer>
  );
}
