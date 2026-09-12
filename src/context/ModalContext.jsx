import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);

  const openNewTripModal = () => setIsNewTripOpen(true);
  const closeNewTripModal = () => setIsNewTripOpen(false);

  return (
    <ModalContext.Provider value={{ isNewTripOpen, openNewTripModal, closeNewTripModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);