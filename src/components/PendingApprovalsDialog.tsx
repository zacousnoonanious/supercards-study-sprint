
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, Clock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface PendingApprovalsDialogProps {
  trigger?: React.ReactNode;
}

export const PendingApprovalsDialog: React.FC<PendingApprovalsDialogProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [processingMember, setProcessingMember] = useState<string | null>(null);
  const { toast } = useToast();
  const { pendingApprovals, approveMember, rejectMember } = useOrganization();

  const handleApprove = async (memberId: string, memberName: string) => {
    setProcessingMember(memberId);
    try {
      const success = await approveMember(memberId);
      
      if (success) {
        toast({
          title: "Member Approved",
          description: `${memberName} has been approved and can now access the organization.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to approve member. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setProcessingMember(null);
    }
  };

  const handleReject = async (memberId: string, memberName: string) => {
    setProcessingMember(memberId);
    try {
      const success = await rejectMember(memberId);
      
      if (success) {
        toast({
          title: "Member Rejected",
          description: `${memberName}'s request has been rejected.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to reject member. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setProcessingMember(null);
    }
  };

  const getMemberName = (approval: any) => {
    const firstName = approval.profiles?.first_name || approval.first_name || '';
    const lastName = approval.profiles?.last_name || approval.last_name || '';
    return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Unknown User';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="relative">
            <UserCheck className="w-4 h-4 mr-2" />
            Pending Approvals
            {pendingApprovals.length > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                {pendingApprovals.length}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Pending Member Approvals ({pendingApprovals.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No pending approvals</h3>
              <p className="text-muted-foreground">
                All join requests have been processed.
              </p>
            </div>
          ) : (
            pendingApprovals.map((approval) => {
              const memberName = getMemberName(approval);
              const isProcessing = processingMember === approval.id;
              
              return (
                <Card key={approval.id} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium">{memberName}</div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {approval.email}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {approval.role}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <div className="mb-1">
                          <strong>Reason:</strong> {approval.pending_reason}
                        </div>
                        <div>
                          <strong>Requested:</strong> {new Date(approval.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(approval.id, memberName)}
                          disabled={isProcessing}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(approval.id, memberName)}
                          disabled={isProcessing}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          {isProcessing ? 'Processing...' : 'Approve'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
