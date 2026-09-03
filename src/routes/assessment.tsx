import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentStudent } from "@/lib/student";
import { CAREER_GOALS, DOMAINS, LEVELS, rankCourses, type Course } from "@/lib/recommendation";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Skill Assessment — AI Course Recommendation System" },
      {
        name: "description",
        content:
          "Pick your career goal, domains of interest and current skill level to generate ranked course recommendations.",
      },
      { property: "og:title", content: "Skill Assessment" },
      {
        property: "og:description",
        content: "Three quick questions that drive the rule-based course scoring engine.",
      },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const navigate = useNavigate();
  const { student, ready } = useCurrentStudent();
  const [careerGoal, setCareerGoal] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<string>("Beginner");
  const [submitting, setSubmitting] = useState(false);

  function toggleInterest(domain: string, checked: boolean) {
    setInterests((prev) => (checked ? [...prev, domain] : prev.filter((d) => d !== domain)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!student) return;
    if (!careerGoal) {
      toast.error("Please choose a career goal.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id,title,domain,level,duration,provider,prerequisite,description");
      if (coursesError) throw coursesError;

      const { data: assessment, error: assessmentError } = await supabase
        .from("skill_assessments")
        .insert({ student_id: student.id, career_goal: careerGoal, interests, skill_level: skillLevel })
        .select("id")
        .single();
      if (assessmentError) throw assessmentError;

      const ranked = rankCourses((courses ?? []) as Course[], {
        careerGoal,
        interests,
        skillLevel,
      });

      if (ranked.length === 0) {
        toast.error("No matching courses found — try selecting more interests.");
        return;
      }

      const { error: recoError } = await supabase.from("recommendations").insert(
        ranked.map((row) => ({
          student_id: student.id,
          course_id: row.course.id,
          assessment_id: assessment.id,
          score: row.breakdown.total,
        })),
      );
      if (recoError) throw recoError;

      toast.success(`${ranked.length} courses matched.`);
      navigate({ to: "/recommendations" });
    } catch (err) {
      console.error(err);
      toast.error("Could not generate recommendations. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (ready && !student) {
    return (
      <AppShell title="Skill assessment">
        <div className="surface-card p-8">
          <p className="text-muted-foreground">Register first so we can save your results.</p>
          <Link to="/" className="mt-4 inline-block font-medium text-primary underline">
            Go to registration
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Skill assessment"
      subtitle="Three questions. Your answers feed directly into the scoring rules."
    >
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-6">
          <section className="surface-card p-6">
            <h2 className="text-lg font-semibold">1. Career goal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Courses in this goal's primary domain earn +5 points.
            </p>
            <div className="mt-4 max-w-sm">
              <Select value={careerGoal} onValueChange={setCareerGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a career goal" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CAREER_GOALS).map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {careerGoal ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Primary domain: <span className="text-foreground">{CAREER_GOALS[careerGoal]}</span>
                </p>
              ) : null}
            </div>
          </section>

          <section className="surface-card p-6">
            <h2 className="text-lg font-semibold">2. Interests</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each matching domain adds +2 points. Pick as many as you like.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DOMAINS.map((domain) => (
                <label
                  key={domain}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 transition-colors hover:bg-secondary"
                >
                  <Checkbox
                    checked={interests.includes(domain)}
                    onCheckedChange={(checked) => toggleInterest(domain, checked === true)}
                  />
                  <span className="text-sm">{domain}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="surface-card p-6">
            <h2 className="text-lg font-semibold">3. Current skill level</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Exact level match adds +3, one level apart adds +1.
            </p>
            <RadioGroup value={skillLevel} onValueChange={setSkillLevel} className="mt-4 gap-3">
              {LEVELS.map((level) => (
                <label
                  key={level}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 transition-colors hover:bg-secondary"
                >
                  <RadioGroupItem value={level} id={`level-${level}`} />
                  <Label htmlFor={`level-${level}`} className="cursor-pointer font-normal">
                    {level}
                  </Label>
                </label>
              ))}
            </RadioGroup>
          </section>
        </div>

        <aside className="surface-card sticky top-24 p-6">
          <h2 className="text-lg font-semibold">How scoring works</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">+5</span> course domain matches your
              career goal's primary domain
            </li>
            <li>
              <span className="font-medium text-foreground">+2</span> course domain is one of your
              interests
            </li>
            <li>
              <span className="font-medium text-foreground">+3 / +1</span> exact level match / one
              level apart
            </li>
            <li>
              <span className="font-medium text-foreground">+0.5</span> course has no prerequisite
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Top 6 scoring courses are saved to your history.
          </p>
          <Button type="submit" className="mt-6 w-full" disabled={submitting}>
            {submitting ? "Scoring…" : "Generate recommendations"}
          </Button>
        </aside>
      </form>
    </AppShell>
  );
}
