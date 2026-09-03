import { useEffect, useState } from "react";

const KEY = "acrs.student";

export type StoredStudent = { id: string; name: string; email: string };

export function saveStudent(student: StoredStudent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(student));
  window.dispatchEvent(new Event("acrs-student-change"));
}

export function clearStudent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("acrs-student-change"));
}

function read(): StoredStudent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredStudent) : null;
  } catch {
    return null;
  }
}

/** Client-only current student. `ready` is false until hydration completes. */
export function useCurrentStudent() {
  const [student, setStudent] = useState<StoredStudent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setStudent(read());
    sync();
    setReady(true);
    window.addEventListener("acrs-student-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("acrs-student-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { student, ready };
}
