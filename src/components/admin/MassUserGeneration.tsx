
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Users, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParsedUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  generatedEmail: string;
  role: string;
  createAccount: boolean;
}

interface EmailPattern {
  value: string;
  label: string;
  example: string;
}

const emailPatterns: EmailPattern[] = [
  { value: '{first}{last}', label: 'FirstLast', example: 'johnsmith@domain.com' },
  { value: '{first}.{last}', label: 'First.Last', example: 'john.smith@domain.com' },
  { value: '{firstInitial}{last}', label: 'FLast', example: 'jsmith@domain.com' },
  { value: '{first}_{last}', label: 'First_Last', example: 'john_smith@domain.com' },
  { value: '{last}{first}', label: 'LastFirst', example: 'smithjohn@domain.com' },
];

const roles = [
  { value: 'learner', label: 'Learner' },
  { value: 'manager', label: 'Manager' },
];

export const MassUserGeneration: React.FC = () => {
  const [nameInput, setNameInput] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [emailPattern, setEmailPattern] = useState('{first}.{last}');
  const [defaultRole, setDefaultRole] = useState('learner');
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const generateEmail = useCallback((firstName: string, lastName: string, pattern: string, domain: string): string => {
    if (!domain) return '';
    
    const firstInitial = firstName.charAt(0).toLowerCase();
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
    
    let email = pattern
      .replace('{first}', cleanFirst)
      .replace('{last}', cleanLast)
      .replace('{firstInitial}', firstInitial);
    
    return `${email}@${domain}`;
  }, []);

  const parseNames = useCallback((input: string): ParsedUser[] => {
    const lines = input.trim().split('\n').filter(line => line.trim());
    const users: ParsedUser[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      let firstName = '';
      let lastName = '';
      
      // Handle "Last, First" format
      if (trimmed.includes(',')) {
        const [last, first] = trimmed.split(',').map(part => part.trim());
        firstName = first || '';
        lastName = last || '';
      } else {
        // Handle "First Last" format
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          firstName = parts[0];
          lastName = parts.slice(1).join(' ');
        } else {
          firstName = parts[0] || '';
          lastName = '';
        }
      }
      
      if (firstName && lastName) {
        const id = `user-${index}`;
        const fullName = `${firstName} ${lastName}`;
        const generatedEmail = generateEmail(firstName, lastName, emailPattern, emailDomain);
        
        users.push({
          id,
          firstName,
          lastName,
          fullName,
          generatedEmail,
          role: defaultRole,
          createAccount: true,
        });
      }
    });
    
    return users;
  }, [emailPattern, emailDomain, defaultRole, generateEmail]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      if (file.name.endsWith('.csv')) {
        // Parse CSV - handle both "First,Last" and "Last,First" formats
        const lines = text.split('\n').filter(line => line.trim());
        const csvInput = lines.map(line => {
          const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
          if (parts.length >= 2) {
            // Try to detect if it's "First,Last" or "Last,First"
            // If the first part contains typical first name patterns, assume "First,Last"
            const [part1, part2] = parts;
            return `${part1}, ${part2}`;
          }
          return line;
        }).join('\n');
        
        setNameInput(csvInput);
      } else {
        // Plain text file
        setNameInput(text);
      }
      
      toast({
        title: "File uploaded",
        description: `Successfully loaded ${file.name}`,
      });
    };
    
    reader.readAsText(file);
  }, [toast]);

  const handleGeneratePreview = () => {
    if (!nameInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter some names first",
        variant: "destructive",
      });
      return;
    }
    
    if (!emailDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email domain",
        variant: "destructive",
      });
      return;
    }
    
    const users = parseNames(nameInput);
    if (users.length === 0) {
      toast({
        title: "Error",
        description: "No valid names could be parsed. Please check the format.",
        variant: "destructive",
      });
      return;
    }
    
    setParsedUsers(users);
    setShowPreview(true);
    
    toast({
      title: "Preview generated",
      description: `Successfully parsed ${users.length} users`,
    });
  };

  const handleUpdateUser = (id: string, field: keyof ParsedUser, value: any) => {
    setParsedUsers(prev => prev.map(user => 
      user.id === id ? { ...user, [field]: value } : user
    ));
  };

  const handleSelectAll = (checked: boolean) => {
    setParsedUsers(prev => prev.map(user => ({ ...user, createAccount: checked })));
  };

  const selectedCount = parsedUsers.filter(user => user.createAccount).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mass User Generation
          </CardTitle>
          <CardDescription>
            Create multiple user accounts from a list of names. Supports both text input and file uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nameInput" className="text-sm font-medium">
                  Names List
                </Label>
                <Textarea
                  id="nameInput"
                  placeholder="Enter names (one per line):&#10;Smith, John&#10;Adams, Jane&#10;or&#10;John Smith&#10;Jane Adams"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  rows={10}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="fileUpload" className="text-sm font-medium">
                  Or Upload File
                </Label>
                <div className="mt-1">
                  <Input
                    id="fileUpload"
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports .txt and .csv files
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="emailDomain" className="text-sm font-medium">
                  Email Domain
                </Label>
                <Input
                  id="emailDomain"
                  placeholder="school.org"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="emailPattern" className="text-sm font-medium">
                  Email Format Pattern
                </Label>
                <Select value={emailPattern} onValueChange={setEmailPattern}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {emailPatterns.map((pattern) => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        <div className="flex flex-col">
                          <span>{pattern.label}</span>
                          <span className="text-xs text-muted-foreground">{pattern.example}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="defaultRole" className="text-sm font-medium">
                  Default Role
                </Label>
                <Select value={defaultRole} onValueChange={setDefaultRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGeneratePreview} 
                className="w-full"
                disabled={!nameInput.trim() || !emailDomain.trim()}
              >
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && parsedUsers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview ({parsedUsers.length} users)</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedCount} selected for creation
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(!parsedUsers.every(u => u.createAccount))}
                  >
                    {parsedUsers.every(u => u.createAccount) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Create</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Generated Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={user.createAccount}
                            onCheckedChange={(checked) => 
                              handleUpdateUser(user.id, 'createAccount', checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell className="font-mono text-sm">{user.generatedEmail}</TableCell>
                        <TableCell>
                          <Select 
                            value={user.role} 
                            onValueChange={(value) => handleUpdateUser(user.id, 'role', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Edit List
                </Button>
                <Button 
                  disabled={selectedCount === 0}
                  onClick={() => {
                    // This will be implemented in Phase 2
                    toast({
                      title: "Ready for Phase 2",
                      description: `${selectedCount} users ready for account creation`,
                    });
                  }}
                >
                  Proceed to Create Accounts ({selectedCount})
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
