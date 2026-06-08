interface StatCardsProps {
  watched: number;
  wantToWatch: number;
  collected: number;
  liked: number;
}

export default function StatCards({ watched, wantToWatch, collected, liked }: StatCardsProps) {
  const stats = [
    { label: "看过", value: watched },
    { label: "想看", value: wantToWatch },
    { label: "收藏", value: collected },
    { label: "喜欢", value: liked },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map(({ label, value }) => (
        <div key={label} className="bg-bg-card rounded-card p-3 text-center">
          <span className="text-xl font-display font-semibold text-gold block">{value}</span>
          <span className="text-xs text-text-muted mt-1 block">{label}</span>
        </div>
      ))}
    </div>
  );
}
