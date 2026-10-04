import React, { ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction } from '../domain/models';
import { StorageRepository } from '../data/storage';
import * as Crypto from 'expo-crypto';
import { getLocalISOTime } from '../domain/utils';

interface FinanceContextProps {
    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'synced'>) => Promise<void>;
    isLoading: boolean;
}

const FinanceContext = createContext<FinanceContextProps | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await StorageRepository.loadTransactions();
            setTransactions(data);
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

        const updated = [newTx, ...transactions];
        setTransactions(updated);
        await StorageRepository.saveTransactions(updated);
    }, [transactions]);

    return (
        <FinanceContext.Provider value={{ transactions, addTransaction, isLoading }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance must be used within FinanceProvider');
    return context;
};