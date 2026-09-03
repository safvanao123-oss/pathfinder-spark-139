import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, ListChecks, Route as RouteIcon, FileText } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { saveStudent, useCurrentStudent } from "@/lib/student";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Course Recommendation System — Rule-Based Course Advisor" },
      {
        name: "description",
        content:
          "Register, take a short skill assessment and get a transparent, point-scored list of online courses plus a step-by-step learning path.",
      },
      { property: "og:title", content: "AI Course Recommendation System" },
      {
        property: "og:description",
        content:
          "A rule-based advisor that matches students with online courses and builds a personalised learning path.",
      },
    ],
  }),
  component: RegistrationPage,
});

const HIGHLIGHTS = [
  { icon: Compass, title: "Career-goal matching", body: "Courses aligned to your target role." },
  { icon: ListChecks, title: "Transparent scoring", body: "Every point in the match is explained." },
  { icon: RouteIcon, title: "Learning path", body: "Beginner to advanced, in the right order." },
  { icon: FileText, title: "Exportable report", body: "Print or save a clean summary." },
];

function RegistrationPage() {
  const navigate = useNavigate();
  const { student } = useCurrentStudent();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (!name || !email) {
      toast.error("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("students")
        .select("id,name,email")
        .eq("email", email)
        .maybeSingle();

      let record = existing;
      if (record) {
        await supabase
          .from("students")
          .update({ name, phone: form.phone.trim() || null })
          .eq("id", record.id);
        record = { ...record, name };
      } else {
        const { data, error } = await supabase
          .from("students")
          .insert({ name, email, phone: form.phone.trim() || null })
          .select("id,name,email")
          .single();
        if (error) throw error;
        record = data;
      }

      saveStudent(record!);
      toast.success(`Welcome, ${record!.name}!`);
      navigate({ to: "/assessment" });
    } catch (err) {
      console.error(err);
      toast.error("Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Rule-based advisor · no black boxes
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-semibold sm:text-5xl">
            Find the courses that actually fit your career goal.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Answer three short questions about your goal, interests and skill level. A transparent
            point-scoring engine ranks a catalogue of 28 courses across 7 domains and builds your
            learning path.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="surface-card p-4">
                <item.icon className="size-5 text-primary" />
                <p className="mt-3 font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Student registration</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Already registered? Enter the same email to continue where you left off.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                maxLength={100}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Aarav Sharma"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                maxLength={255}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="aarav@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={form.phone}
                maxLength={20}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving…" : "Continue to assessment"}
            </Button>
          </form>

          {student ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Signed in as {student.name}.{" "}
              <Link to="/assessment" className="font-medium text-primary underline">
                Go to assessment
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
