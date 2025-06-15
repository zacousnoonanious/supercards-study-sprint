
import { useState, useEffect } from 'react';
import { Flashcard } from '@/types/flashcard';

interface OfflineStudySession {
  id: string;
  setId: string;
  cardId: string;
  score: number;
  timeSpent: number;
  timestamp: number;
}

export const useOfflineStorage = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeDB();
  }, []);

  const initializeDB = async () => {
    try {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported');
        return;
      }

      const request = indexedDB.open('SuperCardsDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores
        if (!db.objectStoreNames.contains('decks')) {
          db.createObjectStore('decks', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('cards')) {
          db.createObjectStore('cards', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('offlineStudySessions')) {
          const store = db.createObjectStore('offlineStudySessions', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
      };

      request.onsuccess = () => {
        setIsInitialized(true);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
      };
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  };

  const saveDeckOffline = async (deck: any, cards: Flashcard[]) => {
    if (!isInitialized) return;

    try {
      const request = indexedDB.open('SuperCardsDB', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['decks', 'cards'], 'readwrite');
        
        // Save deck
        transaction.objectStore('decks').put({
          ...deck,
          cached_at: Date.now()
        });
        
        // Save cards
        const cardStore = transaction.objectStore('cards');
        cards.forEach(card => {
          cardStore.put({
            ...card,
            set_id: deck.id,
            cached_at: Date.now()
          });
        });
      };
    } catch (error) {
      console.error('Failed to save deck offline:', error);
    }
  };

  const getOfflineDecks = async (): Promise<any[]> => {
    if (!isInitialized) return [];

    return new Promise((resolve) => {
      const request = indexedDB.open('SuperCardsDB', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['decks'], 'readonly');
        const store = transaction.objectStore('decks');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };
      };
    });
  };

  const getOfflineCards = async (setId: string): Promise<Flashcard[]> => {
    if (!isInitialized) return [];

    return new Promise((resolve) => {
      const request = indexedDB.open('SuperCardsDB', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['cards'], 'readonly');
        const store = transaction.objectStore('cards');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const allCards = getAllRequest.result || [];
          const filteredCards = allCards.filter(card => card.set_id === setId);
          resolve(filteredCards);
        };
      };
    });
  };

  const saveOfflineStudySession = async (session: Omit<OfflineStudySession, 'id'>) => {
    if (!isInitialized) return;

    try {
      const request = indexedDB.open('SuperCardsDB', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['offlineStudySessions'], 'readwrite');
        const store = transaction.objectStore('offlineStudySessions');
        
        store.add({
          ...session,
          id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      };
    } catch (error) {
      console.error('Failed to save offline study session:', error);
    }
  };

  const getOfflineStudySessions = async (): Promise<OfflineStudySession[]> => {
    if (!isInitialized) return [];

    return new Promise((resolve) => {
      const request = indexedDB.open('SuperCardsDB', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['offlineStudySessions'], 'readonly');
        const store = transaction.objectStore('offlineStudySessions');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };
      };
    });
  };

  const clearOfflineStudySessions = async () => {
    if (!isInitialized) return;

    try {
      const request = indexedDB.open('SuperCardsDB', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['offlineStudySessions'], 'readwrite');
        const store = transaction.objectStore('offlineStudySessions');
        store.clear();
      };
    } catch (error) {
      console.error('Failed to clear offline study sessions:', error);
    }
  };

  return {
    isInitialized,
    saveDeckOffline,
    getOfflineDecks,
    getOfflineCards,
    saveOfflineStudySession,
    getOfflineStudySessions,
    clearOfflineStudySessions
  };
};
