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
    
    // Homepage
    'home.title': 'Create Powerful Flashcards with AI',
    'home.subtitle': 'Transform your learning with interactive flashcards powered by artificial intelligence',
    'home.getStarted': 'Get Started Free',
    'home.learnMore': 'Learn More',
    'home.features.title': 'Everything you need to study effectively',
    'home.features.subtitle': 'Our platform provides all the tools you need for effective learning',
    'home.features.ai': 'AI-Powered Content',
    'home.features.aiDesc': 'Generate flashcards automatically from your content',
    'home.features.interactive': 'Interactive Elements',
    'home.features.interactiveDesc': 'Quizzes, fill-in-blanks, and multimedia support',
    'home.features.progress': 'Progress Tracking',
    'home.features.progressDesc': 'Monitor your learning progress and performance',
    'home.features.collaboration': 'Collaboration',
    'home.features.collaborationDesc': 'Share and study together with friends',
    'home.pricing.title': 'Choose Your Plan',
    'home.pricing.free': 'Free',
    'home.pricing.pro': 'Pro',
    'home.pricing.enterprise': 'Enterprise',
    
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
    'dashboard.noSets': 'No flashcard sets yet',
    'dashboard.noSetsDesc': 'Create your first set to get started!',
    'dashboard.createFirst': 'Create Your First Set',
    'dashboard.viewCards': 'View Cards',
    'dashboard.study': 'Study',
    'dashboard.searchSets': 'Search your sets...',
    'dashboard.recentSets': 'Recent Sets',
    'dashboard.allSets': 'All Sets',
    'dashboard.favorites': 'Favorites',
    'dashboard.shared': 'Shared with Me',
    
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
  es: {
    // Navigation & General
    'nav.navigation': 'Navegación',
    'nav.dashboard': 'Panel',
    'nav.profile': 'Perfil',
    'nav.signOut': 'Cerrar Sesión',
    'nav.createSet': 'Crear Nuevo Set',
    'nav.marketplace': 'Mercado',
    'nav.decks': 'Mazos',
    'welcome': 'Bienvenido',
    'loading': 'Cargando...',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'edit': 'Editar',
    'delete': 'Eliminar',
    'create': 'Crear',
    'add': 'Añadir',
    'remove': 'Quitar',
    'close': 'Cerrar',
    'back': 'Atrás',
    'next': 'Siguiente',
    'previous': 'Anterior',
    'submit': 'Enviar',
    'update': 'Actualizar',
    'confirm': 'Confirmar',
    'search': 'Buscar',
    'filter': 'Filtrar',
    'sort': 'Ordenar',
    'view': 'Ver',
    'preview': 'Vista previa',
    'download': 'Descargar',
    'upload': 'Subir',
    'share': 'Compartir',
    'copy': 'Copiar',
    'duplicate': 'Duplicar',
    'export': 'Exportar',
    'import': 'Importar',
    
    // Decks specific
    'decks.title': 'Mis Mazos',
    'decks.createNew': 'Crear Nuevo Mazo',
    'decks.noDecks': 'No hay mazos aún',
    'decks.noDecksDesc': '¡Crea tu primer mazo de tarjetas para empezar!',
    'decks.createFirst': 'Crear Tu Primer Mazo',
    'decks.viewCards': 'Ver Tarjetas',
    'decks.study': 'Estudiar',
    'decks.edit': 'Editar',
    'decks.delete': 'Eliminar',
    'decks.deleteConfirm': 'Eliminar Mazo',
    'decks.deleteMessage': '¿Estás seguro de que quieres eliminar "{title}"? Esta acción no se puede deshacer y eliminará permanentemente todas las tarjetas de este mazo.',
    'decks.deleteSuccess': 'Mazo "{title}" eliminado exitosamente.',
    'decks.deleteError': 'Error al eliminar el mazo. Por favor, inténtalo de nuevo.',
    'decks.loadError': 'Error al cargar tus mazos de tarjetas.',

    // Dashboard
    'dashboard.title': 'Tus Sets de Tarjetas',
    'dashboard.subtitle': 'Aquí tienes tu progreso de aprendizaje de un vistazo.',
    'dashboard.totalCards': 'Total de Tarjetas',
    'dashboard.studyStreak': 'Racha de Estudio',
    'dashboard.cardsReviewed': 'Tarjetas Revisadas',
    'dashboard.days': 'días',
    'dashboard.thisWeek': 'Esta semana',
    'dashboard.recentDecks': 'Mazos Creados Recientemente',
    'dashboard.viewAllDecks': 'Ver Todos los Mazos',
    'dashboard.quickActions': 'Acciones Rápidas',
    'dashboard.quickActionsDesc': 'Comienza tu viaje de aprendizaje',
    'dashboard.createNewDeck': 'Crear Nuevo Mazo',
    'dashboard.browseDecks': 'Explorar Mis Mazos',
    'dashboard.exploreMarketplace': 'Explorar Mercado',
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
    'lang.zh': '中文',
    
    // Error Messages
    'error.general': 'Ocurrió un error. Por favor, inténtalo de nuevo.',
    'error.network': 'Error de red. Por favor, verifica tu conexión.',
    'error.notFound': 'El elemento solicitado no se encontró.',
    'error.unauthorized': 'No tienes permiso para realizar esta acción.',
    'error.validation': 'Por favor, verifica tu entrada y inténtalo de nuevo.',
    
    // Success Messages
    'success.saved': 'Guardado exitosamente!',
    'success.created': 'Creado exitosamente!',
    'success.updated': 'Actualizado exitosamente!',
    'success.deleted': 'Eliminado exitosamente!',
    'success.shared': 'Compartido exitosamente!',
    
    // Profile
    'profile.title': 'Configuración del Perfil',
    'profile.personalInfo': 'Información Personal',
    'profile.firstName': 'Nombre',
    'profile.lastName': 'Apellido',
    'profile.email': 'Correo Electrónico',
    'profile.avatar': 'Foto de Perfil',
    'profile.language': 'Idioma',
    'profile.selectAvatar': 'Seleccionar Avatar',
    'profile.updateSuccess': '¡Perfil actualizado exitosamente!',
    'profile.updateError': 'Error al actualizar el perfil.',
    'profile.changeAvatar': 'Cambiar Avatar',
  },
  fr: {
    // Navigation & General
    'nav.navigation': 'Navigation',
    'nav.dashboard': 'Tableau de Bord',
    'nav.profile': 'Profil',
    'nav.signOut': 'Se Déconnecter',
    'nav.createSet': 'Créer Nouveau Set',
    'nav.marketplace': 'Marché',
    'nav.decks': 'Jeux',
    'welcome': 'Bienvenue',
    'loading': 'Chargement...',
    'save': 'Sauvegarder',
    'cancel': 'Annuler',
    'edit': 'Éditer',
    'delete': 'Supprimer',
    'create': 'Créer',
    'add': 'Ajouter',
    'remove': 'Supprimer',
    'close': 'Fermer',
    'back': 'Retour',
    'next': 'Suivant',
    'previous': 'Précédent',
    'submit': 'Soumettre',
    'update': 'Mettre à jour',
    'confirm': 'Confirmer',
    'search': 'Rechercher',
    'filter': 'Filtrer',
    'sort': 'Trier',
    'view': 'Voir',
    'preview': 'Aperçu',
    'download': 'Télécharger',
    'upload': 'Téléverser',
    'share': 'Partager',
    'copy': 'Copier',
    'duplicate': 'Dupliquer',
    'export': 'Exporter',
    'import': 'Importer',
    
    // Decks specific
    'decks.title': 'Mes Jeux',
    'decks.createNew': 'Créer Nouveau Jeu',
    'decks.noDecks': 'Aucun jeu encore',
    'decks.noDecksDesc': 'Créez votre premier jeu de cartes pour commencer!',
    'decks.createFirst': 'Créer Votre Premier Jeu',
    'decks.viewCards': 'Voir les Cartes',
    'decks.study': 'Étudier',
    'decks.edit': 'Éditer',
    'decks.delete': 'Supprimer',
    'decks.deleteConfirm': 'Supprimer le Jeu',
    'decks.deleteMessage': 'Êtes-vous sûr de vouloir supprimer "{title}"? Cette action ne peut pas être annulée et supprimera définitivement toutes les cartes de ce jeu.',
    'decks.deleteSuccess': 'Jeu "{title}" supprimé avec succès.',
    'decks.deleteError': 'Échec de la suppression du jeu. Veuillez réessayer.',
    'decks.loadError': 'Échec du chargement de vos jeux de cartes.',

    // Dashboard
    'dashboard.title': 'Vos Sets de Cartes',
    'dashboard.subtitle': 'Voici votre progression d\'apprentissage en un coup d\'œil.',
    'dashboard.totalCards': 'Total de Cartes',
    'dashboard.studyStreak': 'Série d\'Étude',
    'dashboard.cardsReviewed': 'Cartes Révisées',
    'dashboard.days': 'jours',
    'dashboard.thisWeek': 'Cette semaine',
    'dashboard.recentDecks': 'Jeux Créés Récemment',
    'dashboard.viewAllDecks': 'Voir Tous les Jeux',
    'dashboard.quickActions': 'Actions Rapides',
    'dashboard.quickActionsDesc': 'Commencez votre voyage d\'apprentissage',
    'dashboard.createNewDeck': 'Créer Nouveau Jeu',
    'dashboard.browseDecks': 'Parcourir Mes Jeux',
    'dashboard.exploreMarketplace': 'Explorer le Marché',
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
    'lang.zh': '中文',
    
    // Error Messages
    'error.general': 'Une erreur s\'est produite. Veuillez réessayer.',
    'error.network': 'Erreur de réseau. Veuillez vérifier votre connexion.',
    'error.notFound': 'L\'élément demandé n\'a pas été trouvé.',
    'error.unauthorized': 'Vous n\'êtes pas autorisé à effectuer cette action.',
    'error.validation': 'Veuillez vérifier votre entrée et réessayer.',
    
    // Success Messages
    'success.saved': 'Enregistré avec succès!',
    'success.created': 'Créé avec succès!',
    'success.updated': 'Mis à jour avec succès!',
    'success.deleted': 'Supprimé avec succès!',
    'success.shared': 'Partagé avec succès!',
    
    // Profile
    'profile.title': 'Paramètres du Profil',
    'profile.personalInfo': 'Informations Personnelles',
    'profile.firstName': 'Prénom',
    'profile.lastName': 'Nom',
    'profile.email': 'Adresse Email',
    'profile.avatar': 'Photo de Profil',
    'profile.language': 'Langue',
    'profile.selectAvatar': 'Sélectionner Avatar',
    'profile.updateSuccess': 'Profil mis à jour avec succès!',
    'profile.updateError': 'Échec de la mise à jour du profil.',
    'profile.changeAvatar': 'Changer Avatar',
  }
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
