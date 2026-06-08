export default function EmptyState({ message = "暂无内容" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-text-muted">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-40">
        <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 14h40" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="11" r="1.5" fill="currentColor" />
        <circle cx="17" cy="11" r="1.5" fill="currentColor" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}
