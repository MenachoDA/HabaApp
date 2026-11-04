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

export const MONTH_NAMES_ES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

export const getMonthKeyFromTimestamp = (timestamp: string): string => {
    const datePart = timestamp.split('T')[0] || '';
    const parts = datePart.split('-');
    if (parts.length < 2) return '';
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    return `${year}-${month}`;
};

export const getCurrentMonthKey = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const formatMonthYear = (monthKey: string): string => {
    const parts = monthKey.split('-');
    if (parts.length < 2) return monthKey;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const monthName = MONTH_NAMES_ES[monthIndex] || parts[1];
    return `${monthName} ${year}`;
};

export const getAvailableMonths = (
    transactions: Transaction[],
    currentMonthKey: string = getCurrentMonthKey()
): string[] => {
    const monthSet = new Set<string>([currentMonthKey]);
    transactions.forEach(tx => {
        const key = getMonthKeyFromTimestamp(tx.timestamp);
        if (key) {
            monthSet.add(key);
        }
    });
    return Array.from(monthSet).sort((a, b) => a.localeCompare(b));
};

export const filterTransactionsByMonth = (
    transactions: Transaction[],
    monthKey: string
): Transaction[] => {
    return transactions.filter(tx => getMonthKeyFromTimestamp(tx.timestamp) === monthKey);
};

export const calculateBalanceIncomeForMonth = (
    transactions: Transaction[],
    monthKey: string
): number => {
    const parts = monthKey.split('-');
    if (parts.length < 2) return 0;
    const selectedYear = parseInt(parts[0], 10);
    const selectedMonth = parseInt(parts[1], 10);
    if (isNaN(selectedYear) || isNaN(selectedMonth)) return 0;

    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    const minPrevMonthDay = daysInPrevMonth - 2;

    return transactions
        .filter(tx => {
            if (tx.type !== 'income') return false;
            const datePart = tx.timestamp.split('T')[0] || '';
            const dateParts = datePart.split('-');
            if (dateParts.length !== 3) return false;

            const txYear = parseInt(dateParts[0], 10);
            const txMonth = parseInt(dateParts[1], 10);
            const txDay = parseInt(dateParts[2], 10);

            const isSelectedMonth = txYear === selectedYear && txMonth === selectedMonth;
            const isLastThreeDaysOfPrevMonth =
                txYear === prevYear &&
                txMonth === prevMonth &&
                txDay >= minPrevMonthDay &&
                txDay <= daysInPrevMonth;

            return isSelectedMonth || isLastThreeDaysOfPrevMonth;
        })
        .reduce((acc, curr) => acc + curr.amount, 0);
};

export const formatDateHeader = (dateKey: string): string => {
    const parts = dateKey.split('-');
    if (parts.length !== 3) return dateKey;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const monthName = MONTH_NAMES_ES[monthIndex] || parts[1];
    return `${day} de ${monthName} ${year}`;
};

export const formatDateTimeDisplay = (timestamp: string): string => {
    const [datePart, timePart] = timestamp.split('T');
    const formattedDate = formatDateHeader(datePart || '');
    const hhmm = timePart ? timePart.slice(0, 5) : '00:00';
    return `${formattedDate} - ${hhmm}`;
};

export interface DayTransactionGroup {
    dateKey: string;
    label: string;
    transactions: Transaction[];
}

export const groupTransactionsByDay = (transactions: Transaction[]): DayTransactionGroup[] => {
    const map: Record<string, Transaction[]> = {};

    transactions.forEach(tx => {
        const dateKey = tx.timestamp.split('T')[0] || '0000-00-00';
        if (!map[dateKey]) {
            map[dateKey] = [];
        }
        map[dateKey].push(tx);
    });

    const sortedKeys = Object.keys(map).sort((a, b) => b.localeCompare(a));

    return sortedKeys.map(dateKey => ({
        dateKey,
        label: formatDateHeader(dateKey),
        transactions: map[dateKey].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    }));
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