import type { Director } from "@/lib/types";

export default function DirectorCard({ director }: { director: Director }) {
  return (
    <div className="flex gap-3 p-3 bg-bg-card rounded-card">
      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-bg-elevated">
        {director.avatarUrl ? (
          <img src={director.avatarUrl} alt={director.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-lg font-display">
            {director.name[0]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{director.name}</p>
        <p className="text-xs text-text-muted">{director.nameEn}</p>
        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{director.bio}</p>
      </div>
    </div>
  );
}
