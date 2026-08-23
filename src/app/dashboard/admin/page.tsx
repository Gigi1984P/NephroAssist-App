import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPanel } from "@/components/admin-panel";

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [users, organizations, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findMany(),
    prisma.role.findMany(),
  ]);

  return <AdminPanel users={users} organizations={organizations} roles={roles} />;
}
