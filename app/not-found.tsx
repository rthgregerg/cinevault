import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-6xl font-display font-bold text-gold/30 mb-4">404</p>
        <h1 className="text-xl font-semibold text-text-primary mb-2">页面不存在</h1>
        <p className="text-text-muted text-sm mb-6">这部电影或页面可能已被移除</p>
        <Link href="/" className="btn-gold text-sm">
          返回首页
        </Link>
      </div>
    </PageWrapper>
  );
}
