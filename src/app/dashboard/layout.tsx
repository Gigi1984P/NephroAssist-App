import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
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

  const user = session.user;

  return (
    <div className="d-flex">
      <Sidebar role={user.role} userName={user.name} userEmail={user.email} />

      <div className="main-wrapper">
        <header className="main-header">
          <MobileSidebar role={user.role} userName={user.name} userEmail={user.email} />

          <div className="d-flex flex-grow-1 align-items-center justify-content-between">
            <h1 className="h5 fw-semibold mb-0 text-truncate" style={{ color: "#334155" }}>Dashboard</h1>
            <div className="d-flex align-items-center gap-3 flex-shrink-0">
              <NotificationCenter />
              <div style={{ width: "1px", height: "24px", background: "#e2e8f0" }} />
              <UserNav user={user} />
            </div>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
