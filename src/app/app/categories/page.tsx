"use client";

import { useState } from "react";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";
import { useCategories } from "@/lib/hooks/useCategories";
import type { Category } from "@/types";

const PRESET_COLORS = [
  "#FFD250", "#82DC9F", "#78B4FF", "#FF8C8C", "#C88CFF", "#FFA964",
  "#378ADD", "#85B7EB", "#B5D4F4", "#E6F1FB",
  "#7F77DD", "#AFA9EC", "#E24B4A",
  "#D85A30", "#EF9F27",
  "#1D9E75", "#5DCAA5",
  "#D4537E", "#ED93B1", "#F4C0D1",
  "#534AB7", "#CECBF6", "#EEEDFE",
  "#888780", "#D3D1C7",
];

function isValidHex(hex: string) {
  return /^#([0-9A-Fa-f]{6})$/.test(hex);
}

type EditState = { name: string; color: string; hexInput: string };

function ColorPicker({
  color, hexInput, onSelectPreset, onHexChange,
}: {
  color: string;
  hexInput: string;
  onSelectPreset: (c: string) => void;
  onHexChange: (raw: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onSelectPreset(c)}
            className="w-7 h-7 rounded-full transition-all hover:scale-110"
            style={{
              background: c,
              outline: color === c ? "3px solid var(--accent)" : "3px solid transparent",
              outlineOffset: "2px",
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {/* 네이티브 컬러 피커 */}
        <label
          className="w-8 h-8 rounded-full flex-shrink-0 border border-[var(--border)] cursor-pointer hover:scale-110 transition-transform overflow-hidden"
          title="색상 직접 선택"
          style={{ background: isValidHex(hexInput) ? hexInput : "#ccc" }}
        >
          <input
            type="color"
            value={isValidHex(hexInput) ? hexInput : "#cccccc"}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="opacity-0 w-0 h-0 absolute"
          />
        </label>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => onHexChange(e.target.value)}
          placeholder="#378ADD"
          maxLength={7}
          className="flex-1 px-3 py-2 rounded-xl border text-sm font-mono outline-none transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]"
        />
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();

  // 추가 폼
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [hexInput, setHexInput] = useState(PRESET_COLORS[0]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // 편집 상태 — editingId가 있으면 해당 항목 인라인 편집 중
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", color: "", hexInput: "" });
  const [saving, setSaving] = useState(false);

  function applyHex(raw: string, setter: (s: EditState) => void, current: EditState) {
    const val = raw.startsWith("#") ? raw : "#" + raw;
    setter({ ...current, hexInput: val, color: isValidHex(val) ? val : current.color });
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditState({ name: cat.name, color: cat.color, hexInput: cat.color });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleUpdate() {
    if (!editState.name.trim()) return;
    if (!isValidHex(editState.color)) return;
    setSaving(true);
    await updateCategory(editingId!, editState.name.trim(), editState.color);
    setSaving(false);
    setEditingId(null);
  }

  async function handleAdd() {
    if (!name.trim()) { setAddError("이름을 입력해주세요."); return; }
    if (!isValidHex(color)) { setAddError("올바른 hex 색상을 입력해주세요. (예: #378ADD)"); return; }
    setAdding(true);
    await addCategory(name.trim(), color);
    setName("");
    setColor(PRESET_COLORS[0]);
    setHexInput(PRESET_COLORS[0]);
    setAddError(null);
    setAdding(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h2 className="font-serif text-2xl mb-6">분류 지정</h2>

      {/* 기존 분류 목록 */}
      <div className="space-y-2 mb-8">
        {categories.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">
            아직 분류가 없어요. 아래에서 추가해보세요!
          </p>
        )}
        {categories.map((cat) =>
          editingId === cat.id ? (
            /* 편집 모드 */
            <div key={cat.id} className="rounded-xl border px-4 py-3 space-y-3 bg-[var(--surface)] border-[var(--accent)]">
              <input
                type="text"
                value={editState.name}
                onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                autoFocus
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]"
              />
              <ColorPicker
                color={editState.color}
                hexInput={editState.hexInput}
                onSelectPreset={(c) => setEditState((s) => ({ ...s, color: c, hexInput: c }))}
                onHexChange={(raw) => applyHex(raw, setEditState, editState)}
              />
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="flex-1 py-2 rounded-xl border text-sm font-semibold text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)] transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving || !editState.name.trim() || !isValidHex(editState.color)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
                >
                  <Check size={14} />
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          ) : (
            /* 일반 모드 */
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 bg-[var(--surface)] border-[var(--border)]"
            >
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cat.color }} />
              <span className="flex-1 text-sm font-semibold">{cat.name}</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">{cat.color}</span>
              <button
                onClick={() => startEdit(cat)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border-subtle)] rounded-lg transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        )}
      </div>

      {/* 새 분류 추가 */}
      <div className="rounded-2xl border p-5 space-y-4 bg-[var(--surface)] border-[var(--border)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">
          새 분류 추가
        </h3>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setAddError(null); }}
            placeholder="예: 운동, 공부, 업무"
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
            색상
          </label>
          <ColorPicker
            color={color}
            hexInput={hexInput}
            onSelectPreset={(c) => { setColor(c); setHexInput(c); }}
            onHexChange={(raw) => {
              const val = raw.startsWith("#") ? raw : "#" + raw;
              setHexInput(val);
              if (isValidHex(val)) setColor(val);
            }}
          />
        </div>

        {addError && <p className="text-red-500 text-xs">{addError}</p>}

        <button
          onClick={handleAdd}
          disabled={adding}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          <Plus size={16} />
          {adding ? "추가 중..." : "분류 추가"}
        </button>
      </div>
    </div>
  );
}
