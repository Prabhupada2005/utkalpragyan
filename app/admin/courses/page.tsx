import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { createCourse, addLesson, logoutAdmin } from "./actions";
import AdminLoginForm from "@/components/AdminLoginForm";

export default function AdminCoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
          Checking admin authorization...
        </div>
      }
    >
      <AdminAuthGate />
    </Suspense>
  );
}

async function AdminAuthGate() {
  const cookieStore = await cookies();
  const isAuthenticated =
    cookieStore.get("utkal_admin_session")?.value === "authenticated";

  // If not logged in, show the restricted login screen
  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  // If logged in, show the Admin Portal and Logout button
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="border-b border-slate-200 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Utkalpragyan Admin Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage Geology courses for UPSC Geo-Scientist, state exams, and toggle free preview lectures.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              View Live Website
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* 1. Add New Course Form */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            1. Create a New Geology Course
          </h2>
          <form
            action={createCourse}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              type="text"
              name="title"
              placeholder="e.g. UPSC Geo-Scientist: Structural Geology"
              required
              className="border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-teal-600"
            />
            <input
              type="number"
              step="1"
              name="price"
              placeholder="Price (INR) e.g. 3999"
              required
              className="border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-teal-600"
            />
            <button
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg text-sm px-4 py-2.5 transition"
            >
              Create Course
            </button>
            <textarea
              name="description"
              rows={2}
              placeholder="Detailed syllabus or course overview..."
              required
              className="md:col-span-3 border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-teal-600"
            />
          </form>
        </section>

        {/* 2. Course List */}
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-500">
              Loading courses from database...
            </div>
          }
        >
          <CourseList />
        </Suspense>
      </div>
    </div>
  );
}

async function CourseList() {
  let courses: any[] = [];
  let dbError = false;

  try {
    courses = await prisma.course.findMany({
      include: {
        sections: {
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Database connection notice:", err);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-2">
        <p className="text-amber-900 font-semibold text-sm">
          Database compute node is spinning up.
        </p>
        <p className="text-amber-700 text-xs">
          Neon suspends idle connections after 5 minutes. Refresh the page in 3 seconds.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">
        2. Curriculum & Video Management
      </h2>

      {courses.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400">
          No courses added yet. Use the form above to add your first course.
        </div>
      ) : (
        courses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Slug: /{course.slug} • Price: ₹{course.price}
                </p>
              </div>
            </div>

            {/* Add Lesson Form */}
            <form
              action={addLesson}
              className="bg-slate-50 border border-slate-200 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center"
            >
              <input type="hidden" name="courseId" value={course.id} />
              <input
                type="text"
                name="sectionTitle"
                placeholder="Section (e.g. Igneous Petrology)"
                required
                className="border border-slate-300 rounded p-2 text-sm bg-white"
              />
              <input
                type="text"
                name="lessonTitle"
                placeholder="Lesson Name (e.g. Bowen's Reaction Series)"
                required
                className="border border-slate-300 rounded p-2 text-sm bg-white"
              />
              <input
                type="text"
                name="videoId"
                placeholder="YouTube URL or ID"
                required
                className="border border-slate-300 rounded p-2 text-sm bg-white"
              />
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-200 px-2 py-2 rounded cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isPreview"
                    className="accent-teal-700"
                  />
                  Free (10%)
                </label>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-black text-white text-xs font-medium px-4 py-2 rounded transition"
                >
                  Add Lesson
                </button>
              </div>
            </form>

            {/* Modules Hierarchy */}
            <div className="space-y-3">
              {course.sections.map((section: any) => (
                <div
                  key={section.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-sm text-slate-700 mb-2">
                    📂 {section.title}
                  </h4>
                  <div className="space-y-1.5">
                    {section.lessons.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between bg-slate-50 p-2.5 rounded text-sm"
                      >
                        <span className="text-slate-800 font-medium">
                          🎬 {lesson.title}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-mono">
                            ID: {lesson.videoId}
                          </span>
                          {lesson.isPreview ? (
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              Free 10% Preview
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                              Paid Only
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}