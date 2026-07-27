import { createContext, useContext, useState, ReactNode } from 'react';

interface UiContextValue {
  cartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  return (
    <UiContext.Provider
      value={{
        cartDrawerOpen,
        openCartDrawer: () => setCartDrawerOpen(true),
        closeCartDrawer: () => setCartDrawerOpen(false),
      }}
    >
      {children}
    </UiContext.Provider>
  );
}

export function useUiContext(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) {
    throw new Error('useUiContext must be used within a UiProvider');
  }
  return ctx;
}
