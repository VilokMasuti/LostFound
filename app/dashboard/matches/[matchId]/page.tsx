/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { ContactModal } from '@/components/ContactModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (params.matchId) {
      fetchMatch(params.matchId as string);
    }
  }, [params.matchId]);

  const fetchMatch = async (matchId: string) => {
    try {
      const response = await fetch(`/api/matches/${matchId}`);
      if (response.ok) {
        const data = await response.json();
        setMatch(data);
      }
    } catch (error) {
      console.error('Failed to fetch match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMatch = async () => {
    setConfirming(true);
    try {
      const response = await fetch(`/api/matches/${match._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (response.ok) {
        toast.success('✅ Match confirmed! You can now contact the finder.');
        fetchMatch(match._id);
      }
    } catch (error) {
      toast.error('Failed to confirm match');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Match not found</h2>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Determine user role
  const isLostUser =
    match.report?.userId === user?.id && match.report?.type === 'lost';
  const isFoundUser =
    match.matchedReport?.userId === user?.id &&
    match.matchedReport?.type === 'found';

  const lostReport =
    match.report?.type === 'lost' ? match.report : match.matchedReport;
  const foundReport =
    match.report?.type === 'found' ? match.report : match.matchedReport;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard?tab=matches')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Button>
        </div>

        {/* Match Status */}
        <Alert
          className={`mb-6 ${
            match.status === 'confirmed'
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
          }`}
        >
          <CheckCircle
            className={`h-4 w-4 ${
              match.status === 'confirmed'
                ? 'text-green-600'
                : 'text-yellow-600'
            }`}
          />
          <AlertDescription
            className={
              match.status === 'confirmed'
                ? 'text-green-800 dark:text-green-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }
          >
            {match.status === 'confirmed' ? (
              <strong>✅ Match Confirmed!</strong>
            ) : (
              <strong>
                🎯 Match Found - {Math.round(match.similarity * 100)}%
                similarity
              </strong>
            )}{' '}
            {match.status === 'pending' &&
              isLostUser &&
              'Please confirm if this is your phone.'}
            {match.status === 'pending' &&
              isFoundUser &&
              'Waiting for owner confirmation.'}
            {match.status === 'confirmed' &&
              'You can now contact each other to arrange pickup.'}
          </AlertDescription>
        </Alert>

        {/* Reports Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Lost Phone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Phone className="w-5 h-5" />
                Lost Phone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lostReport?.imageUrl && (
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={lostReport.imageUrl || '/placeholder.svg'}
                    alt="Lost phone"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {lostReport?.brand} {lostReport?.color}
                  {lostReport?.model && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({lostReport.model})
                    </span>
                  )}
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{lostReport?.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {lostReport?.dateLostFound &&
                        format(
                          new Date(lostReport.dateLostFound),
                          'MMM dd, yyyy'
                        )}
                    </span>
                  </div>
                </div>
                <p className="text-sm">{lostReport?.description}</p>
                <p className="text-xs text-muted-foreground">
                  Reported by: {lostReport?.user?.name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Found Phone */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Phone className="w-5 h-5" />
                Found Phone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {foundReport?.imageUrl && (
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={foundReport.imageUrl || '/placeholder.svg'}
                    alt="Found phone"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {foundReport?.brand} {foundReport?.color}
                  {foundReport?.model && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({foundReport.model})
                    </span>
                  )}
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{foundReport?.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {foundReport?.dateLostFound &&
                        format(
                          new Date(foundReport.dateLostFound),
                          'MMM dd, yyyy'
                        )}
                    </span>
                  </div>
                </div>
                <p className="text-sm">{foundReport?.description}</p>
                <p className="text-xs text-muted-foreground">
                  Found by: {foundReport?.user?.name}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Lost User Actions */}
              {isLostUser && match.status === 'pending' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Is this your phone? Please confirm to proceed with contact.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={handleConfirmMatch} disabled={confirming}>
                      {confirming ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Yes, This Is My Phone!
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Found User Waiting */}
              {isFoundUser && match.status === 'pending' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Waiting for owner confirmation
                    </p>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    The owner needs to confirm this is their phone before you
                    can contact each other.
                  </p>
                </div>
              )}

              {/* Contact Actions (Available after confirmation) */}
              {match.status === 'confirmed' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Match confirmed! You can now contact each other to arrange
                    pickup.
                  </p>
                  <div className="flex gap-3">
                    <ContactModal
                      trigger={
                        <Button>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact {isLostUser ? 'Finder' : 'Owner'}
                        </Button>
                      }
                      reportData={isLostUser ? foundReport : lostReport}
                      userRole={isLostUser ? 'owner' : 'finder'}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
