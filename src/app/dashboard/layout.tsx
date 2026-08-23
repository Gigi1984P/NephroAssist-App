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
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          role={user.role}
          userName={user.name}
          userEmail={user.email}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-[260px]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm">
          <MobileSidebar
            role={user.role}
            userName={user.name}
            userEmail={user.email}
          />

          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <Separator orientation="vertical" className="h-6" />
              <UserNav user={user} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
