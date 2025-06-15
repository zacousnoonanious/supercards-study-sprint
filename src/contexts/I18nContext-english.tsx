
import { common } from "@/i18n/translations/en/common";
import { editor } from "@/i18n/translations/en/editor";
import { toolbar } from "@/i18n/translations/en/toolbar";
import { study } from "@/i18n/translations/en/study";
import { nav } from "@/i18n/translations/en/nav";
import { forms } from "@/i18n/translations/en/forms";
import { profile } from "@/i18n/translations/en/profile";
import { theme } from "@/i18n/translations/en/theme";
import { lang } from "@/i18n/translations/en/lang";
import { marketplace } from "@/i18n/translations/en/marketplace";
import { sets } from "@/i18n/translations/en/sets";
import { ai } from "@/i18n/translations/en/ai";
import { messages } from "@/i18n/translations/en/messages";
import { placeholders } from "@/i18n/translations/en/placeholders";
import { auth } from "@/i18n/translations/en/auth";
import { contextMenu } from "@/i18n/translations/en/contextMenu";
import { dashboard } from "./I18nContext-dashboard";
import { createSet } from "./I18nContext-create-set";
import { home } from "./I18nContext-home";

export const englishTranslations = {
  common: {
    ...common,
    noDescription: "No description",
  },
  editor,
  toolbar,
  contextMenu,
  study,
  nav,
  dashboard,
  forms,
  profile,
  theme,
  lang,
  marketplace,
  sets,
  ai,
  messages,
  placeholders,
  auth,
  createSet,
  home,
  decks: {
    title: "My Decks",
    createNew: "Create New Deck",
    noDecks: "No flashcard decks yet",
    noDecksDesc: "Create your first deck to get started with studying!",
    createFirst: "Create First Deck",
    viewCards: "View Cards",
    study: "Study",
    deleteConfirm: "Delete Deck",
    deleteMessage: "Are you sure you want to delete '{title}'? This action cannot be undone.",
    deleteSuccess: "Deck '{title}' has been deleted successfully",
    deleteError: "Failed to delete deck",
    loadError: "Failed to load decks",
    joinDeck: "Join Deck",
  },
  analytics: {
    title: "Performance Analytics",
    subtitle: "Track your learning progress and study statistics",
    overview: "Overview",
    performance: "Performance",
    studyTime: "Study Time",
    accuracy: "Accuracy",
    streaks: "Streaks",
    cardsStudied: "Cards Studied",
    sessionsCompleted: "Sessions Completed",
    averageAccuracy: "Average Accuracy",
    currentStreak: "Current Streak",
    longestStreak: "Longest Streak",
    thisWeek: "This Week",
    thisMonth: "This Month",
    allTime: "All Time",
    dailyProgress: "Daily Progress",
    weeklyProgress: "Weekly Progress",
    monthlyProgress: "Monthly Progress",
    noDataAvailable: "No data available",
    studyMore: "Study more to see statistics here",
  },
  admin: {
    title: "Admin Console",
    subtitle: "Manage users, organizations, and system settings",
    userManagement: "User Management",
    organizationManagement: "Organization Management", 
    systemSettings: "System Settings",
    users: "Users",
    organizations: "Organizations",
    settings: "Settings",
    totalUsers: "Total Users",
    activeUsers: "Active Users",
    totalOrganizations: "Total Organizations",
    systemHealth: "System Health",
    recentActivity: "Recent Activity",
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    createOrganization: "Create Organization",
    viewDetails: "View Details",
    managePermissions: "Manage Permissions",
    exportData: "Export Data",
    importData: "Import Data",
    backupSystem: "Backup System",
    restoreSystem: "Restore System",
  },
  i18nTester: {
    title: "i18n Translation Tester",
    currentLanguage: "Current Language: ",
    availableLanguages: "Available Languages:",
    testTranslations: "Test Translations:",
    debugInfo: "Debug Info:",
    language: "Language:",
    sampleTranslationTest: "Sample Translation Test:",
    notFound: "NOT FOUND",
    chineseSimplifiedTest: "Chinese Simplified Test:",
    notInZhCnMode: "Not in zh-CN mode",
    chineseTraditionalTest: "Chinese Traditional Test:",
    notInZhTwMode: "Not in zh-TW mode",
  },
  collaboration: {
    roleEditor: "Editor",
    roleViewer: "Viewer",
    activeOnThisCard: "Active on this card",
    activeOnAnotherCard: "Active on another card",
    browsingDeck: "Browsing deck",
    noOtherUsersOnline: "No other users online",
    userTooltip: "{name} - {role}",
  },
};
