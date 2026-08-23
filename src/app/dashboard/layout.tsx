import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { UserNav } from "@/components/user-nav";
import { NotificationCenter } from "@/components/notification-center";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar role={user.role} userName={user.name} userEmail={user.email} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 md:ml-[260px]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm">
          <MobileSidebar role={user.role} userName={user.name} userEmail={user.email} />

          <div className="flex flex-1 items-center justify-between min-w-0">
            <h1 className="text-lg font-semibold text-slate-800 truncate">Dashboard</h1>
            <div className="flex items-center gap-3 shrink-0">
              <NotificationCenter />
              <Separator orientation="vertical" className="h-6" />
              <UserNav user={user} />
            </div>
          </div>
        </header>

        {/* Content - overflow auto ermöglicht Scroll */}
        <main className="flex-1 p-6 min-w-0 overflow-auto">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
