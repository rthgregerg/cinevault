import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  withPadding?: boolean;
}

export default function PageWrapper({ children, withPadding = true }: PageWrapperProps) {
  return (
    <main
      className={`min-h-screen lg:ml-56 pb-20 lg:pb-0 ${
        withPadding ? "px-4 md:px-6 lg:px-8" : ""
      } max-w-content mx-auto`}
    >
      {children}
    </main>
  );
}
