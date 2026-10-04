import React, { createContext, useContext, useState, useMemo } from 'react';
import { IThemeStrategy, LightThemeStrategy, ThemeColors } from '../domain/theme';

interface ThemeContextProps {
    colors: ThemeColors;
    setStrategy: (strategy: IThemeStrategy) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [strategy, setStrategy] = useState<IThemeStrategy>(new LightThemeStrategy());

    const value = useMemo(() => ({
        colors: strategy.getColors(),
        setStrategy
    }), [strategy]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};