import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimeErrorPopup } from '../components/AnimeErrorPopup';

interface ErrorContextType {
  showError: (message: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useAnimeError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useAnimeError must be used within AnimeErrorProvider');
  }
  return context;
};

interface AnimeErrorProviderProps {
  children: ReactNode;
}

export const AnimeErrorProvider: React.FC<AnimeErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showError = (message: string) => {
    setError({ visible: true, message });
  };

  const hideError = () => {
    setError({ visible: false, message: '' });
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <AnimeErrorPopup
        visible={error.visible}
        message={error.message}
        onClose={hideError}
      />
    </ErrorContext.Provider>
  );
};

// Global error handler for async operations
export const handleAsyncError = (error: any, defaultMessage = 'Operation failed') => {
  let message = defaultMessage;
  
  if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  // Clean up technical messages for user display
  if (message.includes('Network request failed')) {
    message = 'No internet connection';
  } else if (message.includes('JSON')) {
    message = 'Server error - try again';
  } else if (message.includes('undefined')) {
    message = 'Something went wrong';
  }
  
  return message;
};