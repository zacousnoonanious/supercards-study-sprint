
// Common public email domains that should require manual approval
const PUBLIC_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'yandex.com',
  'zoho.com',
  'live.com',
  'msn.com',
  'gmx.com',
  'inbox.com',
  'fastmail.com',
  'tutanota.com'
];

export const isPublicDomain = (domain: string): boolean => {
  return PUBLIC_DOMAINS.includes(domain.toLowerCase());
};

export const validateDomain = (domain: string): {
  isValid: boolean;
  isPublic: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];
  const normalizedDomain = domain.trim().toLowerCase();
  
  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  const isValid = domainRegex.test(normalizedDomain);
  
  if (!isValid) {
    warnings.push('Invalid domain format');
    return { isValid: false, isPublic: false, warnings };
  }
  
  const isPublic = isPublicDomain(normalizedDomain);
  
  if (isPublic) {
    warnings.push('This is a public email domain - users from this domain will auto-join your organization');
    warnings.push('Consider using your corporate domain instead for better security');
  }
  
  return { isValid, isPublic, warnings };
};

export const getDomainRecommendation = (email: string): string | null => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !isPublicDomain(domain)) return null;
  
  // Try to suggest a corporate domain based on common patterns
  const username = email.split('@')[0];
  const companyName = username.split('.')[0] || username.split('_')[0] || username;
  
  return `${companyName}.com`;
};
