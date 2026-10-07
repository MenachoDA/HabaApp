// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { calculateTotal, groupExpensesByCategory, groupExpensesByDay } from '../domain/utils';
import { DonutChart } from '../components/DonutChart';
import { BarChart } from '../components/BarChart';

export const DashboardScreen: React.FC = () => {
    const { colors } = useTheme();
    const { transactions } = useFinance();

    const totalIncome = calculateTotal(transactions, 'income');
    const totalExpense = calculateTotal(transactions, 'expense');
    const balance = totalIncome - totalExpense;

    const expensesByCategory = groupExpensesByCategory(transactions);
    const expensesByDay = groupExpensesByDay(transactions);

    const topCategory = Object.keys(expensesByCategory).length > 0
        ? Object.keys(expensesByCategory).reduce((a, b) => expensesByCategory[a] > expensesByCategory[b] ? a : b)
        : 'N/A';

    const currentMonth = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 120 }}>
            <Text style={[styles.headerTitle, { color: colors.textMain }]}>
                {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
            </Text>

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
                <Text style={{ textAlign: 'center', marginTop: 8, color: balance >= 0 ? colors.success : colors.primary, fontWeight: 'bold' }}>
                    Balance: S/{balance.toFixed(2)}
                </Text>
            </View>
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
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