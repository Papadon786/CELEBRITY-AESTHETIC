import { getCurrentUser } from "@/lib/auth"
import { getMyAttendance, getMyLeaveRequests, getAllLeaveRequests, getStaffAttendanceForDate } from "@/actions/attendance"
import { AttendanceView } from "@/components/attendance/attendance-view"

export default async function AttendancePage() {
  const user = await getCurrentUser()
  const isAdmin = user.role === "ADMIN"

  const [myAttendance, myLeaveRequests, allLeaveRequests, todayOverview] = await Promise.all([
    getMyAttendance(),
    getMyLeaveRequests(),
    isAdmin ? getAllLeaveRequests() : Promise.resolve([]),
    isAdmin ? getStaffAttendanceForDate() : Promise.resolve([]),
  ])

  return (
    <AttendanceView
      isAdmin={isAdmin}
      myAttendance={myAttendance}
      myLeaveRequests={myLeaveRequests}
      allLeaveRequests={allLeaveRequests}
      todayOverview={todayOverview}
    />
  )
}
