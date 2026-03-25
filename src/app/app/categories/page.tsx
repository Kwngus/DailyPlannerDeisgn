"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useCategories } from "@/lib/hooks/useCategories";

const PRESET_COLORS = [
  "#FFD250",
  "#82DC9F",
  "#78B4FF",
  "#FF8C8C",
  "#C88CFF",
  "#FFA964",
];

export default function CategoriesPage() {
  const { categories, addCategory, deleteCategory } = useCategories();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    setAdding(true);
    await addCategory(name.trim(), color);
    setName("");
    setColor(PRESET_COLORS[0]);
    setError(null);
    setAdding(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h2 className="font-serif text-2xl mb-6">분류 지정</h2>

      {/* 기존 분류 목록 */}
      <div className="space-y-2 mb-8">
        {categories.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            아직 분류가 없어요. 아래에서 추가해보세요!
          </p>
        )}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3"
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ background: cat.color }}
            />
            <span className="flex-1 text-sm font-semibold">{cat.name}</span>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* 새 분류 추가 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          새 분류 추가
        </h3>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="예: 운동, 공부, 업무"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F7F5F0]
                       text-sm outline-none focus:border-gray-800 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            색상
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-all hover:scale-110"
                style={{
                  background: c,
                  outline:
                    color === c ? `3px solid #1A1714` : "3px solid transparent",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          onClick={handleAdd}
          disabled={adding}
          className="w-full py-2.5 bg-[#1A1714] text-white rounded-xl text-sm font-semibold
                     flex items-center justify-center gap-2
                     hover:bg-[#3D3430] transition-colors disabled:opacity-50"
        >
          <Plus size={16} />
          {adding ? "추가 중..." : "분류 추가"}
        </button>
      </div>
    </div>
  );
}
