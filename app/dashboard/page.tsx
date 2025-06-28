import { Suspense } from "react"
import DashboardContent from "../../components/dashboard-content"
import { AwwwardsLoading } from '@/components/ui/loading';
// Loading component for the dashboard
function DashboardLoading() {
  return (
    <div className="min-h-screen  flex items-center justify-center">
<AwwwardsLoading isLoading={true} />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
