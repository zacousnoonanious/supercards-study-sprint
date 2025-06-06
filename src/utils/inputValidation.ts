
// Input validation and sanitization utilities

export const MAX_CONTENT_LENGTH = {
  FLASHCARD_QUESTION: 1000,
  FLASHCARD_ANSWER: 2000,
  SET_TITLE: 200,
  SET_DESCRIPTION: 500,
  AI_PROMPT: 500,
  ELEMENT_CONTENT: 2000,
  HINT: 300
};

export const validateContentLength = (content: string, maxLength: number): boolean => {
  return content.length <= maxLength;
};

export const sanitizeHtml = (content: string): string => {
  // Basic HTML sanitization - remove script tags and event handlers
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
};

export const sanitizeText = (text: string): string => {
  // Remove potentially dangerous characters while preserving formatting
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
};

export const validateFlashcardData = (data: {
  question: string;
  answer: string;
  hint?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.question.trim()) {
    errors.push('Question is required');
  } else if (!validateContentLength(data.question, MAX_CONTENT_LENGTH.FLASHCARD_QUESTION)) {
    errors.push(`Question must be ${MAX_CONTENT_LENGTH.FLASHCARD_QUESTION} characters or less`);
  }

  if (!data.answer.trim()) {
    errors.push('Answer is required');
  } else if (!validateContentLength(data.answer, MAX_CONTENT_LENGTH.FLASHCARD_ANSWER)) {
    errors.push(`Answer must be ${MAX_CONTENT_LENGTH.FLASHCARD_ANSWER} characters or less`);
  }

  if (data.hint && !validateContentLength(data.hint, MAX_CONTENT_LENGTH.HINT)) {
    errors.push(`Hint must be ${MAX_CONTENT_LENGTH.HINT} characters or less`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateSetData = (data: {
  title: string;
  description?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push('Title is required');
  } else if (!validateContentLength(data.title, MAX_CONTENT_LENGTH.SET_TITLE)) {
    errors.push(`Title must be ${MAX_CONTENT_LENGTH.SET_TITLE} characters or less`);
  }

  if (data.description && !validateContentLength(data.description, MAX_CONTENT_LENGTH.SET_DESCRIPTION)) {
    errors.push(`Description must be ${MAX_CONTENT_LENGTH.SET_DESCRIPTION} characters or less`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAIPrompt = (prompt: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!prompt.trim()) {
    errors.push('Prompt is required');
  } else if (!validateContentLength(prompt, MAX_CONTENT_LENGTH.AI_PROMPT)) {
    errors.push(`Prompt must be ${MAX_CONTENT_LENGTH.AI_PROMPT} characters or less`);
  }

  // Check for potentially malicious content
  const suspiciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /forget\s+everything/i,
    /system\s+prompt/i,
    /jailbreak/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(prompt)) {
      errors.push('Prompt contains potentially unsafe content');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeElementContent = (content: string, elementType: string): string => {
  switch (elementType) {
    case 'text':
      return sanitizeText(content);
    case 'multiple-choice':
    case 'true-false':
    case 'fill-in-blank':
      return sanitizeText(content);
    default:
      return sanitizeHtml(content);
  }
};
