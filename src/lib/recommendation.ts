export const DOMAINS = [
  "Web Development",
  "Data Science",
  "Artificial Intelligence",
  "Cybersecurity",
  "Cloud Computing",
  "Mobile Development",
  "UI/UX Design",
] as const;

export type Domain = (typeof DOMAINS)[number];

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type Level = (typeof LEVELS)[number];

/** Career goal -> primary domain mapping used by the rule engine. */
export const CAREER_GOALS: Record<string, Domain> = {
  "Web Developer": "Web Development",
  "Data Scientist": "Data Science",
  "AI / ML Engineer": "Artificial Intelligence",
  "Cybersecurity Analyst": "Cybersecurity",
  "Cloud Engineer": "Cloud Computing",
  "Mobile App Developer": "Mobile Development",
  "UI/UX Designer": "UI/UX Design",
};

export type Course = {
  id: string;
  title: string;
  domain: string;
  level: string;
  duration: string;
  provider: string;
  prerequisite: string;
  description: string;
};

export type ScoreBreakdown = {
  goalMatch: number;
  interestMatch: number;
  levelFit: number;
  noPrerequisite: number;
  total: number;
};

const levelIndex = (level: string) => LEVELS.indexOf(level as Level);

export function scoreCourse(
  course: Course,
  input: { careerGoal: string; interests: string[]; skillLevel: string },
): ScoreBreakdown {
  const primaryDomain = CAREER_GOALS[input.careerGoal];

  const goalMatch = course.domain === primaryDomain ? 5 : 0;
  const interestMatch = input.interests.includes(course.domain) ? 2 : 0;

  const distance = Math.abs(levelIndex(course.level) - levelIndex(input.skillLevel));
  const levelFit = distance === 0 ? 3 : distance === 1 ? 1 : 0;

  const noPrerequisite =
    !course.prerequisite || course.prerequisite.trim().toLowerCase() === "none" ? 0.5 : 0;

  return {
    goalMatch,
    interestMatch,
    levelFit,
    noPrerequisite,
    total: goalMatch + interestMatch + levelFit + noPrerequisite,
  };
}

export function rankCourses(
  courses: Course[],
  input: { careerGoal: string; interests: string[]; skillLevel: string },
  limit = 6,
) {
  return courses
    .map((course) => ({ course, breakdown: scoreCourse(course, input) }))
    .filter((row) => row.breakdown.total > 0)
    .sort((a, b) => b.breakdown.total - a.breakdown.total)
    .slice(0, limit);
}

export function sortByLevel<T extends { level: string }>(items: T[]) {
  return [...items].sort((a, b) => levelIndex(a.level) - levelIndex(b.level));
}
