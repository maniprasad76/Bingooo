import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../common/database/store';

@Injectable()
export class NotificationsService {
  /** Get notifications list with optional category filter */
  findAll(category?: string) {
    let items = [...db.notifications];
    if (category && category !== 'all') {
      items = items.filter((n) => n.category === category);
    }
    return items.map((n) => ({
      id: n.id,
      category: n.category,
      severity: n.severity,
      title: n.title,
      description: n.description,
      linkHref: n.link_href,
      linkText: n.link_text,
      isRead: Boolean(n.is_read),
      created_at: n.created_at,
    }));
  }

  /** Mark single notification as read */
  markAsRead(id: string) {
    const notif = db.notifications.find((n) => n.id === id);
    if (!notif) {
      throw new NotFoundException({ code: 'NOTIF_NOT_FOUND', message: 'Notification not found.' });
    }
    notif.is_read = true;
    return { success: true, id };
  }

  /** Mark all as read */
  markAllAsRead() {
    db.notifications.forEach((n) => {
      n.is_read = true;
    });
    return { success: true, message: 'All notifications marked as read.' };
  }

  /** Delete notification */
  delete(id: string) {
    db.notifications = db.notifications.filter((n) => n.id !== id);
    return { success: true, id };
  }

  /** Create custom alert or broadcast */
  create(data: {
    category: 'order' | 'custom' | 'stock' | 'payment';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    linkHref?: string;
    linkText?: string;
  }) {
    const newNotif = {
      id: `notif-${Date.now()}`,
      category: data.category,
      severity: data.severity,
      title: data.title,
      description: data.description,
      link_href: data.linkHref || null,
      link_text: data.linkText || null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    db.notifications.unshift(newNotif);
    return newNotif;
  }
}
