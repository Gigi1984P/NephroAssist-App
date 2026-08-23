import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TaskDetail } from "@/components/task-detail";

interface TaskPageProps {
  params: { id: string };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      requirement: {
        include: {
          patientCase: {
            include: {
              patient: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    notFound();
  }

  return <TaskDetail task={task} />;
}
