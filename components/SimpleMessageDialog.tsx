/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { messageSchema, type MessageFormData } from '@/lib/validations';
import type { Report } from '@/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FuturisticButton } from './ui/futuristic-button';

interface SimpleMessageDialogProps {
  report: Report;
  trigger: React.ReactNode;
  defaultMessage?: string;
}

export function SimpleMessageDialog({
  report,
  trigger,
  defaultMessage,
}: SimpleMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      reportId: report._id,
      messageType: 'inquiry',
      priority: 'normal',
      message: defaultMessage || '',
    },
  });

  const onSubmit = async (data: MessageFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          '📨 Message sent successfully! The owner will contact you soon.'
        );
        reset();
        setOpen(false);
      } else {
        toast.error(result.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Contact Owner
          </DialogTitle>
          <DialogDescription>
            Send a one-time message about this {report.brand} {report.color}{' '}
            phone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('reportId')} />
          <input type="hidden" {...register('messageType')} />
          <input type="hidden" {...register('priority')} />

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder={`Hi! I ${
                report.type === 'lost' ? 'found' : 'lost'
              } a phone that matches your description. Please contact me so we can arrange the return.`}
              rows={4}
              className="glass resize-none"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <FuturisticButton
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </FuturisticButton>
            <FuturisticButton
              type="submit"
              variant="glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </FuturisticButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
