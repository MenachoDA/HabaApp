// src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import {
    calculateTotal,
    groupExpensesByCategory,
    groupExpensesByDay,
    getCurrentMonthKey,
    getAvailableMonths,
    filterTransactionsByMonth,
    formatMonthYear,
    calculateBalanceIncomeForMonth,
} from '../domain/utils';
import { DonutChart } from '../components/DonutChart';
import { BarChart } from '../components/BarChart';

export const DashboardScreen: React.FC = () => {
    const { colors } = useTheme();
    const { transactions } = useFinance();

    const currentMonthKey = getCurrentMonthKey();
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [dropdownTop, setDropdownTop] = useState<number>(48);

    const availableMonths = useMemo(
        () => getAvailableMonths(transactions, currentMonthKey),
        [transactions, currentMonthKey]
    );

    useEffect(() => {
        if (!availableMonths.includes(selectedMonth)) {
            setSelectedMonth(currentMonthKey);
        }
    }, [availableMonths, selectedMonth, currentMonthKey]);

    // Transacciones exclusivas del mes seleccionado en el título
    const monthTransactions = useMemo(
        () => filterTransactionsByMonth(transactions, selectedMonth),
        [transactions, selectedMonth]
    );

    const totalExpense = useMemo(
        () => calculateTotal(monthTransactions, 'expense'),
        [monthTransactions]
    );

    // Balance especial: gastos del mes seleccionado vs ingresos del mes seleccionado + ingresos de los últimos 3 días del mes anterior
    const totalIncome = useMemo(
        () => calculateBalanceIncomeForMonth(transactions, selectedMonth),
        [transactions, selectedMonth]
    );

    const balance = totalIncome - totalExpense;

    const expensesByCategory = useMemo(
        () => groupExpensesByCategory(monthTransactions),
        [monthTransactions]
    );

    const expensesByDay = useMemo(
        () => groupExpensesByDay(monthTransactions),
        [monthTransactions]
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: 120 }}
        >
            <View
                style={styles.headerContainer}
                onLayout={e => {
                    const { y, height } = e.nativeEvent.layout;
                    setDropdownTop(y + height + 4);
                }}
            >
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => setIsMenuOpen(prev => !prev)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>
                        {formatMonthYear(selectedMonth)}
                    </Text>
                    <Ionicons
                        name={isMenuOpen ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={colors.textMain}
                        style={styles.headerChevron}
                    />
                </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.headersummary}>
                    <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Gasto por Día</Text>
                    <Text style={[styles.summaryValue, { color: colors.textMain }]}>Gasto Total: S/{totalExpense.toFixed(2)}</Text>
                </View>
                <BarChart data={expensesByDay} />
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Gasto por Categoría</Text>
                <DonutChart data={expensesByCategory} />
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Balance Mensual</Text>
                <View style={styles.balanceBarContainer}>
                    <View style={[styles.balanceBar, { backgroundColor: colors.success, flex: totalIncome || 1 }]} />
                    <View style={[styles.balanceBar, { backgroundColor: colors.primary, flex: totalExpense || 0 }]} />
                </View>
                <Text style={{ textAlign: 'center', marginTop: 8, color: balance >= 0 ? colors.success : colors.fail, fontWeight: 'bold' }}>
                    Balance: S/{balance.toFixed(2)}
                </Text>
            </View>

            {isMenuOpen && (
                <>
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={() => setIsMenuOpen(false)}
                    />
                    <View
                        style={[
                            styles.accordionMenu,
                            {
                                top: dropdownTop,
                                backgroundColor: colors.surface,
                                borderColor: colors.primary,
                            },
                        ]}
                    >
                        <ScrollView
                            style={styles.accordionScroll}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                        >
                            {availableMonths.map((monthKey, index) => {
                                const isSelected = monthKey === selectedMonth;
                                const isLast = index === availableMonths.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={monthKey}
                                        style={[
                                            styles.accordionItem,
                                            !isLast && {
                                                borderBottomWidth: StyleSheet.hairlineWidth,
                                                borderBottomColor: colors.border,
                                            },
                                            isSelected && {
                                                backgroundColor: colors.primary + '15',
                                            },
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            setSelectedMonth(monthKey);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.accordionItemText,
                                                { color: isSelected ? colors.primary : colors.textMain },
                                                isSelected && styles.accordionItemTextSelected,
                                            ]}
                                        >
                                            {formatMonthYear(monthKey)}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={16} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    headersummary: {
        flexDirection: 'row',          // Coloca los elementos uno al lado del otro
        justifyContent: 'space-between', // Empuja uno a la izquierda y otro a la derecha        // Los alinea verticalmente al centro
        marginBottom: 12,              // Da un pequeño espacio antes de que empiece el gráfico
    },
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 60,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 24,
        zIndex: 1000,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerChevron: {
        marginLeft: 6,
        marginTop: 2,
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        zIndex: 999,
        elevation: 15,
    },
    accordionMenu: {
        position: 'absolute',
        alignSelf: 'center',
        minWidth: 220,
        maxHeight: 220,
        borderRadius: 14,
        borderWidth: 1.5,
        zIndex: 1000,
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        overflow: 'hidden',
    },
    accordionScroll: {
        maxHeight: 220,
    },
    accordionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    accordionItemText: {
        fontSize: 15,
        fontWeight: '500',
    },
    accordionItemTextSelected: {
        fontWeight: 'bold',
    },
    summaryValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    balanceBarContainer: {
        height: 24,
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
    },
    balanceBar: {
        height: '100%',
    }
});