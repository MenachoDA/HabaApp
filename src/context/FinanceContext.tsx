import React, { ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, EXPENSE_CATEGORIES, EXPENSE_SOURCES, INCOME_ORIGINS } from '../domain/models';
import { StorageRepository } from '../data/storage';
import * as Crypto from 'expo-crypto';
import { getLocalISOTime } from '../domain/utils';

interface FinanceContextProps {
    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'synced'>) => Promise<void>;
    isLoading: boolean;
    categories: string[];
    sources: string[];
    origins: string[];
    addCategory: (name: string) => Promise<void>;
    updateCategory: (oldName: string, newName: string) => Promise<void>;
    deleteCategory: (name: string) => Promise<void>;
    addSource: (name: string) => Promise<void>;
    updateSource: (oldName: string, newName: string) => Promise<void>;
    deleteSource: (name: string) => Promise<void>;
    addOrigin: (name: string) => Promise<void>;
    updateOrigin: (oldName: string, newName: string) => Promise<void>;
    deleteOrigin: (name: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextProps | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<string[]>(EXPENSE_CATEGORIES);
    const [sources, setSources] = useState<string[]>(EXPENSE_SOURCES);
    const [origins, setOrigins] = useState<string[]>(INCOME_ORIGINS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [loadedTx, loadedCategories, loadedSources, loadedOrigins] = await Promise.all([
                StorageRepository.loadTransactions(),
                StorageRepository.loadExpenseCategories(),
                StorageRepository.loadExpenseSources(),
                StorageRepository.loadIncomeOrigins(),
            ]);

            setTransactions(loadedTx);
            if (loadedCategories && loadedCategories.length > 0) setCategories(loadedCategories);
            if (loadedSources && loadedSources.length > 0) setSources(loadedSources);
            if (loadedOrigins && loadedOrigins.length > 0) setOrigins(loadedOrigins);
            setIsLoading(false);
        };
        load();
    }, []);

    const addTransaction = useCallback(async (txData: Omit<Transaction, 'id' | 'timestamp' | 'synced'>) => {
        const newTx: Transaction = {
            ...txData,
            id: Crypto.randomUUID(),
            timestamp: getLocalISOTime(),
            synced: false,
        };

        setTransactions(prev => {
            const updated = [newTx, ...prev];
            StorageRepository.saveTransactions(updated);
            return updated;
        });
    }, []);

    // Category methods
    const addCategory = useCallback(async (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setCategories(prev => {
            if (prev.includes(trimmed)) return prev;
            const updated = [...prev, trimmed];
            StorageRepository.saveExpenseCategories(updated);
            return updated;
        });
    }, []);

    const updateCategory = useCallback(async (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed || oldName === trimmed) return;
        setCategories(prev => {
            const updated = prev.map(c => c === oldName ? trimmed : c);
            StorageRepository.saveExpenseCategories(updated);
            return updated;
        });
        setTransactions(prev => {
            const updatedTx = prev.map(t => (t.type === 'expense' && t.category === oldName ? { ...t, category: trimmed } : t));
            StorageRepository.saveTransactions(updatedTx);
            return updatedTx;
        });
    }, []);

    const deleteCategory = useCallback(async (name: string) => {
        setCategories(prev => {
            const updated = prev.filter(c => c !== name);
            StorageRepository.saveExpenseCategories(updated);
            return updated;
        });
    }, []);

    // Source methods
    const addSource = useCallback(async (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setSources(prev => {
            if (prev.includes(trimmed)) return prev;
            const updated = [...prev, trimmed];
            StorageRepository.saveExpenseSources(updated);
            return updated;
        });
    }, []);

    const updateSource = useCallback(async (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed || oldName === trimmed) return;
        setSources(prev => {
            const updated = prev.map(s => s === oldName ? trimmed : s);
            StorageRepository.saveExpenseSources(updated);
            return updated;
        });
        setTransactions(prev => {
            const updatedTx = prev.map(t => (t.type === 'expense' && t.source === oldName ? { ...t, source: trimmed } : t));
            StorageRepository.saveTransactions(updatedTx);
            return updatedTx;
        });
    }, []);

    const deleteSource = useCallback(async (name: string) => {
        setSources(prev => {
            const updated = prev.filter(s => s !== name);
            StorageRepository.saveExpenseSources(updated);
            return updated;
        });
    }, []);

    // Origin methods
    const addOrigin = useCallback(async (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setOrigins(prev => {
            if (prev.includes(trimmed)) return prev;
            const updated = [...prev, trimmed];
            StorageRepository.saveIncomeOrigins(updated);
            return updated;
        });
    }, []);

    const updateOrigin = useCallback(async (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed || oldName === trimmed) return;
        setOrigins(prev => {
            const updated = prev.map(o => o === oldName ? trimmed : o);
            StorageRepository.saveIncomeOrigins(updated);
            return updated;
        });
        setTransactions(prev => {
            const updatedTx = prev.map(t => (t.type === 'income' && t.category === oldName ? { ...t, category: trimmed } : t));
            StorageRepository.saveTransactions(updatedTx);
            return updatedTx;
        });
    }, []);

    const deleteOrigin = useCallback(async (name: string) => {
        setOrigins(prev => {
            const updated = prev.filter(o => o !== name);
            StorageRepository.saveIncomeOrigins(updated);
            return updated;
        });
    }, []);

    return (
        <FinanceContext.Provider
            value={{
                transactions,
                addTransaction,
                isLoading,
                categories,
                sources,
                origins,
                addCategory,
                updateCategory,
                deleteCategory,
                addSource,
                updateSource,
                deleteSource,
                addOrigin,
                updateOrigin,
                deleteOrigin,
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance must be used within FinanceProvider');
    return context;
};