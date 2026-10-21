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

// 3. Helper to protect admin database actions
async function ensureAdminAuthenticated() {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get(SESSION_COOKIE)?.value === "authenticated";
  if (!isAuth) {
    throw new Error("Unauthorized: Admin session expired or login required.");
  }
}

// 4. Create Course with Category & Sub-topic
export async function createCourse(formData: FormData) {
  await ensureAdminAuthenticated();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const price = parseFloat(formData.get("price") as string) || 0;
  const category = (formData.get("category") as string) || "Geology";
  const subCategory = (formData.get("subCategory") as string) || "General";

  const rawSlug = `${title}-${subCategory}`
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");
  const slug = `${rawSlug}-${Math.floor(100 + Math.random() * 900)}`;

  await prisma.course.create({
    data: {
      title,
      slug,
      description,
      price,
      category,
      subCategory,
      isPublished: true,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
}

// 5. Add Lesson as Video or Article
export async function addLesson(formData: FormData) {
  await ensureAdminAuthenticated();

  const courseId = formData.get("courseId") as string;
  const sectionTitle = (formData.get("sectionTitle") as string) || "General Lectures";
  const lessonTitle = formData.get("lessonTitle") as string;
  const contentType = (formData.get("contentType") as string) || "VIDEO";
  const videoId = (formData.get("videoId") as string)?.trim() || "";
  const articleBody = (formData.get("articleBody") as string)?.trim() || "";
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
      contentType,
      videoId: contentType === "VIDEO" ? videoId : null,
      articleBody: contentType === "ARTICLE" ? articleBody : null,
      isPreview,
      orderIndex: lessonCount + 1,
      sectionId: section.id,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
}

// 6. Delete Entire Course & Cascading Content
export async function deleteCourse(formData: FormData) {
  await ensureAdminAuthenticated();

  const courseId = formData.get("courseId") as string;
  if (!courseId) throw new Error("Course ID is required.");

  await prisma.course.delete({
    where: { id: courseId },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
}

// 7. Delete an Individual Lesson or Article
export async function deleteLesson(formData: FormData) {
  await ensureAdminAuthenticated();

  const lessonId = formData.get("lessonId") as string;
  if (!lessonId) throw new Error("Lesson ID is required.");

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
}

// 8. Update Course Details
export async function updateCourse(formData: FormData) {
  await ensureAdminAuthenticated();

  const courseId = formData.get("courseId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const price = parseFloat(formData.get("price") as string) || 0;
  const category = (formData.get("category") as string) || "Geology";
  const subCategory = (formData.get("subCategory") as string) || "General";

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title,
      description,
      price,
      category,
      subCategory,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
}

// 9. Update an Individual Lesson or Article
export async function updateLesson(formData: FormData) {
  await ensureAdminAuthenticated();

  const lessonId = formData.get("lessonId") as string;
  const title = (formData.get("title") as string)?.trim();
  const contentType = (formData.get("contentType") as string) || "VIDEO";
  const videoId = (formData.get("videoId") as string)?.trim() || "";
  const articleBody = (formData.get("articleBody") as string)?.trim() || "";
  const isPreview = formData.get("isPreview") === "on";

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title,
      contentType,
      videoId: contentType === "VIDEO" ? videoId : null,
      articleBody: contentType === "ARTICLE" ? articleBody : null,
      isPreview,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
}