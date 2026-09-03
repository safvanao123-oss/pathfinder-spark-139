import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

import { useCurrentStudent, clearStudent } from "@/lib/student";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/assessment", label: "Assessment" },
  { to: "/recommendations", label: "Recommendations" },
  { to: "/learning-path", label: "Learning Path" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const { student } = useCurrentStudent();

  return (
    <div className="min-h-screen page-gradient">
      <header className="no-print sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-sm leading-tight font-semibold">
              AI Course
              <br className="hidden sm:block" /> Recommendation System
            </span>
          </Link>

          <nav className="order-3 flex w-full gap-1 overflow-x-auto text-sm sm:order-none sm:w-auto">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {student ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {student.name}
                </span>
                <Button variant="outline" size="sm" onClick={clearStudent}>
                  Switch student
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {title ? (
          <div className="mb-8">
            <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
