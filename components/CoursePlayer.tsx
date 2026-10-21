"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayCircle, Lock, BookOpen, FileText, CheckCircle2 } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  contentType: string; // "VIDEO" or "ARTICLE"
  videoId?: string | null;
  articleBody?: string | null;
  isPreview: boolean;
  orderIndex: number;
}

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  slug: string;
  sections: Section[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
}

function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regex);
  return match ? match[1] : null;
}

function extractGoogleDriveId(input?: string | null): string | null {
  if (!input) return null;
  const match = input
    .trim()
    .match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export default function CoursePlayer({
  course,
  student,
  isEnrolled = false,
}: {
  course: Course;
  student?: Student | null;
  isEnrolled?: boolean;
}) {
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const firstPreview = allLessons.find((l) => l.isPreview) || allLessons[0];
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    firstPreview || null
  );

  const isLessonUnlocked = activeLesson
    ? activeLesson.isPreview || isEnrolled
    : false;
  const youtubeId = activeLesson ? extractYouTubeId(activeLesson.videoId) : null;
  const driveId = activeLesson ? extractGoogleDriveId(activeLesson.videoId) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Content Viewer */}
        {!activeLesson ? (
          <div className="aspect-video bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
            No lectures or articles found in this module.
          </div>
        ) : !isLessonUnlocked ? (
          /* Locked Content Screen */
          <div className="aspect-video bg-slate-950 rounded-2xl flex items-center justify-center p-8 text-center text-white">
            <div className="max-w-md space-y-4">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">This Content is Locked</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Enroll in this module to unlock all {allLessons.length} lectures and study notes.
                </p>
              </div>
              <div>
                {!student ? (
                  <Link
                    href="/login"
                    className="block w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-xl transition"
                  >
                    Sign In / Register to Unlock (₹{course.price})
                  </Link>
                ) : (
                  <button
                    onClick={() =>
                      alert(
                        `Connecting Razorpay checkout for ₹${course.price}...`
                      )
                    }
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-xl transition"
                  >
                    Pay ₹{course.price} to Unlock Full Module
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : activeLesson.contentType === "ARTICLE" ? (
          /* Unlocked Article Viewer */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4 min-h-[420px]">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded">
                Written Study Notes
              </span>
              {student && (
                <span className="text-xs text-slate-400 font-mono">
                  {student.email}
                </span>
              )}
            </div>
            <div className="prose max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed text-sm">
              {activeLesson.articleBody}
            </div>
          </div>
        ) : (
          /* Unlocked Video Player */
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
            {youtubeId ? (
              <iframe
                key={youtubeId}
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                title={activeLesson.title}
                className="w-full h-full border-0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : driveId ? (
              <iframe
                key={driveId}
                src={`https://drive.google.com/file/d/${driveId}/preview`}
                title={activeLesson.title}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <video
                key={activeLesson.videoId || ""}
                src={activeLesson.videoId || ""}
                controls
                className="w-full h-full object-contain"
              />
            )}
            {student && (
              <div className="absolute bottom-12 right-4 bg-black/40 text-white/60 text-[10px] font-mono px-2 py-0.5 rounded pointer-events-none select-none">
                {student.email} • {student.phone}
              </div>
            )}
          </div>
        )}

        {/* Current Lesson/Article Metadata */}
        {activeLesson && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {activeLesson.contentType === "ARTICLE"
                  ? "Selected Study Article"
                  : "Selected Video Lecture"}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {activeLesson.title}
              </h2>
            </div>
            {isLessonUnlocked ? (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {isEnrolled ? "Full Access" : "Free Preview"}
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Locked
              </span>
            )}
          </div>
        )}
      </div>

      {/* Curriculum Sidebar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 h-fit">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700" /> Syllabus Content
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {allLessons.length} Modules (
            {allLessons.filter((l) => l.isPreview).length} Free Previews)
          </p>
        </div>

        <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
          {course.sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </h4>
              <div className="space-y-1.5">
                {section.lessons.map((lesson) => {
                  const isCurrent = activeLesson?.id === lesson.id;
                  const unlocked = lesson.isPreview || isEnrolled;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                        isCurrent
                          ? "bg-teal-50/70 border-teal-300 text-teal-900 shadow-sm"
                          : "bg-slate-50/60 border-slate-100 text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {lesson.contentType === "ARTICLE" ? (
                          <FileText
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isCurrent ? "text-teal-700" : "text-slate-500"
                            }`}
                          />
                        ) : unlocked ? (
                          <PlayCircle
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isCurrent ? "text-teal-700" : "text-emerald-600"
                            }`}
                          />
                        ) : (
                          <Lock className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                        )}
                        <span className="text-xs font-medium leading-relaxed">
                          {lesson.title}
                        </span>
                      </div>

                      {lesson.isPreview ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded shrink-0">
                          Free
                        </span>
                      ) : isEnrolled ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          Paid
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}