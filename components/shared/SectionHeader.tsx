import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
}

export default function SectionHeader({ title, subtitle, href }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg md:text-xl font-semibold text-text-primary font-display leading-tight truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-text-muted text-[10px] tracking-[0.18em] mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link href={href} className="text-gold text-xs hover:underline shrink-0 pb-0.5">
          查看全部 →
        </Link>
      )}
    </div>
  );
}