import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentStudent, logoutStudent } from "@/app/auth/actions";
import NavbarMenu from "@/components/NavbarMenu";

interface PageProps {
  searchParams: Promise<{ category?: string; subCategory?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { category, subCategory } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b bg-white border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-teal-800 shrink-0"
            >
              Utkalpragyan
            </Link>

            {/* Category Dropdowns placed to the right of Utkalpragyan */}
            <div className="hidden md:flex items-center">
              <NavbarMenu />
            </div>
          </div>

          <Suspense
            fallback={<div className="text-xs text-slate-400">Loading...</div>}
          >
            <HeaderNav />
          </Suspense>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 bg-slate-50/50 flex overflow-x-auto">
          <NavbarMenu />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-900 to-slate-900 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-block bg-teal-500/20 border border-teal-400/30 text-teal-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Target UPSC Combined Geo-Scientist, OPSC, NEET & JEE
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Comprehensive Video Lectures & Study Articles
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Structured modules covering Geology, Geophysics, Civil Services, and Competitive Exams[cite: 1]. Explore the first 10% of lessons and notes free before enrolling.
          </p>
        </div>
      </section>

      {/* Catalog Display */}
      <main id="courses" className="max-w-6xl mx-auto px-4 py-12">
        <Suspense
          fallback={
            <div className="text-center text-slate-400 py-12">
              Loading modules...
            </div>
          }
        >
          <CourseCatalog category={category} subCategory={subCategory} />
        </Suspense>
      </main>
    </div>
  );
}

async function HeaderNav() {
  const student = await getCurrentStudent();

  return (
    <div className="flex items-center gap-4 text-sm font-medium shrink-0">
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

async function CourseCatalog({
  category,
  subCategory,
}: {
  category?: string;
  subCategory?: string;
}) {
  const filter: any = { isPublished: true };
  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;

  let courses: any[] = [];
  let dbError = false;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      courses = await prisma.course.findMany({
        where: filter,
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
      console.warn(
        `Database connection attempt ${attempt} failed (Neon waking up)...`,
        err
      );
      dbError = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (dbError && courses.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
        <h3 className="text-amber-900 font-bold text-base">Database is Waking Up</h3>
        <p className="text-amber-700 text-xs max-w-md mx-auto">
          Neon serverless databases pause after inactivity. Please refresh this page in a few seconds to load your modules.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {subCategory
              ? `${subCategory} Modules`
              : category
              ? `${category} Modules`
              : "All Courses & Articles"}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {courses.length} {courses.length === 1 ? "module" : "modules"} available for this topic.
          </p>
        </div>

        {(category || subCategory) && (
          <Link
            href="/"
            className="text-xs font-semibold text-teal-700 hover:underline bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg"
          >
            ✕ Clear Topic Filter (Show All)
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center space-y-3">
          <p className="text-slate-500">
            No published modules found under{" "}
            {subCategory || category || "this topic"} yet.
          </p>
          <Link
            href="/admin/courses"
            className="inline-block bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Post Content from Admin Portal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const allLessons = course.sections.flatMap((s: any) => s.lessons);
            const previewLessons = allLessons.filter((l: any) => l.isPreview);
            const videoCount = allLessons.filter(
              (l: any) => l.contentType === "VIDEO"
            ).length;
            const articleCount = allLessons.filter(
              (l: any) => l.contentType === "ARTICLE"
            ).length;

            return (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {course.subCategory}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {videoCount > 0 && `${videoCount} Videos `}
                      {articleCount > 0 && `${articleCount} Articles`}
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
                    Open Content
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