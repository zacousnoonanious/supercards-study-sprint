
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
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign Out',
    'nav.createSet': 'Create New Set',
    'welcome': 'Welcome',
    'loading': 'Loading...',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    
    // Dashboard
    'dashboard.title': 'Your Flashcard Sets',
    'dashboard.noSets': 'No flashcard sets yet',
    'dashboard.noSetsDesc': 'Create your first set to get started!',
    'dashboard.createFirst': 'Create Your First Set',
    'dashboard.viewCards': 'View Cards',
    'dashboard.study': 'Study',
    
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
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
    'lang.zh': '中文',
    
    // Theme Settings
    'theme.settings': 'Theme Settings',
    'theme.colorTheme': 'Color Theme',
    'theme.interfaceSize': 'Interface Size',
  },
  es: {
    // Navigation & General
    'nav.dashboard': 'Panel',
    'nav.profile': 'Perfil',
    'nav.signOut': 'Cerrar Sesión',
    'nav.createSet': 'Crear Nuevo Set',
    'welcome': 'Bienvenido',
    'loading': 'Cargando...',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'edit': 'Editar',
    'delete': 'Eliminar',
    
    // Dashboard
    'dashboard.title': 'Tus Sets de Tarjetas',
    'dashboard.noSets': 'No hay sets de tarjetas aún',
    'dashboard.noSetsDesc': '¡Crea tu primer set para empezar!',
    'dashboard.createFirst': 'Crear Tu Primer Set',
    'dashboard.viewCards': 'Ver Tarjetas',
    'dashboard.study': 'Estudiar',
    
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
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
    'lang.zh': '中文',
    
    // Theme Settings
    'theme.settings': 'Configuración del Tema',
    'theme.colorTheme': 'Tema de Color',
    'theme.interfaceSize': 'Tamaño de Interfaz',
  },
  fr: {
    // Navigation & General
    'nav.dashboard': 'Tableau de Bord',
    'nav.profile': 'Profil',
    'nav.signOut': 'Se Déconnecter',
    'nav.createSet': 'Créer Nouveau Set',
    'welcome': 'Bienvenue',
    'loading': 'Chargement...',
    'save': 'Sauvegarder',
    'cancel': 'Annuler',
    'edit': 'Éditer',
    'delete': 'Supprimer',
    
    // Dashboard
    'dashboard.title': 'Vos Sets de Cartes',
    'dashboard.noSets': 'Aucun set de cartes encore',
    'dashboard.noSetsDesc': 'Créez votre premier set pour commencer!',
    'dashboard.createFirst': 'Créer Votre Premier Set',
    'dashboard.viewCards': 'Voir les Cartes',
    'dashboard.study': 'Étudier',
    
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
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
    'lang.zh': '中文',
    
    // Theme Settings
    'theme.settings': 'Paramètres du Thème',
    'theme.colorTheme': 'Thème de Couleur',
    'theme.interfaceSize': 'Taille de l\'Interface',
  },
  zh: {
    // Navigation & General
    'nav.dashboard': '仪表板',
    'nav.profile': '个人资料',
    'nav.signOut': '退出登录',
    'nav.createSet': '创建新卡组',
    'welcome': '欢迎',
    'loading': '加载中...',
    'save': '保存',
    'cancel': '取消',
    'edit': '编辑',
    'delete': '删除',
    
    // Dashboard
    'dashboard.title': '您的闪卡卡组',
    'dashboard.noSets': '暂无闪卡卡组',
    'dashboard.noSetsDesc': '创建您的第一个卡组开始学习！',
    'dashboard.createFirst': '创建您的第一个卡组',
    'dashboard.viewCards': '查看卡片',
    'dashboard.study': '学习',
    
    // Profile
    'profile.title': '个人资料设置',
    'profile.personalInfo': '个人信息',
    'profile.firstName': '名',
    'profile.lastName': '姓',
    'profile.email': '电子邮箱',
    'profile.avatar': '头像',
    'profile.language': '语言',
    'profile.selectAvatar': '选择头像',
    'profile.updateSuccess': '个人资料更新成功！',
    'profile.updateError': '更新个人资料失败。',
    'profile.changeAvatar': '更换头像',
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
    'lang.zh': '中文',
    
    // Theme Settings
    'theme.settings': '主题设置',
    'theme.colorTheme': '颜色主题',
    'theme.interfaceSize': '界面大小',
  }
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

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
