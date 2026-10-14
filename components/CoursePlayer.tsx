"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayCircle, Lock, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  videoId: string;
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

// Helper 1: Extract YouTube 11-char ID
function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regex);
  return match ? match[1] : null;
}

// Helper 2: Extract Google Drive File ID from share links
function extractGoogleDriveId(input: string): string | null {
  const trimmed = input.trim();
  const regex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
  const match = trimmed.match(regex);
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

  // A lesson is unlocked if it's a 10% free preview OR if the student paid for the course
  const isLessonUnlocked = activeLesson
    ? activeLesson.isPreview || isEnrolled
    : false;

  const youtubeId = activeLesson ? extractYouTubeId(activeLesson.videoId) : null;
  const googleDriveId = activeLesson
    ? extractGoogleDriveId(activeLesson.videoId)
    : null;
  const isDirectVideo =
    activeLesson?.videoId.endsWith(".mp4") ||
    activeLesson?.videoId.endsWith(".webm");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Display Area */}
      <div className="lg:col-span-2 space-y-4">
        <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center">
          {!activeLesson ? (
            <p className="text-slate-400 text-sm">
              No lectures found in this course.
            </p>
          ) : isLessonUnlocked ? (
            <div className="w-full h-full relative">
              {youtubeId ? (
                /* 1. YouTube (Unlisted or Public) */
                <iframe
                  key={youtubeId}
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : googleDriveId ? (
                /* 2. Google Drive Video Embed */
                <iframe
                  key={googleDriveId}
                  src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : isDirectVideo ? (
                /* 3. Direct MP4 Video */
                <video
                  key={activeLesson.videoId}
                  src={activeLesson.videoId}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                /* 4. Fallback Demo Stream for Dummy Test IDs */
                <div className="w-full h-full relative flex flex-col">
                  <video
                    key={activeLesson.id}
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-cover bg-black"
                  />
                  <div className="absolute bottom-14 left-3 right-3 bg-slate-900/90 backdrop-blur-sm border border-amber-500/40 text-amber-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Playing sample stream for placeholder ID{" "}
                      <code className="bg-black/50 px-1.5 py-0.5 rounded text-white font-mono">
                        {activeLesson.videoId}
                      </code>
                      . Paste an Unlisted YouTube link or Google Drive link in Admin Portal.
                    </span>
                  </div>
                </div>
              )}

              {/* Top Badge */}
              <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded shadow pointer-events-none">
                {isEnrolled
                  ? "Full Enrolled Access"
                  : "Free Demo Lecture (10% Preview)"}
              </div>

              {/* Anti-Piracy Student Watermark */}
              {student && (
                <div className="absolute bottom-12 right-4 bg-black/40 text-white/60 text-[10px] font-mono px-2 py-0.5 rounded pointer-events-none select-none">
                  {student.email} • {student.phone}
                </div>
              )}
            </div>
          ) : (
            /* Locked Paid Lecture Screen */
            <div className="p-8 text-center text-white max-w-md space-y-4">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">This Lecture is Locked</h3>
                <p className="text-sm text-slate-400">
                  Unlock all {allLessons.length} Geology lectures and study material by enrolling in this course.
                </p>
              </div>

              <div className="pt-2">
                {!student ? (
                  <Link
                    href="/login"
                    className="block w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
                  >
                    Sign In / Register to Unlock (₹{course.price})
                  </Link>
                ) : (
                  <button
                    onClick={() =>
                      alert(
                        `Logged in as ${student.name} (${student.phone}). Connecting Razorpay checkout for ₹${course.price}...`
                      )
                    }
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
                  >
                    Pay ₹{course.price} to Unlock Full Course
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Lesson Info */}
        {activeLesson && (
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Current Lesson
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {activeLesson.title}
                </h2>
              </div>
              {isLessonUnlocked ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {isEnrolled ? "Unlocked" : "Free Preview"}
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  Locked
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Curriculum Sidebar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 h-fit">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700" /> Course Syllabus
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {allLessons.length} Lectures •{" "}
            {allLessons.filter((l) => l.isPreview).length} Free Previews
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
                        {unlocked ? (
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