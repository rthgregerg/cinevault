"use client";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import CollectionCard from "@/components/collection/CollectionCard";
import CreateCollectionModal from "@/components/collection/CreateCollectionModal";
import { getCollections, createCollection, deleteCollection } from "@/lib/storage";
import type { Collection } from "@/lib/types";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const refresh = () => setCollections(getCollections());

  useEffect(() => { refresh(); }, []);

  const handleCreate = (name: string, description: string) => {
    createCollection(name, description);
    refresh();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定删除收藏夹「${name}」吗？电影将从收藏夹移除但不会被删除。`)) {
      deleteCollection(id);
      refresh();
    }
  };

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-display font-semibold text-text-primary">我的收藏夹</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-xs bg-gold/10 text-gold border border-gold/20 rounded-btn hover:bg-gold/20 transition-colors"
          >
            + 新建
          </button>
        </div>
        <p className="text-text-muted text-sm mb-6">自定义分类管理你的电影收藏</p>

        {collections.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-30">📁</div>
            <p className="text-text-muted text-sm mb-4">还没有收藏夹</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 bg-gold text-black font-medium text-sm rounded-btn hover:opacity-90 transition-opacity"
            >
              创建第一个收藏夹
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((c) => (
              <div key={c.id} className="relative group/card">
                <CollectionCard collection={c} />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(c.id, c.name);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-text-muted hover:text-red-400 hover:bg-black/80 text-xs flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
                  title="删除收藏夹"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateCollectionModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </PageWrapper>
  );
}
