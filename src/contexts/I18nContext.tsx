
import React, { createContext, useContext, useState, useEffect } from 'react';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Base translations - you can add your own languages here
const translations = {
  en: {
    // Navigation & General
    'nav.navigation': 'Navigation',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign Out',
    'nav.createSet': 'Create New Set',
    'nav.marketplace': 'Marketplace',
    'nav.decks': 'Decks',
    'welcome': 'Welcome',
    'loading': 'Loading...',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'create': 'Create',
    'add': 'Add',
    'remove': 'Remove',
    'close': 'Close',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'submit': 'Submit',
    'update': 'Update',
    'confirm': 'Confirm',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort',
    'view': 'View',
    'preview': 'Preview',
    'download': 'Download',
    'upload': 'Upload',
    'share': 'Share',
    'copy': 'Copy',
    'duplicate': 'Duplicate',
    'export': 'Export',
    'import': 'Import',
    
    // Decks specific
    'decks.title': 'My Decks',
    'decks.createNew': 'Create New Deck',
    'decks.noDecks': 'No decks yet',
    'decks.noDecksDesc': 'Create your first flashcard deck to get started!',
    'decks.createFirst': 'Create Your First Deck',
    'decks.viewCards': 'View Cards',
    'decks.study': 'Study',
    'decks.edit': 'Edit',
    'decks.delete': 'Delete',
    'decks.deleteConfirm': 'Delete Deck',
    'decks.deleteMessage': 'Are you sure you want to delete "{title}"? This action cannot be undone and will permanently delete all cards in this deck.',
    'decks.deleteSuccess': 'Deck "{title}" deleted successfully.',
    'decks.deleteError': 'Failed to delete deck. Please try again.',
    'decks.loadError': 'Failed to load your flashcard decks.',
    
    // Set View specific
    'setView.notFound': 'Set not found',
    'setView.backToDecks': 'Back to Decks',
    'setView.deckSettings': 'Deck Settings',
    'setView.enhancedOverview': 'Enhanced Overview',
    'setView.aiGenerate': 'AI Generate',
    'setView.aiGenerateTitle': 'AI Flashcard Generator',
    'setView.createNewCard': 'Create New Card',
    'setView.createNewCardTitle': 'Create New Card',
    'setView.permanentShuffle': 'Permanent Shuffle',
    'setView.permanentShuffleDesc': 'Always shuffle cards when studying this deck',
    'setView.cardNumber': 'Card {number}',
    'setView.front': 'Front:',
    'setView.back': 'Back:',
    'setView.success': 'Success',
    'setView.error': 'Error',
    'setView.aiCardsAdded': 'AI-generated cards have been added to your deck!',
    'setView.cardCreated': 'New card created successfully!',
    'setView.cardCreatedFromTemplate': 'Card created from {templateName} template!',
    'setView.defaultTemplateSet': 'Default Template Set',
    'setView.defaultTemplateMessage': '{templateName} is now your default card template.',
    'setView.cardDeleted': 'Card deleted successfully!',
    'setView.shuffleEnabled': 'Permanent shuffle enabled',
    'setView.shuffleDisabled': 'Permanent shuffle disabled',
    'setView.failedCreateCard': 'Failed to create new card.',
    'setView.failedCreateFromTemplate': 'Failed to create card from template.',
    'setView.failedDeleteCard': 'Failed to delete card.',
    'setView.failedUpdateShuffle': 'Failed to update shuffle setting.',
    
    // Dashboard
    'dashboard.title': 'Your Flashcard Sets',
    'dashboard.subtitle': 'Here\'s your learning progress at a glance.',
    'dashboard.totalCards': 'Total Cards',
    'dashboard.studyStreak': 'Study Streak',
    'dashboard.cardsReviewed': 'Cards Reviewed',
    'dashboard.days': 'days',
    'dashboard.thisWeek': 'This week',
    'dashboard.recentDecks': 'Recently Created Decks',
    'dashboard.viewAllDecks': 'View All Decks',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.quickActionsDesc': 'Get started with your learning journey',
    'dashboard.createNewDeck': 'Create New Deck',
    'dashboard.browseDecks': 'Browse My Decks',
    'dashboard.exploreMarketplace': 'Explore Marketplace',
    
    // Study
    'study.title': 'Study',
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
    'lang.zh': '中文',
    
    // Error Messages
    'error.general': 'An error occurred. Please try again.',
    'error.network': 'Network error. Please check your connection.',
    'error.notFound': 'The requested item was not found.',
    'error.unauthorized': 'You are not authorized to perform this action.',
    'error.validation': 'Please check your input and try again.',
    
    // Success Messages
    'success.saved': 'Saved successfully!',
    'success.created': 'Created successfully!',
    'success.updated': 'Updated successfully!',
    'success.deleted': 'Deleted successfully!',
    'success.shared': 'Shared successfully!',
    
    // Profile
    'profile.title': 'Profile Settings',
    'profile.personalInfo': 'Personal Information',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email Address',
    'profile.avatar': 'Profile Picture',
    'profile.language': 'Language',
    'profile.selectAvatar': 'Select Avatar',
    'profile.updateSuccess': 'Profile updated successfully!',
    'profile.updateError': 'Failed to update profile.',
    'profile.changeAvatar': 'Change Avatar',
  },
  // Add your own languages here following the same structure:
  // es: { ... },
  // fr: { ... },
  // etc.
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  // Load language from localStorage or user profile
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && translations[savedLanguage as keyof typeof translations]) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('preferred-language', language);
  }, [language]);

  const t = (key: string): string => {
    const lang = translations[language as keyof typeof translations] || translations.en;
    return lang[key as keyof typeof lang] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
