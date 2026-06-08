import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
}

export default function SectionHeader({ title, subtitle, href }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-display">{title}</h2>
        {subtitle && <p className="text-text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="text-gold text-xs hover:underline shrink-0">
          查看全部 →
        </Link>
      )}
    </div>
  );
}
