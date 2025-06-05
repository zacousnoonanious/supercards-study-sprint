
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
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
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
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
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
    
    // Languages
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'lang.de': 'Deutsch',
    'lang.it': 'Italiano',
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
