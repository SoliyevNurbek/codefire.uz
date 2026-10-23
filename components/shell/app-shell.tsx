import { ContestBanner } from "./contest-banner";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <ContestBanner />
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col pb-16 focus:outline-none sm:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
