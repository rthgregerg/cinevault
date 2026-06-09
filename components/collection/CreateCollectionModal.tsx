"use client";
import { useState, useRef, useEffect } from "react";

interface CreateCollectionModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export default function CreateCollectionModal({ onClose, onCreate }: CreateCollectionModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), desc.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-card rounded-card border border-white/10 w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95">
        <h3 className="text-base font-display font-semibold text-text-primary">新建收藏夹</h3>

        <div>
          <label className="text-xs text-text-muted block mb-1">名称 *</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            placeholder="例如：科幻经典、必看片单"
            maxLength={30}
            className="w-full px-3 py-2.5 bg-bg border border-white/10 rounded-btn text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-text-muted block mb-1">描述（可选）</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="一句话描述这个收藏夹..."
            maxLength={100}
            rows={2}
            className="w-full px-3 py-2 bg-bg border border-white/10 rounded-btn text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold/50 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-6 py-2 text-xs bg-gold text-black font-medium rounded-btn disabled:opacity-30 transition-opacity"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}
