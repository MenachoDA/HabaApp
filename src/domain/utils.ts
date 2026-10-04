import { Transaction } from './models';

export const calculateTotal = (transactions: Transaction[], type: 'income' | 'expense') => {
    return transactions
        .filter(t => t.type === type)
        .reduce((acc, curr) => acc + curr.amount, 0);
};

export const groupExpensesByCategory = (transactions: Transaction[]) => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped: Record<string, number> = {};
    expenses.forEach(t => {
        grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return grouped;
};

export const groupExpensesByDay = (transactions: Transaction[]) => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped: Record<string, number> = {};
    expenses.forEach(t => {
        // Extraemos el día directamente de la fecha local para evitar que cambie si el usuario viaja a otra zona horaria
        const datePart = t.timestamp.split('T')[0];
        const day = parseInt(datePart.split('-')[2], 10).toString();
        grouped[day] = (grouped[day] || 0) + t.amount;
    });
    return grouped;
};

export const getLocalISOTime = (): string => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const sign = offset > 0 ? '-' : '+';
    const absOffset = Math.abs(offset);
    const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const minutes = String(absOffset % 60).padStart(2, '0');
    
    return now.getFullYear() +
        '-' + String(now.getMonth() + 1).padStart(2, '0') +
        '-' + String(now.getDate()).padStart(2, '0') +
        'T' + String(now.getHours()).padStart(2, '0') +
        ':' + String(now.getMinutes()).padStart(2, '0') +
        ':' + String(now.getSeconds()).padStart(2, '0') +
        '.' + String(now.getMilliseconds()).padStart(3, '0') +
        sign + hours + ':' + minutes;
};