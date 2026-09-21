import { listTasks } from "@/actions/tasks"
import { getAllStaff, getCurrentUser } from "@/lib/auth"
import { TasksView } from "@/components/tasks/tasks-view"

export default async function TasksPage() {
  const [tasks, staff, user] = await Promise.all([listTasks("all"), getAllStaff(), getCurrentUser()])
  return <TasksView tasks={tasks} staff={staff} currentUserId={user.id} />
}
