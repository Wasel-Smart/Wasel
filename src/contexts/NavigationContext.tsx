import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
    currentPage: string;
    navigate: (page: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const [currentPage, setCurrentPage] = useState('dashboard');

    const navigate = (page: string) => {
        setCurrentPage(page);
    };

    return (
        <NavigationContext.Provider value={{ currentPage, navigate }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}