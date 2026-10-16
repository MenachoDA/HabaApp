import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../domain/models';

const STORAGE_KEYS = {
    TRANSACTIONS: '@haba_transactions',
    EXPENSE_CATEGORIES: '@haba_expense_categories',
    EXPENSE_SOURCES: '@haba_expense_sources',
    INCOME_ORIGINS: '@haba_income_origins',
};

export const StorageRepository = {
    async saveTransactions(transactions: Transaction[]): Promise<void> {
        try {
            const jsonValue = JSON.stringify(transactions);
            await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, jsonValue);
        } catch (e) {
            console.error('Error saving transactions', e);
        }
    },

    async loadTransactions(): Promise<Transaction[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error loading transactions', e);
            return [];
        }
    },

    async saveExpenseCategories(categories: string[]): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify(categories));
        } catch (e) {
            console.error('Error saving expense categories', e);
        }
    },

    async loadExpenseCategories(): Promise<string[] | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Error loading expense categories', e);
            return null;
        }
    },

    async saveExpenseSources(sources: string[]): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_SOURCES, JSON.stringify(sources));
        } catch (e) {
            console.error('Error saving expense sources', e);
        }
    },

    async loadExpenseSources(): Promise<string[] | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSE_SOURCES);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Error loading expense sources', e);
            return null;
        }
    },

    async saveIncomeOrigins(origins: string[]): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.INCOME_ORIGINS, JSON.stringify(origins));
        } catch (e) {
            console.error('Error saving income origins', e);
        }
    },

    async loadIncomeOrigins(): Promise<string[] | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.INCOME_ORIGINS);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Error loading income origins', e);
            return null;
        }
    }
};