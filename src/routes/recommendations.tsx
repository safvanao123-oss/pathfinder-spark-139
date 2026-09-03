import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentStudent } from "@/lib/student";
import type { Course } from "@/lib/recommendation";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Your Course Recommendations — AI Course Recommendation System" },
      {
        name: "description",
        content:
          "Your top-scoring course matches with domain, level, duration and the exact match score from the rule engine.",
      },
      { property: "og:title", content: "Your Course Recommendations" },
      {
        property: "og:description",
        content: "Ranked course matches produced by a transparent point-scoring engine.",
      },
    ],
  }),
  component: RecommendationsPage,
});

export type RecoRow = { score: number; created_at: string; courses: Course };

export async function fetchLatestRecommendations(studentId: string) {
  const { data: assessment } = await supabase
    .from("skill_assessments")
    .select("id,career_goal,interests,skill_level,created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!assessment) return { assessment: null, rows: [] as RecoRow[] };

  const { data } = await supabase
    .from("recommendations")
    .select(
      "score,created_at,courses(id,title,domain,level,duration,provider,prerequisite,description)",
    )
    .eq("assessment_id", assessment.id)
    .order("score", { ascending: false });

  return { assessment, rows: (data ?? []) as unknown as RecoRow[] };
}

type SortKey = "score" | "title" | "level";

function RecommendationsPage() {
  const { student, ready } = useCurrentStudent();
  const [sortKey, setSortKey] = useState<SortKey>("score");

  const { data, isLoading } = useQuery({
    queryKey: ["recommendations", student?.id],
    queryFn: () => fetchLatestRecommendations(student!.id),
    enabled: !!student,
  });

  if (ready && !student) return <NeedsStudent />;

  const levelOrder = ["Beginner", "Intermediate", "Advanced"];
  const rows = [...(data?.rows ?? [])].sort((a, b) => {
    if (sortKey === "title") return a.courses.title.localeCompare(b.courses.title);
    if (sortKey === "level")
      return levelOrder.indexOf(a.courses.level) - levelOrder.indexOf(b.courses.level);
    return b.score - a.score;
  });

  return (
    <AppShell
      title="Your recommendations"
      subtitle={
        data?.assessment
          ? `Goal: ${data.assessment.career_goal} · Level: ${data.assessment.skill_level}`
          : "Top matches from the rule-based scoring engine."
      }
    >
      <div className="no-print mb-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/learning-path">View learning path</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/report">Generate report</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/assessment">Retake assessment</Link>
        </Button>
        <div className="ml-auto flex items-center gap-1 text-sm">
          <ArrowUpDown className="size-4 text-muted-foreground" />
          {(["score", "title", "level"] as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortKey(key)}
              className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${
                sortKey === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading your matches…</p>
      ) : rows.length === 0 ? (
        <div className="surface-card p-8">
          <p className="text-muted-foreground">
            No recommendations yet — complete the skill assessment first.
          </p>
          <Button asChild className="mt-4">
            <Link to="/assessment">Start assessment</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((row, index) => (
            <Link
              key={row.courses.id}
              to="/courses/$courseId"
              params={{ courseId: row.courses.id }}
              className="surface-card flex flex-col gap-4 p-5 transition-shadow hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground">
                #{index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{row.courses.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.courses.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{row.courses.domain}</Badge>
                  <Badge variant="outline">{row.courses.level}</Badge>
                  <Badge variant="outline">{row.courses.duration}</Badge>
                  <Badge variant="outline">{row.courses.provider}</Badge>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl font-semibold text-primary">{Number(row.score)}</p>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">match score</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function NeedsStudent() {
  return (
    <AppShell title="Your recommendations">
      <div className="surface-card p-8">
        <p className="text-muted-foreground">Register and complete an assessment first.</p>
        <Button asChild className="mt-4">
          <Link to="/">Go to registration</Link>
        </Button>
      </div>
    </AppShell>
  );
}
