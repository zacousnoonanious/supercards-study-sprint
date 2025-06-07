
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
    // Header/Navigation
    'header.brand': 'SuperCards',
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.decks': 'Decks',
    'nav.marketplace': 'Marketplace',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign Out',
    'nav.createSet': 'Create New Set',
    
    // Home Page
    'home.hero.title': 'Master Any Subject with SuperCards',
    'home.hero.subtitle': 'Create, organize, and study flashcards like never before. Track your progress and accelerate your learning with our intelligent study system powered by AI.',
    'home.hero.cta': 'Start Learning Today',
    'home.features.title': 'Everything you need to study effectively',
    'home.features.subtitle': 'Our platform provides all the tools you need for effective learning',
    'home.features.ai.title': 'AI-Powered Content',
    'home.features.ai.description': 'Generate flashcards automatically from your content',
    'home.features.interactive.title': 'Interactive Elements',
    'home.features.interactive.description': 'Quizzes, fill-in-blanks, and multimedia support',
    'home.features.progress.title': 'Progress Tracking',
    'home.features.progress.description': 'Monitor your learning progress and performance',
    'home.features.collaboration.title': 'Collaboration',
    'home.features.collaboration.description': 'Share and study together with friends',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back!',
    'dashboard.subtitle': 'Here\'s your learning progress at a glance.',
    'dashboard.stats.totalDecks': 'Total Decks',
    'dashboard.stats.totalCards': 'Total Cards',
    'dashboard.stats.studyStreak': 'Study Streak',
    'dashboard.stats.cardsReviewed': 'Cards Reviewed',
    'dashboard.stats.thisWeek': 'This week',
    'dashboard.stats.days': 'days',
    'dashboard.recentDecks': 'Recently Created Decks',
    'dashboard.viewAllDecks': 'View All Decks',
    'dashboard.noDecks': 'No decks yet',
    'dashboard.noDecksDesc': 'Create your first deck to start learning!',
    'dashboard.createFirstDeck': 'Create Your First Deck',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.quickActions.subtitle': 'Get started with your learning journey',
    'dashboard.actions.createDeck': 'Create New Deck',
    'dashboard.actions.browseDeck': 'Browse My Decks',
    'dashboard.actions.marketplace': 'Explore Marketplace',
    
    // General
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
    
    // Editor
    'editor.deckName': 'Deck Name',
    'editor.editDeckName': 'Edit Deck Name',
    'editor.saveDeckName': 'Save Deck Name',
    
    // sets
    'sets.create': 'Create New Set',
    'sets.title': 'Set Title',
    'sets.description': 'Description',
    'marketplace.title': 'Marketplace',
    'marketplace.subtitle': 'Discover and download flashcard sets created by the community',
    'marketplace.search': 'Search marketplace...',
    'marketplace.featured': 'Featured Sets',
    'marketplace.free': 'Free',
    'marketplace.preview': 'Preview',
    'marketplace.download': 'Download',
    'error.general': 'An error occurred. Please try again.',
    'success.created': 'Created successfully!',
    'success.saved': 'Saved successfully!',
    'success.updated': 'Updated successfully!',
    'profile.title': 'Profile Settings',
    'profile.personalInfo': 'Personal Information',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email Address',
    'profile.avatar': 'Profile Picture',
    'profile.language': 'Language',
    'profile.changeAvatar': 'Change Avatar',
    'profile.updateSuccess': 'Profile updated successfully!',
    'profile.updateError': 'Failed to update profile.',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.zh': '中文'
  },
  es: {
    // Header/Navigation
    'header.brand': 'SuperCards',
    'nav.home': 'Inicio',
    'nav.dashboard': 'Panel',
    'nav.decks': 'Mazos',
    'nav.marketplace': 'Mercado',
    'nav.profile': 'Perfil',
    'nav.signOut': 'Cerrar Sesión',
    'nav.createSet': 'Crear Nuevo Set',
    
    // Home Page
    'home.hero.title': 'Domina Cualquier Materia con SuperCards',
    'home.hero.subtitle': 'Crea, organiza y estudia tarjetas como nunca antes. Rastrea tu progreso y acelera tu aprendizaje con nuestro sistema de estudio inteligente potenciado por IA.',
    'home.hero.cta': 'Comenzar a Aprender Hoy',
    'home.features.title': 'Todo lo que necesitas para estudiar efectivamente',
    'home.features.subtitle': 'Nuestra plataforma proporciona todas las herramientas que necesitas para un aprendizaje efectivo',
    'home.features.ai.title': 'Contenido Potenciado por IA',
    'home.features.ai.description': 'Genera tarjetas automáticamente desde tu contenido',
    'home.features.interactive.title': 'Elementos Interactivos',
    'home.features.interactive.description': 'Cuestionarios, llenar espacios en blanco, y soporte multimedia',
    'home.features.progress.title': 'Seguimiento de Progreso',
    'home.features.progress.description': 'Monitorea tu progreso de aprendizaje y rendimiento',
    'home.features.collaboration.title': 'Colaboración',
    'home.features.collaboration.description': 'Comparte y estudia junto con amigos',
    
    // Dashboard
    'dashboard.welcome': '¡Bienvenido de vuelta!',
    'dashboard.subtitle': 'Aquí está tu progreso de aprendizaje de un vistazo.',
    'dashboard.stats.totalDecks': 'Total de Mazos',
    'dashboard.stats.totalCards': 'Total de Tarjetas',
    'dashboard.stats.studyStreak': 'Racha de Estudio',
    'dashboard.stats.cardsReviewed': 'Tarjetas Revisadas',
    'dashboard.stats.thisWeek': 'Esta semana',
    'dashboard.stats.days': 'días',
    'dashboard.recentDecks': 'Mazos Creados Recientemente',
    'dashboard.viewAllDecks': 'Ver Todos los Mazos',
    'dashboard.noDecks': 'No hay mazos aún',
    'dashboard.noDecksDesc': '¡Crea tu primer mazo para empezar a aprender!',
    'dashboard.createFirstDeck': 'Crear Tu Primer Mazo',
    'dashboard.quickActions': 'Acciones Rápidas',
    'dashboard.quickActions.subtitle': 'Comienza tu jornada de aprendizaje',
    'dashboard.actions.createDeck': 'Crear Nuevo Mazo',
    'dashboard.actions.browseDeck': 'Explorar Mis Mazos',
    'dashboard.actions.marketplace': 'Explorar Mercado',
    
    // General
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
    
    // sets
    'decks.title': 'Mis Mazos',
    'sets.create': 'Crear Nuevo Set',
    'marketplace.title': 'Marketplace',
    'editor.deckName': 'Nombre del Mazo',
    'editor.editDeckName': 'Editar Nombre del Mazo',
    'editor.saveDeckName': 'Guardar Nombre del Mazo',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.zh': '中文'
  },
  fr: {
    // Header/Navigation
    'header.brand': 'SuperCards',
    'nav.home': 'Accueil',
    'nav.dashboard': 'Tableau de Bord',
    'nav.decks': 'Jeux',
    'nav.marketplace': 'Marché',
    'nav.profile': 'Profil',
    'nav.signOut': 'Se Déconnecter',
    'nav.createSet': 'Créer Nouveau Set',
    
    // Home Page
    'home.hero.title': 'Maîtrisez N\'importe Quel Sujet avec SuperCards',
    'home.hero.subtitle': 'Créez, organisez et étudiez des cartes flash comme jamais auparavant. Suivez vos progrès et accélérez votre apprentissage avec notre système d\'étude intelligent alimenté par l\'IA.',
    'home.hero.cta': 'Commencer à Apprendre Aujourd\'hui',
    'home.features.title': 'Tout ce dont vous avez besoin pour étudier efficacement',
    'home.features.subtitle': 'Notre plateforme fournit tous les outils dont vous avez besoin pour un apprentissage efficace',
    'home.features.ai.title': 'Contenu Alimenté par l\'IA',
    'home.features.ai.description': 'Générez des cartes flash automatiquement à partir de votre contenu',
    'home.features.interactive.title': 'Éléments Interactifs',
    'home.features.interactive.description': 'Quiz, remplissage de blancs et support multimédia',
    'home.features.progress.title': 'Suivi des Progrès',
    'home.features.progress.description': 'Surveillez vos progrès d\'apprentissage et vos performances',
    'home.features.collaboration.title': 'Collaboration',
    'home.features.collaboration.description': 'Partagez et étudiez ensemble avec des amis',
    
    // Dashboard
    'dashboard.welcome': 'Bon retour !',
    'dashboard.subtitle': 'Voici vos progrès d\'apprentissage en un coup d\'œil.',
    'dashboard.stats.totalDecks': 'Total des Jeux',
    'dashboard.stats.totalCards': 'Total des Cartes',
    'dashboard.stats.studyStreak': 'Série d\'Étude',
    'dashboard.stats.cardsReviewed': 'Cartes Révisées',
    'dashboard.stats.thisWeek': 'Cette semaine',
    'dashboard.stats.days': 'jours',
    'dashboard.recentDecks': 'Jeux Créés Récemment',
    'dashboard.viewAllDecks': 'Voir Tous les Jeux',
    'dashboard.noDecks': 'Aucun jeu encore',
    'dashboard.noDecksDesc': 'Créez votre premier jeu pour commencer à apprendre !',
    'dashboard.createFirstDeck': 'Créer Votre Premier Jeu',
    'dashboard.quickActions': 'Actions Rapides',
    'dashboard.quickActions.subtitle': 'Commencez votre parcours d\'apprentissage',
    'dashboard.actions.createDeck': 'Créer Nouveau Jeu',
    'dashboard.actions.browseDeck': 'Parcourir Mes Jeux',
    'dashboard.actions.marketplace': 'Explorer le Marché',
    
    // sets
    'loading': 'Chargement...',
    'save': 'Sauvegarder',
    'edit': 'Éditer',
    'editor.deckName': 'Nom du Jeu',
    'editor.editDeckName': 'Éditer le Nom du Jeu',
    'editor.saveDeckName': 'Sauvegarder le Nom du Jeu',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.zh': '中文'
  },
  zh: {
    // Header/Navigation
    'header.brand': 'SuperCards',
    'nav.home': '首页',
    'nav.dashboard': '仪表板',
    'nav.decks': '卡组',
    'nav.marketplace': '市场',
    'nav.profile': '个人资料',
    'nav.signOut': '退出登录',
    'nav.createSet': '创建新卡组',
    
    // Home Page
    'home.hero.title': '使用 SuperCards 掌握任何科目',
    'home.hero.subtitle': '前所未有地创建、组织和学习闪卡。使用我们由人工智能驱动的智能学习系统跟踪您的进度并加速您的学习。',
    'home.hero.cta': '今天开始学习',
    'home.features.title': '有效学习所需的一切',
    'home.features.subtitle': '我们的平台提供有效学习所需的所有工具',
    'home.features.ai.title': 'AI 驱动的内容',
    'home.features.ai.description': '从您的内容自动生成闪卡',
    'home.features.interactive.title': '互动元素',
    'home.features.interactive.description': '测验、填空和多媒体支持',
    'home.features.progress.title': '进度跟踪',
    'home.features.progress.description': '监控您的学习进度和表现',
    'home.features.collaboration.title': '协作',
    'home.features.collaboration.description': '与朋友分享和一起学习',
    
    // Dashboard
    'dashboard.welcome': '欢迎回来！',
    'dashboard.subtitle': '这是您的学习进度概览。',
    'dashboard.stats.totalDecks': '总卡组数',
    'dashboard.stats.totalCards': '总卡片数',
    'dashboard.stats.studyStreak': '学习连续天数',
    'dashboard.stats.cardsReviewed': '已复习卡片',
    'dashboard.stats.thisWeek': '本周',
    'dashboard.stats.days': '天',
    'dashboard.recentDecks': '最近创建的卡组',
    'dashboard.viewAllDecks': '查看所有卡组',
    'dashboard.noDecks': '暂无卡组',
    'dashboard.noDecksDesc': '创建您的第一个卡组开始学习！',
    'dashboard.createFirstDeck': '创建您的第一个卡组',
    'dashboard.quickActions': '快速操作',
    'dashboard.quickActions.subtitle': '开始您的学习之旅',
    'dashboard.actions.createDeck': '创建新卡组',
    'dashboard.actions.browseDeck': '浏览我的卡组',
    'dashboard.actions.marketplace': '探索市场',
    
    // sets
    'loading': '加载中...',
    'save': '保存',
    'edit': '编辑',
    'editor.deckName': '卡组名称',
    'editor.editDeckName': '编辑卡组名称',
    'editor.saveDeckName': '保存卡组名称',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.zh': '中文'
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
    const currentTranslations = translations[language as keyof typeof translations] || translations.en;
    return (currentTranslations as any)[key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
