'use server';

import { revalidatePath } from 'next/cache';

export async function sendMessage(
  reportId: string,
  message: string,
  subject?: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          message,
          subject,
          messageType: 'inquiry',
          priority: 'normal',
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Failed to send message',
      };
    }

    revalidatePath('/inbox');
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    const response = await fetch(
      `${
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      }/api/messages/${messageId}/read`,
      {
        method: 'PATCH',
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to mark message as read' };
    }

    revalidatePath('/inbox');
    return { success: true };
  } catch (error) {
    console.error('Mark message as read error:', error);
    return { success: false, error: 'Failed to mark message as read' };
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const response = await fetch(
      `${
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      }/api/messages/${messageId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to delete message' };
    }

    revalidatePath('/inbox');
    return { success: true };
  } catch (error) {
    console.error('Delete message error:', error);
    return { success: false, error: 'Failed to delete message' };
  }
}
