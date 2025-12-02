import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Download, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dashboard">
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Air Quality Monitor</h1>
                <p className="text-xs text-muted-foreground">Multi-Device System</p>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  isActive("/")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-secondary text-foreground"
                )}
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                to="/download"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  isActive("/download")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-secondary text-foreground"
                )}
              >
                <Download className="h-4 w-4" />
                <span className="font-medium">Download</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
