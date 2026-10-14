import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import CoursePlayer from "@/components/CoursePlayer";
import { getCurrentStudent } from "@/app/auth/actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="border-b bg-white border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-tight text-teal-800">
            Utkalpragyan
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to All Courses
          </Link>
        </div>
      </header>

      {/* Main Content wrapped in Suspense */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="p-16 text-center text-slate-400">
              Loading Geology lectures...
            </div>
          }
        >
          <CourseData params={params} />
        </Suspense>
      </main>
    </div>
  );
}

async function CourseData({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return (
      <div className="p-12 text-center text-slate-500">
        No course slug provided. <Link href="/" className="text-teal-700 underline">Go Home</Link>
      </div>
    );
  }

  let course = null;
  try {
    course = await prisma.course.findUnique({
      where: { slug },
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
    });
  } catch (err) {
    console.error("Database fetch error for course:", err);
  }

  if (!course) {
    const existing = await prisma.course.findMany({
      select: { id: true, title: true, slug: true },
    });

    return (
      <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-sm text-slate-500">
          No course matches slug: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">{slug}</code>
        </p>

        {existing.length > 0 && (
          <div className="text-left bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Available Courses:
            </span>
            <ul className="divide-y text-sm">
              {existing.map((c) => (
                <li key={c.id} className="py-2 flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-800">{c.title}</span>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="text-teal-700 hover:underline text-xs font-semibold"
                  >
                    Open Player →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <Link
            href="/admin/courses"
            className="inline-block bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const student = await getCurrentStudent();
  const isEnrolled =
    student?.enrollments.some((e) => e.courseId === course.id) || false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {course.title}
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-3xl">
          {course.description}
        </p>
      </div>

      <CoursePlayer
        course={course}
        student={student}
        isEnrolled={isEnrolled}
      />
    </div>
  );
}