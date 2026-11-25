import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { passwordProblem } from "./password-rules";

// School accounts. A student joins a class with its code, a display name, a
// username and a password, without an email: the login is created here as
// <username>@students.kidsinbusiness.gr, already confirmed, and the child is
// linked to the teacher (a jfb_parents row with role 'teacher') and the class.

export const STUDENT_EMAIL_DOMAIN = "students.kidsinbusiness.gr";
export const studentEmail = (username: string) => `${username.trim().toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
export const USERNAME_RE = /^[a-z0-9._]{3,20}$/;

const MAX_STUDENTS_PER_CLASS = 60;

const joinSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z2-9]{6}$/),
  name: z.string().trim().min(2).max(30),
  username: z.string().trim().toLowerCase().regex(USERNAME_RE),
  password: z.string().min(8).max(72),
  avatar: z.string().trim().min(1).max(8),
});

export type JoinClassResult =
  | { ok: true; email: string }
  | { ok: false; reason: "bad_code" | "full" | "taken" | "weak_password" | "bad_words" | "failed"; detail?: string };

function inviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export const joinClass = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof joinSchema>) => joinSchema.parse(data))
  .handler(async ({ data }): Promise<JoinClassResult> => {
    const { getAdminClient } = await import("./supabase-admin.server");
    const { containsBadWords } = await import("./buddy-safety");

    const weak = passwordProblem(data.password);
    if (weak) return { ok: false, reason: "weak_password", detail: weak };
    if (containsBadWords(data.name) || containsBadWords(data.username)) return { ok: false, reason: "bad_words" };

    const admin = getAdminClient();
    const { data: cls } = await admin
      .from("jfb_classes" as never)
      .select("id, teacher_id")
      .eq("code", data.code)
      .maybeSingle();
    const klass = cls as { id: string; teacher_id: string } | null;
    if (!klass) return { ok: false, reason: "bad_code" };

    const { count } = await admin
      .from("jfb_children")
      .select("id", { count: "exact", head: true })
      .eq("class_id" as never, klass.id as never);
    if ((count ?? 0) >= MAX_STUDENTS_PER_CLASS) return { ok: false, reason: "full" };

    const { data: taken } = await admin
      .from("jfb_children")
      .select("id")
      .eq("username" as never, data.username as never)
      .maybeSingle();
    if (taken) return { ok: false, reason: "taken" };

    const email = studentEmail(data.username);
    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { role: "student", class_id: klass.id, name: data.name },
    });
    if (userErr || !created.user) {
      if (/already|registered|exists/i.test(userErr?.message ?? "")) return { ok: false, reason: "taken" };
      if (/password/i.test(userErr?.message ?? "")) return { ok: false, reason: "weak_password" };
      console.error("student user failed", userErr?.message);
      return { ok: false, reason: "failed" };
    }

    let lastError = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await admin.from("jfb_children").insert({
        user_id: created.user.id,
        parent_id: klass.teacher_id,
        class_id: klass.id,
        username: data.username,
        name: data.name,
        avatar: data.avatar,
        invite_code: inviteCode(),
      } as never);
      if (!error) return { ok: true, email };
      lastError = error.message;
      if (!/invite_code/.test(error.message)) break;
    }
    // Don't leave a login without a child behind.
    await admin.auth.admin.deleteUser(created.user.id);
    console.error("student child failed", lastError);
    return { ok: false, reason: /username/.test(lastError) ? "taken" : "failed" };
  });

// The teacher sets a new password for a student who forgot theirs (students
// have no email, so they can't reset it themselves).
const resetSchema = z.object({ childId: z.string().uuid(), password: z.string().min(8).max(72) });

export type ResetStudentResult = { ok: true } | { ok: false; reason: "login" | "not_teacher" | "weak_password" | "failed"; detail?: string };

export const resetStudentPassword = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof resetSchema>) => resetSchema.parse(data))
  .handler(async ({ data }): Promise<ResetStudentResult> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { getAdminClient, getUserFromRequest } = await import("./supabase-admin.server");
    const user = await getUserFromRequest(getRequest());
    if (!user) return { ok: false, reason: "login" };

    const weak = passwordProblem(data.password);
    if (weak) return { ok: false, reason: "weak_password", detail: weak };

    const admin = getAdminClient();
    const [{ data: teacher }, { data: child }] = await Promise.all([
      admin.from("jfb_parents").select("id, role").eq("user_id", user.id).maybeSingle(),
      admin.from("jfb_children").select("parent_id, user_id, username").eq("id", data.childId).maybeSingle(),
    ]);
    const t = teacher as { id: string; role: string } | null;
    const c = child as { parent_id: string | null; user_id: string | null; username: string | null } | null;
    // Only for school accounts (with a username) of this teacher's classes.
    if (!t || t.role !== "teacher" || !c || c.parent_id !== t.id || !c.user_id || !c.username) {
      return { ok: false, reason: "not_teacher" };
    }
    const { error } = await admin.auth.admin.updateUserById(c.user_id, { password: data.password });
    if (error) {
      console.error("student password reset failed", error.message);
      return { ok: false, reason: /password/i.test(error.message) ? "weak_password" : "failed" };
    }
    return { ok: true };
  });
