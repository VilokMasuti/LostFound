import { AwwwardsLoading } from '@/components/ui/loading';
import { Suspense } from 'react';
import ReportsContent from './reports-content';
// Loading component for the reports page
function ReportsLoading() {
  return (
    <div className="min-h-screen b flex items-center justify-center">
      <AwwwardsLoading isLoading={true} />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<ReportsLoading />}>
      <ReportsContent />
    </Suspense>
  );
}
