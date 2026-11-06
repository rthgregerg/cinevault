import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  withPadding?: boolean;
}

export default function PageWrapper({ children, withPadding = true }: PageWrapperProps) {
  return (
    <main className="min-h-screen pb-20 lg:pb-0 lg:pl-56 xl:pr-60">
      {/* 桌面端左侧导航 224px + 右侧氛围栏 240px；中间内容最大 1280px 居中，
          与移动端共享同一套栅格与左右留白 */}
      <div className="mx-auto w-full max-w-content">
        <div className={withPadding ? "px-4 md:px-6 lg:px-8" : undefined}>
          {children}
        </div>
      </div>
    </main>
  );
}
