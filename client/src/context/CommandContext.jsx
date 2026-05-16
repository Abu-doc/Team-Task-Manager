import { createContext, useContext, useState, useEffect } from 'react';

const CommandContext = createContext();

export const CommandProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CommandContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </CommandContext.Provider>
  );
};

export const useCommand = () => useContext(CommandContext);