import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { logoutAdmin } from "./actions";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminCourseManager from "@/components/AdminCourseManager";

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

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  let courses: any[] = [];
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
    console.error("Database fetch error:", err);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="border-b border-slate-200 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Utkalpragyan Admin Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Publish structured courses, video lectures, and study articles across all academic streams.
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

        <AdminCourseManager courses={courses} />
      </div>
    </div>
  );
}