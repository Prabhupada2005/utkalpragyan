"use client";

import { useState } from "react";
import { CATEGORIES_DATA } from "@/lib/categories";
import {
  createCourse,
  addLesson,
  deleteCourse,
  deleteLesson,
  updateCourse,
  updateLesson,
} from "@/app/admin/courses/actions";
import {
  Video,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  X,
} from "lucide-react";

export default function AdminCourseManager({ courses }: { courses: any[] }) {
  // Cascading dropdown state for creating a Course
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES_DATA[0].title);
  const activeCategoryGroup =
    CATEGORIES_DATA.find((c) => c.title === selectedCategory) || CATEGORIES_DATA[0];

  // Content type state per course (courseId -> "VIDEO" | "ARTICLE")
  const [lessonTypes, setLessonTypes] = useState<Record<string, "VIDEO" | "ARTICLE">>({});

  // Accordion state to preview notes
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});

  // Modal editing states
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  const setLessonTypeForCourse = (courseId: string, type: "VIDEO" | "ARTICLE") => {
    setLessonTypes((prev) => ({ ...prev, [courseId]: type }));
  };

  const toggleArticlePreview = (lessonId: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  return (
    <div className="space-y-10">
      {/* 1. Create Course Container */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            1. Post New Course / Subject Module
          </h2>
          <p className="text-xs text-slate-500">
            Select the category and topic to create the parent module container.
          </p>
        </div>

        <form action={createCourse} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Main Category
            </label>
            <select
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 font-medium focus:outline-teal-600"
            >
              {CATEGORIES_DATA.map((cat) => (
                <option key={cat.title} value={cat.title}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Sub-Topic / Subject
            </label>
            <select
              name="subCategory"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 font-medium focus:outline-teal-600"
            >
              {activeCategoryGroup.subheadings.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Price (INR)
            </label>
            <input
              type="number"
              step="1"
              name="price"
              placeholder="e.g. 2999"
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:outline-teal-600"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Module Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Masterclass in Igneous Petrology"
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:outline-teal-600"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-sm px-4 py-2.5 transition shadow-sm"
            >
              Publish Module
            </button>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Overview & Syllabus Description
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Detailed syllabus or course overview..."
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:outline-teal-600"
            />
          </div>
        </form>
      </section>

      {/* 2. Content Management Inside Modules */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-slate-800">
          2. Manage Lectures, Notes & Articles
        </h2>

        {courses.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400">
            No modules created yet. Use the form above to add your first topic.
          </div>
        ) : (
          courses.map((course) => {
            const currentType = lessonTypes[course.id] || "VIDEO";

            return (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5"
              >
                {/* Course Header with Edit & Delete */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded">
                        {course.category}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded">
                        {course.subCategory}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {course.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">
                      ₹{course.price}
                    </span>

                    {/* Edit Course Button */}
                    <button
                      type="button"
                      onClick={() => setEditingCourse(course)}
                      className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Course Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Course Form */}
                    <form
                      action={deleteCourse}
                      onSubmit={(e) => {
                        if (
                          !confirm(
                            `Are you sure you want to delete "${course.title}" and all its lessons?`
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="courseId" value={course.id} />
                      <button
                        type="submit"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Content Type Selector */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-slate-500">Post Content As:</span>
                  <button
                    type="button"
                    onClick={() => setLessonTypeForCourse(course.id, "VIDEO")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                      currentType === "VIDEO"
                        ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> Video Lecture
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonTypeForCourse(course.id, "ARTICLE")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                      currentType === "ARTICLE"
                        ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Written Article / Notes
                  </button>
                </div>

                {/* Add Content Form */}
                <form
                  action={addLesson}
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3"
                >
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="contentType" value={currentType} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Section / Chapter Name
                      </label>
                      <input
                        type="text"
                        name="sectionTitle"
                        placeholder="e.g. Unit 1: Introduction"
                        required
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white text-slate-900 focus:outline-teal-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Title of this Lesson / Article
                      </label>
                      <input
                        type="text"
                        name="lessonTitle"
                        placeholder="e.g. Principles of Magmatic Differentiation"
                        required
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white text-slate-900 focus:outline-teal-600"
                      />
                    </div>
                  </div>

                  {currentType === "VIDEO" ? (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Video Source (YouTube Link / ID or Google Drive URL)
                      </label>
                      <input
                        type="text"
                        name="videoId"
                        placeholder="https://www.youtube.com/watch?v=... or Google Drive link"
                        required
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white text-slate-900 font-mono text-xs focus:outline-teal-600"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Article Body / Study Material
                      </label>
                      <textarea
                        name="articleBody"
                        rows={6}
                        placeholder="Write or paste your article notes, study material, formulas, or key points here..."
                        required
                        className="w-full border-2 border-slate-300 focus:border-teal-600 rounded-lg p-3 text-sm bg-white text-slate-900 placeholder-slate-400 font-normal leading-relaxed focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPreview"
                        className="accent-teal-700"
                      />
                      Free 10% Demo Access
                    </label>
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                    >
                      {currentType === "VIDEO" ? "Upload Video Lecture" : "Publish Article"}
                    </button>
                  </div>
                </form>

                {/* Published Lessons & Articles List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Published Content in this Module:
                  </h4>
                  {course.sections.map((section: any) => (
                    <div
                      key={section.id}
                      className="border border-slate-200 rounded-lg p-3.5 space-y-2 bg-slate-50/50"
                    >
                      <h5 className="font-semibold text-xs text-slate-700 uppercase">
                        📂 {section.title}
                      </h5>
                      <div className="space-y-2">
                        {section.lessons.map((lesson: any) => {
                          const isExpanded = !!expandedArticles[lesson.id];

                          return (
                            <div
                              key={lesson.id}
                              className="bg-white border border-slate-200 rounded-lg p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-900 font-semibold flex items-center gap-1.5">
                                  {lesson.contentType === "ARTICLE" ? (
                                    <FileText className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                                  ) : (
                                    <Video className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                  )}
                                  {lesson.title}
                                </span>

                                <div className="flex items-center gap-2">
                                  {lesson.isPreview ? (
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                      Free Preview
                                    </span>
                                  ) : (
                                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                      Paid Only
                                    </span>
                                  )}

                                  {lesson.contentType === "ARTICLE" && (
                                    <button
                                      type="button"
                                      onClick={() => toggleArticlePreview(lesson.id)}
                                      className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded"
                                    >
                                      {isExpanded ? (
                                        <>
                                          Hide Notes <ChevronUp className="w-3 h-3" />
                                        </>
                                      ) : (
                                        <>
                                          👁 Read Notes <ChevronDown className="w-3 h-3" />
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {/* Edit Lesson Button */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingLesson(lesson)}
                                    className="p-1 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded"
                                    title="Edit Lesson / Article"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Lesson Button */}
                                  <form
                                    action={deleteLesson}
                                    onSubmit={(e) => {
                                      if (!confirm(`Delete "${lesson.title}"?`)) {
                                        e.preventDefault();
                                      }
                                    }}
                                  >
                                    <input type="hidden" name="lessonId" value={lesson.id} />
                                    <button
                                      type="submit"
                                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                      title="Delete Lesson"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </form>
                                </div>
                              </div>

                              {/* Accordion Text Preview for Admin */}
                              {lesson.contentType === "ARTICLE" && isExpanded && (
                                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                  {lesson.articleBody || (
                                    <span className="text-slate-400 italic">
                                      No text content found.
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* --- EDIT COURSE MODAL --- */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Module Details</h3>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateCourse(formData);
                setEditingCourse(null);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="courseId" value={editingCourse.id} />

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Module Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingCourse.title}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingCourse.category}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Sub-Topic
                  </label>
                  <input
                    type="text"
                    name="subCategory"
                    defaultValue={editingCourse.subCategory}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Price (INR)
                </label>
                <input
                  type="number"
                  step="1"
                  name="price"
                  defaultValue={editingCourse.price}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingCourse.description}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-bold hover:bg-teal-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT LESSON / ARTICLE MODAL --- */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit {editingLesson.contentType === "ARTICLE" ? "Article Notes" : "Video Lecture"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateLesson(formData);
                setEditingLesson(null);
              }}
              className="space-y-3"
            >
              <input type="hidden" name="lessonId" value={editingLesson.id} />
              <input type="hidden" name="contentType" value={editingLesson.contentType} />

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingLesson.title}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                />
              </div>

              {editingLesson.contentType === "VIDEO" ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Video URL or ID
                  </label>
                  <input
                    type="text"
                    name="videoId"
                    defaultValue={editingLesson.videoId || ""}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-900 font-mono text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Article Text / Study Notes
                  </label>
                  <textarea
                    name="articleBody"
                    rows={8}
                    defaultValue={editingLesson.articleBody || ""}
                    required
                    className="w-full border-2 border-slate-300 rounded-lg p-3 text-sm text-slate-900 leading-relaxed"
                  />
                </div>
              )}

              <div className="pt-1">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    name="isPreview"
                    defaultChecked={editingLesson.isPreview}
                    className="accent-teal-700"
                  />
                  Free 10% Demo Access
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-bold hover:bg-teal-800"
                >
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}