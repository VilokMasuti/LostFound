/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Button } from '@/components/ui/button';
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
import type { Report } from '@/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { messageSchema } from '../lib/validations';

interface MessageDialogProps {
  report: Report;
  disabled?: boolean;
}

const formMessageSchema = messageSchema.extend({
  messageType: messageSchema.shape.messageType.optional(),
  priority: messageSchema.shape.priority.optional(),
});

type FormMessageData = z.infer<typeof formMessageSchema>;
export function MessageDialog({ report, disabled }: MessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormMessageData>({
    resolver: zodResolver(formMessageSchema), // Use the new schema
    defaultValues: {
      reportId: report._id,
      messageType: 'inquiry', // Default value
      priority: 'normal', // Default value
    },
  });

  const onSubmit = async (data: FormMessageData) => {
    // 2. Apply backend defaults if values are missing
    const payload = {
      ...data,
      messageType: data.messageType || 'inquiry',
      priority: data.priority || 'normal',
    };

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success('Message sent successfully!');
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
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <MessageCircle className="h-4 w-4 mr-1" />
          Message Owner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Report Owner</DialogTitle>
          <DialogDescription>
            Send a message about this {report.type} {report.brand}{' '}
            {report.color} phone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('reportId')} />
          <input type="hidden" {...register('messageType')} />
          <input type="hidden" {...register('priority')} />

          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <input
              id="subject"
              type="text"
              placeholder="Subject for your message"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('subject')}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Hi, I think I found/lost your phone. Please contact me..."
              rows={4}
              {...register('message')}
            />
            {errors.message && (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
