import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentStudent } from "@/lib/student";
import { scoreCourse, type Course } from "@/lib/recommendation";

export const Route = createFileRoute("/courses/$courseId")({
  head: () => ({
    meta: [
      { title: "Course Details — AI Course Recommendation System" },
      {
        name: "description",
        content:
          "Full course details: domain, level, duration, provider, prerequisite and how the match score was calculated.",
      },
      { property: "og:title", content: "Course Details" },
      {
        property: "og:description",
        content: "See exactly why a course was recommended to you, point by point.",
      },
    ],
  }),
  component: CourseDetailsPage,
});

function CourseDetailsPage() {
  const { courseId } = Route.useParams();
  const { student } = useCurrentStudent();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,title,domain,level,duration,provider,prerequisite,description")
        .eq("id", courseId)
        .maybeSingle();
      if (error) throw error;
      return data as Course | null;
    },
  });

  const { data: assessment } = useQuery({
    queryKey: ["latest-assessment", student?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("skill_assessments")
        .select("career_goal,interests,skill_level")
        .eq("student_id", student!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!student,
  });

  const breakdown =
    course && assessment
      ? scoreCourse(course, {
          careerGoal: assessment.career_goal,
          interests: assessment.interests ?? [],
          skillLevel: assessment.skill_level,
        })
      : null;

  return (
    <AppShell>
      <Link to="/recommendations" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to recommendations
      </Link>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Loading course…</p>
      ) : !course ? (
        <div className="surface-card mt-6 p-8">
          <p className="text-muted-foreground">Course not found.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <article className="surface-card p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{course.domain}</Badge>
              <Badge variant="outline">{course.level}</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold">{course.title}</h1>
            <p className="mt-3 text-muted-foreground">{course.description}</p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Domain", course.domain],
                ["Level", course.level],
                ["Duration", course.duration],
                ["Provider", course.provider],
                ["Prerequisite", course.prerequisite],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-background/60 p-4">
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <aside className="surface-card p-6">
            <h2 className="text-lg font-semibold">Match score</h2>
            {breakdown ? (
              <>
                <p className="mt-2 text-4xl font-semibold text-primary">{breakdown.total}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  <ScoreRow label="Career goal domain" value={breakdown.goalMatch} max={5} />
                  <ScoreRow label="Interest domain" value={breakdown.interestMatch} max={2} />
                  <ScoreRow label="Level suitability" value={breakdown.levelFit} max={3} />
                  <ScoreRow label="No prerequisite bonus" value={breakdown.noPrerequisite} max={0.5} />
                </ul>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Complete an assessment to see how this course scores for you.
              </p>
            )}
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/learning-path">View learning path</Link>
            </Button>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

function ScoreRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        +{value} <span className="text-xs text-muted-foreground">/ {max}</span>
      </span>
    </li>
  );
}
