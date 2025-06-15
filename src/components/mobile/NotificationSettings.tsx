
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationSettings: React.FC = () => {
  const { 
    permission, 
    settings, 
    requestPermission, 
    updateSettings 
  } = useNotifications();

  const handlePermissionRequest = async () => {
    await requestPermission();
  };

  if (permission === 'denied') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellOff className="w-5 h-5" />
            <span>Notifications Blocked</span>
          </CardTitle>
          <CardDescription>
            Notifications are blocked. Enable them in your browser settings to receive study reminders.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (permission === 'default') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Enable Notifications</span>
          </CardTitle>
          <CardDescription>
            Get reminders to study, maintain your streak, and review cards when they're due.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePermissionRequest} className="w-full">
            Enable Notifications
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>Notification Settings</span>
        </CardTitle>
        <CardDescription>
          Customize when and how you receive study reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications-enabled">Enable Notifications</Label>
          <Switch
            id="notifications-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="study-reminders">Daily Study Reminders</Label>
                <Switch
                  id="study-reminders"
                  checked={settings.studyReminders}
                  onCheckedChange={(checked) => updateSettings({ studyReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="streak-reminders">Streak Reminders</Label>
                <Switch
                  id="streak-reminders"
                  checked={settings.streakReminders}
                  onCheckedChange={(checked) => updateSettings({ streakReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="cards-due">Cards Due Alerts</Label>
                <Switch
                  id="cards-due"
                  checked={settings.cardsDue}
                  onCheckedChange={(checked) => updateSettings({ cardsDue: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="new-decks">New Deck Notifications</Label>
                <Switch
                  id="new-decks"
                  checked={settings.newDecks}
                  onCheckedChange={(checked) => updateSettings({ newDecks: checked })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time">Daily Reminder Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSettings({ reminderTime: e.target.value })}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
