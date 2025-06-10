
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

// Translation keys for actual text used in our pages
const translations = {
  en: {
    // General
    'loading': 'Loading...',
    'back': 'Back',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'create': 'Create',
    'view': 'View',
    'close': 'Close',
    'submit': 'Submit',
    'update': 'Update',
    'search': 'Search',
    'welcome': 'Welcome',
    'yes': 'Yes',
    'no': 'No',
    'ok': 'OK',
    'done': 'Done',
    'finish': 'Finish',
    'start': 'Start',
    'next': 'Next',
    'previous': 'Previous',
    'settings': 'Settings',
    'options': 'Options',
    'help': 'Help',
    'success': 'Success',
    'error': 'Error',
    
    // Auth page
    'signIn': 'Sign In',
    'signUp': 'Sign Up',
    'email': 'Email',
    'password': 'Password',
    'enterEmail': 'Enter your email',
    'enterPassword': 'Enter your password',
    'noAccount': "Don't have an account? Sign up",
    'haveAccount': 'Already have an account? Sign in',
    'welcomeBack': 'Welcome back!',
    'accountCreated': 'Account created!',
    'signInSuccess': 'You have successfully signed in.',
    'checkEmail': 'Please check your email to verify your account.',
    'unexpectedError': 'An unexpected error occurred.',
    
    // Dashboard
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
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign Out',
    'nav.decks': 'Decks',
    'nav.marketplace': 'Marketplace',
    
    // Decks page
    'decks.title': 'My Decks',
    'decks.createNew': 'Create New Deck',
    'decks.noDecks': 'No decks yet',
    'decks.noDecksDesc': 'Create your first flashcard deck to get started!',
    'decks.createFirst': 'Create Your First Deck',
    'decks.viewCards': 'View Cards',
    'decks.study': 'Study',
    'decks.deleteConfirm': 'Delete Deck',
    'decks.deleteMessage': 'Are you sure you want to delete "{title}"? This action cannot be undone and will permanently delete all cards in this deck.',
    'decks.deleteSuccess': 'Deck "{title}" deleted successfully.',
    'decks.deleteError': 'Failed to delete deck. Please try again.',
    'decks.loadError': 'Failed to load your flashcard decks.',
    
    // Set View page
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
    
    // Create Set page
    'sets.create': 'Create New Set',
    'sets.title': 'Title',
    'sets.description': 'Description',
    'enterSetTitle': 'Enter set title...',
    'enterSetDescription': 'Enter set description (optional)...',
    'aiGeneratedDeck': 'AI-Generated Deck',
    'manualCreation': 'Manual Creation',
    'createAiDeck': 'Create AI-Generated Deck',
    'createAiDeckDesc': 'Let AI create a complete flashcard deck with advanced educational content, interactive quizzes, and visual elements.',
    'createManualDesc': 'Create a new flashcard set manually and add cards one by one.',
    'enterTitle': 'Please enter a title for your set.',
    'setCreatedSuccess': 'Flashcard set created successfully!',
    'failedCreateSet': 'Failed to create flashcard set.',
    
    // Profile page
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
    
    // Marketplace page
    'marketplace.title': 'Marketplace',
    'marketplace.subtitle': 'Discover and download flashcard sets created by the community',
    'marketplace.search': 'Search marketplace...',
    'marketplace.featured': 'Featured Sets',
    'marketplace.free': 'Free',
    'marketplace.preview': 'Preview',
    'marketplace.download': 'Download',
    'noResultsFound': 'No results found',
    'adjustSearchTerms': 'Try adjusting your search terms',
    
    // NotFound page
    'pageNotFound': 'Page Not Found',
    'pageNotFoundDesc': 'The page you\'re looking for doesn\'t exist or has been moved.',
    'goBack': 'Go Back',
    'goHome': 'Go Home',
    
    // Study
    'study.title': 'Study',
    
    // Card Editor
    'cardEditor.title': 'Card Editor',
    'cardEditor.front': 'Front',
    'cardEditor.back': 'Back',
    'cardEditor.cardNotFound': 'Card not found',
    'cardEditor.addText': 'Add Text',
    'cardEditor.addImage': 'Add Image',
    'cardEditor.addAudio': 'Add Audio',
    'cardEditor.addVideo': 'Add Video',
    'cardEditor.addDrawing': 'Add Drawing',
    'cardEditor.addQuiz': 'Add Quiz',
    'cardEditor.autoArrange': 'Auto Arrange',
    'cardEditor.grid': 'Grid',
    'cardEditor.center': 'Center',
    'cardEditor.stack': 'Stack',
    'cardEditor.justify': 'Justify',
    'cardEditor.alignLeft': 'Align Left',
    'cardEditor.alignCenter': 'Align Center',
    'cardEditor.alignRight': 'Align Right',
    'cardEditor.centerHorizontal': 'Center Horizontal',
    'cardEditor.centerVertical': 'Center Vertical',
    'cardEditor.newCard': 'New Card',
    'cardEditor.deleteCard': 'Delete Card',
    'cardEditor.cardType': 'Card Type',
    'cardEditor.basicCard': 'Basic Card',
    'cardEditor.singleSided': 'Single Sided',
    'cardEditor.informational': 'Informational',
    'cardEditor.quizOnly': 'Quiz Only',
    'cardEditor.passwordProtected': 'Password Protected',
    'cardEditor.showGrid': 'Show Grid',
    'cardEditor.snapToGrid': 'Snap to Grid',
    'cardEditor.zoom': 'Zoom',
    'cardEditor.fitToView': 'Fit to View',
    'cardEditor.fullscreen': 'Fullscreen',
    'cardEditor.cardSize': 'Card Size',
    'cardEditor.width': 'Width',
    'cardEditor.height': 'Height',
    'cardEditor.clickToEdit': 'Click to edit text',
    'cardEditor.enterText': 'Enter your text...',
    
    // Element Controls
    'elementControls.element': 'Element',
    'elementControls.delete': 'Delete',
    'elementControls.fontSize': 'Font Size',
    'elementControls.fontFamily': 'Font Family',
    'elementControls.color': 'Color',
    'elementControls.backgroundColor': 'Background Color',
    'elementControls.bold': 'Bold',
    'elementControls.italic': 'Italic',
    'elementControls.underline': 'Underline',
    'elementControls.alignLeft': 'Align Left',
    'elementControls.alignCenter': 'Align Center',
    'elementControls.alignRight': 'Align Right',
    'elementControls.alignJustify': 'Align Justify',
    
    // Enhanced Set Overview
    'enhancedOverview.title': 'Enhanced Overview',
    'enhancedOverview.backToSet': 'Back to Set',
    'enhancedOverview.cardMoved': 'Card moved',
    'enhancedOverview.cardMovedDesc': 'Card moved from position {from} to {to}',
    'enhancedOverview.moving': 'Moving...',
    
    // Editor Card Overview
    'editorOverview.title': 'Card Overview',
    'editorOverview.backToEditor': 'Back to Editor',
    'editorOverview.clickToNavigate': 'Click any card to navigate to it',
    'editorOverview.dragToReorder': 'Drag cards to reorder them',
    'editorOverview.instructions': 'Click any card to navigate to it • Drag cards to reorder them',
    'editorOverview.noCards': 'No cards to display',
    'editorOverview.current': 'Current',
    'editorOverview.elements': 'elements',
    'editorOverview.textBased': 'Text-based card',
    'editorOverview.cardCount': '{count} cards',
    
    // Card Types in Overview
    'cardType.text': 'text',
    'cardType.image': 'image',
    'cardType.audio': 'audio',
    'cardType.quiz': 'quiz',
    'cardType.video': 'video',
    
    // Toolbar
    'toolbar.navigation': 'Navigation',
    'toolbar.cardNavigation': 'Card Navigation',
    'toolbar.elements': 'Elements',
    'toolbar.layout': 'Layout',
    'toolbar.arrangement': 'Arrangement',
    'toolbar.cardManagement': 'Card Management',
    'toolbar.viewOptions': 'View Options',
    'toolbar.showText': 'Show Text',
    'toolbar.hideText': 'Hide Text',
    
    // Top Toolbar
    'topToolbar.deckTitle': 'Deck Title',
    'topToolbar.cardOf': 'Card {current} of {total}',
    'topToolbar.overview': 'Overview',
    
    // Success/Error messages from existing handlers
    'success.deckTitleUpdated': 'Deck title updated successfully',
    'error.deckTitleUpdateFailed': 'Failed to update deck title',
    
    // Error messages
    'error.general': 'An error occurred. Please try again.',
    'error.validation': 'Please check your input and try again.',
    
    // Success messages
    'success.created': 'Created successfully!',
    'success.updated': 'Updated successfully!',
    'success.deleted': 'Deleted successfully!',
    'success.saved': 'Saved successfully!',
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
    'lang.zh': '中文',
  },
  // You can add other languages here following the same structure
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
