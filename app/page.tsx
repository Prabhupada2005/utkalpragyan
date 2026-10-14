import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentStudent, logoutStudent } from "@/app/auth/actions";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b bg-white border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-teal-800">
              Utkalpragyan
            </span>
            <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              Geology Academy
            </span>
          </div>
          <Suspense fallback={<div className="text-xs text-slate-400">Loading...</div>}>
            <HeaderNav />
          </Suspense>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-900 to-slate-900 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="inline-block bg-teal-500/20 border border-teal-400/30 text-teal-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Target UPSC Combined Geo-Scientist & State PSCs
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Master Geology with Structured Lectures & Exam Strategies
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Comprehensive video lectures covering Petrology, Structural Geology, Paleontology, and Hydrogeology. Try the first 10% of lessons completely free before enrolling.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <a
              href="#courses"
              className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-6 py-3 rounded-lg shadow-md transition"
            >
              Start Free Preview
            </a>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <main id="courses" className="max-w-6xl mx-auto px-4 py-16">
        <Suspense fallback={<div className="text-center text-slate-400 py-12">Loading courses...</div>}>
          <CourseCatalog />
        </Suspense>
      </main>
    </div>
  );
}

async function HeaderNav() {
  const student = await getCurrentStudent();

  return (
    <div className="flex items-center gap-4 text-sm font-medium">
      <Link
        href="/admin/courses"
        className="text-slate-500 hover:text-slate-900 text-xs transition"
      >
        Admin Portal
      </Link>

      {student ? (
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg">
            👤 {student.name}
          </span>
          <form action={logoutStudent}>
            <button
              type="submit"
              className="text-xs font-semibold text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
        >
          Student Login / Sign Up
        </Link>
      )}
    </div>
  );
}

async function CourseCatalog() {
  let courses: any[] = [];
  let dbError = false;

  // Retry up to 2 times if Neon is waking up from sleep
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      courses = await prisma.course.findMany({
        where: { isPublished: true },
        include: {
          sections: {
            include: {
              lessons: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      dbError = false;
      break;
    } catch (err) {
      console.warn(`Database connection attempt ${attempt} failed (Neon waking up)...`, err);
      dbError = true;
      // Wait 2 seconds before retry
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (dbError && courses.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
        <h3 className="text-amber-900 font-bold text-base">Database is Waking Up</h3>
        <p className="text-amber-700 text-xs max-w-md mx-auto">
          Neon serverless databases pause after inactivity. Please refresh this page in 3 seconds to load your Geology courses.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Available Courses</h2>
          <p className="text-slate-500 text-sm mt-1">
            Select a module to watch free demo lectures or unlock complete access.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {courses.length} {courses.length === 1 ? "Course" : "Courses"} Available
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center space-y-3">
          <p className="text-slate-500">No courses published yet.</p>
          <Link
            href="/admin/courses"
            className="inline-block bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Go to Admin Portal to Add a Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const allLessons = course.sections.flatMap((s: any) => s.lessons);
            const previewLessons = allLessons.filter((l: any) => l.isPreview);

            return (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {previewLessons.length} Free Lectures
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {allLessons.length} Total Lessons
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Fee</span>
                    <span className="text-xl font-black text-slate-900">
                      ₹{course.price}
                    </span>
                  </div>
                  <Link
                    href={`/courses/${course.slug}`}
                    prefetch={false}
                    className="bg-slate-900 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Watch Free Preview
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}