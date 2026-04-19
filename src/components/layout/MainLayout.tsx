import React from "react";
import { GlobalHeader } from "./GlobalHeader";
import { GlobalFooter } from "./GlobalFooter";

interface MainLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const MainLayout = ({ children, hideHeader = false, hideFooter = false }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideHeader && <GlobalHeader />}
      <main className={`flex-1 ${!hideHeader ? 'pt-[72px]' : ''}`}>
        {children}
      </main>
      {!hideFooter && <GlobalFooter />}
    </div>
  );
};
