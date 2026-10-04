export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string; // UUID
    type: TransactionType;
    amount: number;
    category: string; // Origen para ingresos, Categoría para gastos
    source?: string; // Débito, Crédito, Efectivo (Solo gastos)
    description: string;
    timestamp: string; // ISO 8601
    synced: boolean;
}

export const EXPENSE_CATEGORIES = ['Comida', 'Servicios', 'Movilidad', 'Otros', 'Carro', 'Regalos'];
export const EXPENSE_SOURCES = ['Débito', 'Crédito', 'Efectivo'];
export const INCOME_ORIGINS = ['Trabajo', 'Mesada', 'Negocio'];