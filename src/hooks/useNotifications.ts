
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'study_reminder' | 'streak_reminder' | 'cards_due' | 'new_deck';

interface NotificationSettings {
  enabled: boolean;
  studyReminders: boolean;
  streakReminders: boolean;
  cardsDue: boolean;
  newDecks: boolean;
  reminderTime: string; // HH:MM format
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    studyReminders: true,
    streakReminders: true,
    cardsDue: true,
    newDecks: false,
    reminderTime: '19:00'
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    if (user) {
      loadNotificationSettings();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('notification_settings')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (data?.notification_settings) {
        setSettings(data.notification_settings);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await updateSettings({ ...settings, enabled: true });
        
        // Register for push notifications if service worker is available
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if ('pushManager' in registration) {
            // Get VAPID key from environment or backend
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with actual key
            });
            
            // Send subscription to backend
            await supabase.functions.invoke('register-push-subscription', {
              body: { subscription, userId: user!.id }
            });
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      if (user) {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            notification_settings: updatedSettings
          });
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const scheduleLocalNotification = (title: string, body: string, delay: number) => {
    if (permission !== 'granted') return;

    setTimeout(() => {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'study-reminder',
        requireInteraction: false
      });
    }, delay);
  };

  const showStudyReminder = () => {
    if (settings.enabled && settings.studyReminders) {
      scheduleLocalNotification(
        'Time to Study! 📚',
        'Keep your streak going. Review your flashcards now!',
        0
      );
    }
  };

  const showStreakReminder = (streakDays: number) => {
    if (settings.enabled && settings.streakReminders) {
      scheduleLocalNotification(
        `${streakDays} Day Streak! 🔥`,
        "Don't break your streak! Study today to keep it going.",
        0
      );
    }
  };

  const showCardsDueReminder = (cardCount: number) => {
    if (settings.enabled && settings.cardsDue) {
      scheduleLocalNotification(
        'Cards Due for Review',
        `You have ${cardCount} cards ready for review. Tap to study now!`,
        0
      );
    }
  };

  return {
    permission,
    settings,
    requestPermission,
    updateSettings,
    scheduleLocalNotification,
    showStudyReminder,
    showStreakReminder,
    showCardsDueReminder
  };
};
