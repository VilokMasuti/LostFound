'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import type { Report } from '@/type';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, Eye, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { MessageDialog } from './MessageDialog';

interface ReportCardProps {
  report: Report;
  onViewDetails?: (report: Report) => void;
  showActions?: boolean;
  onDelete?: (reportId: string) => void;
}

export function ReportCard({
  report,
  onViewDetails,
  showActions,
  onDelete,
}: ReportCardProps) {
  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return phone;
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
  };

  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                {report.brand} - {report.color}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={report.type === 'lost' ? 'destructive' : 'default'}
                >
                  {report.type.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(report.dateLostFound), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Image */}
          {report.imageUrl && (
            <div className="relative h-32 w-full rounded-md overflow-hidden">
              <Image
                src={report.imageUrl || '/placeholder.svg'}
                alt={`${report.brand} ${report.color} phone`}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{report.location}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.description}
          </p>

          {/* Contact Info */}
          <div className="space-y-2">
            {report.contactEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${report.contactEmail}`}
                  className="text-primary hover:underline"
                >
                  Contact via email
                </a>
              </div>
            )}
            {report.contactPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{maskPhone(report.contactPhone)}</span>
              </div>
            )}
            {!report.contactEmail && !report.contactPhone && (
              <p className="text-sm text-muted-foreground italic">
                No contact information provided
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(report)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            )}
            {user && user._id !== report.userId && (
              <MessageDialog
                report={report}
                disabled={!report.contactEmail && !report.contactPhone}
              />
            )}
            {showActions && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(report._id)}
              >
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
