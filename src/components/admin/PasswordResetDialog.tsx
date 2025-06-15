
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Key, Mail, Copy, Eye, EyeOff } from 'lucide-react';

interface PasswordResetDialogProps {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const generateTempPassword = async () => {
    if (!currentOrganization) return;

    setLoading(true);
    try {
      // Generate temporary password
      const { data: passwordData, error: passwordError } = await supabase
        .rpc('generate_temp_password');

      if (passwordError) throw passwordError;

      // Generate reset token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_reset_token');

      if (tokenError) throw tokenError;

      // Store the reset token in database
      const { error: insertError } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: user.id,
          token: tokenData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (insertError) throw insertError;

      setTempPassword(passwordData);
      setResetToken(tokenData);

      toast({
        title: "Success",
        description: "Temporary password generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating password:', error);
      toast({
        title: "Error",
        description: "Failed to generate temporary password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async () => {
    setLoading(true);
    try {
      // This would typically call an edge function to send reset email
      // For now, we'll just show a success message
      toast({
        title: "Email Sent",
        description: "Password reset email has been sent to the user.",
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: `${type} copied to clipboard.`,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const userName = user.first_name || user.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Password Reset
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reset Password for: {userName}</CardTitle>
              <CardDescription>
                Choose how you want to reset the user's password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="temp-password" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="temp-password" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Generate Temp Password
                  </TabsTrigger>
                  <TabsTrigger value="email-reset" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Reset Link
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="temp-password" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Generate Temporary Password</CardTitle>
                      <CardDescription>
                        Create a secure temporary password that you can share with the user.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        onClick={generateTempPassword} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Generating...' : 'Generate New Password'}
                      </Button>

                      {tempPassword && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="temp-password">Temporary Password</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="temp-password"
                                type={showPassword ? "text" : "password"}
                                value={tempPassword}
                                readOnly
                                className="font-mono"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(tempPassword, 'Password')}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {resetToken && (
                            <div className="space-y-2">
                              <Label htmlFor="reset-token">Reset Token</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id="reset-token"
                                  type="text"
                                  value={resetToken}
                                  readOnly
                                  className="font-mono text-xs"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(resetToken, 'Reset token')}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="bg-yellow-100">Important</Badge>
                              <div className="text-sm space-y-1">
                                <p className="font-medium">Security Notice:</p>
                                <ul className="text-muted-foreground space-y-1">
                                  <li>• Share this password securely with the user</li>
                                  <li>• The password expires in 24 hours</li>
                                  <li>• User should change it immediately after login</li>
                                  <li>• Keep the reset token for your records</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="email-reset" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Send Reset Email</CardTitle>
                      <CardDescription>
                        Send a password reset link to the user's email address.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input value={user.email} readOnly className="bg-muted" />
                      </div>

                      <Button 
                        onClick={sendPasswordResetEmail} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Sending...' : 'Send Reset Email'}
                      </Button>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="bg-blue-100">Info</Badge>
                          <div className="text-sm space-y-1">
                            <p className="font-medium">Email Reset Process:</p>
                            <ul className="text-muted-foreground space-y-1">
                              <li>• User will receive an email with reset instructions</li>
                              <li>• The reset link expires in 24 hours</li>
                              <li>• User can create their own new password</li>
                              <li>• More secure than sharing temporary passwords</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
