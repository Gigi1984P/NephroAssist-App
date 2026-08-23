import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { NotificationCenter } from "@/components/notification-center";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-slate-50/40 lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <span className="text-xl font-semibold">NephroAssist</span>
          </div>
        </div>
        <div className="py-4">
          <DashboardNav role={session.user.role} />
        </div>
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <UserNav user={session.user} />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
