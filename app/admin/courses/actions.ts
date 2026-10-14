"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const SESSION_COOKIE = "utkal_admin_session";

// 1. Verify Admin Login Credentials (Strict 2-Hour Security Timeout)
export async function loginAdmin(formData: FormData) {
  const userId = (formData.get("userId") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  const validUser = process.env.ADMIN_USER_ID || "admin";
  const validPass = process.env.ADMIN_PASSWORD || "utkal@2026";

  if (userId === validUser && password === validPass) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2, // Admin session automatically expires after 2 hours
    });

    revalidatePath("/admin/courses");
    return { success: true };
  }

  return {
    success: false,
    error: "Invalid Admin User ID or Password. Access denied.",
  };
}

// 2. Logout Admin
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/admin/courses");
}

// Helper to protect admin database actions
async function ensureAdminAuthenticated() {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get(SESSION_COOKIE)?.value === "authenticated";
  if (!isAuth) {
    throw new Error("Unauthorized: Admin session expired or login required.");
  }
}

// 3. Create Course (Protected)
export async function createCourse(formData: FormData) {
  await ensureAdminAuthenticated();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

  await prisma.course.create({
    data: {
      title,
      slug,
      description,
      price,
      isPublished: true,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
}

// 4. Add Lesson (Protected)
export async function addLesson(formData: FormData) {
  await ensureAdminAuthenticated();

  const courseId = formData.get("courseId") as string;
  const sectionTitle =
    (formData.get("sectionTitle") as string) || "General Lectures";
  const lessonTitle = formData.get("lessonTitle") as string;
  const videoId = formData.get("videoId") as string;
  const isPreview = formData.get("isPreview") === "on";

  let section = await prisma.section.findFirst({
    where: { courseId, title: sectionTitle },
  });

  if (!section) {
    const sectionCount = await prisma.section.count({ where: { courseId } });
    section = await prisma.section.create({
      data: {
        title: sectionTitle,
        courseId,
        orderIndex: sectionCount + 1,
      },
    });
  }

  const lessonCount = await prisma.lesson.count({
    where: { sectionId: section.id },
  });

  await prisma.lesson.create({
    data: {
      title: lessonTitle,
      videoId,
      isPreview,
      orderIndex: lessonCount + 1,
      sectionId: section.id,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
}