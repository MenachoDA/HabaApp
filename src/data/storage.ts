import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../domain/models';

const STORAGE_KEY = '@haba_transactions';

export const StorageRepository = {
    async saveTransactions(transactions: Transaction[]): Promise<void> {
        try {
            const jsonValue = JSON.stringify(transactions);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error('Error saving transactions', e);
        }
    },

    async loadTransactions(): Promise<Transaction[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error loading transactions', e);
            return [];
        }
    }
};