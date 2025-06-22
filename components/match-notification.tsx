'use client';

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Eye, MessageCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { FuturisticButton } from '../components/ui/futuristic-button';

interface MatchNotificationProps {
  match: {
    _id: string;
    similarity: number;
    confidence: string;
    status: string;
    createdAt: Date;
    matchedReport: {
      _id: string;
      brand: string;
      color: string;
      location: string;
      type: string;
      user?: {
        name: string;
        email: string;
      };
    };
  };
  onViewMatch: (matchId: string) => void;
  onContactUser: (reportId: string) => void;
}

export function MatchNotification({
  match,
  onViewMatch,
  onContactUser,
}: MatchNotificationProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Match Found!
                <Badge className={`${getStatusColor(match.status)} text-white`}>
                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(match.createdAt), 'MMM dd, yyyy')}
                </span>
                <span
                  className={`font-medium ${getConfidenceColor(
                    match.confidence
                  )}`}
                >
                  {Math.round(match.similarity * 100)}% match •{' '}
                  {match.confidence} confidence
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Matched Report Details:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Device:</span>{' '}
                <span className="font-medium">
                  {match.matchedReport.brand} - {match.matchedReport.color}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>{' '}
                <span className="font-medium capitalize">
                  {match.matchedReport.type}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Location:</span>{' '}
                <span className="font-medium">
                  {match.matchedReport.location}
                </span>
              </div>
              {match.matchedReport.user && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Contact:</span>{' '}
                  <span className="font-medium">
                    {match.matchedReport.user.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <FuturisticButton
              variant="glow"
              size="sm"
              onClick={() => onViewMatch(match._id)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </FuturisticButton>
            <FuturisticButton
              variant="outline"
              size="sm"
              onClick={() => onContactUser(match.matchedReport._id)}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Contact User
            </FuturisticButton>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
