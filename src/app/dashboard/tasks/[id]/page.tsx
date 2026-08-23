import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TaskDetail from "@/components/task-detail";

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      requirement: {
        include: {
          patientCase: {
            include: {
              patient: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!task) {
    notFound();
  }

  // Transformiere in das erwartete Format
  const taskData = {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate?.toISOString() || null,
    isWorkflowStep: task.isWorkflowStep,
    requirement: task.requirement ? {
      title: task.requirement.title,
      description: task.requirement.description,
      category: task.requirement.category,
      patientCase: {
        patient: {
          firstName: task.requirement.patientCase?.patient?.firstName || "",
          lastName: task.requirement.patientCase?.patient?.lastName || "",
        },
      },
    } : null,
  };

  return <TaskDetail task={taskData} />;
}
