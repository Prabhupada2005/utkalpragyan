"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CATEGORIES_DATA } from "@/lib/categories";

export default function NavbarMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <nav ref={menuRef} className="flex items-center gap-1 sm:gap-2 relative">
      {CATEGORIES_DATA.map((item, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div key={item.title} className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown(idx)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isOpen
                  ? "bg-teal-700 text-white shadow-sm"
                  : "text-slate-700 hover:text-teal-900 hover:bg-slate-100"
              }`}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-white" : "text-slate-400"
                }`}
              />
            </button>

            {isOpen && (
              <div className="absolute left-0 mt-2 w-56 sm:w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.title} Syllabus
                  </p>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-0.5">
                  {item.subheadings.map((sub) => (
                    <Link
                      key={sub}
                      href={`/?category=${encodeURIComponent(
                        item.title
                      )}&subCategory=${encodeURIComponent(sub)}#courses`}
                      onClick={() => setOpenIndex(null)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 font-medium transition"
                    >
                      <span className="text-teal-600 font-bold">→</span>
                      <span>{sub}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}