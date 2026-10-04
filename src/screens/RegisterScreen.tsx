import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { EXPENSE_CATEGORIES, EXPENSE_SOURCES, INCOME_ORIGINS } from '../domain/models';

export const RegisterScreen: React.FC = () => {
    const { colors } = useTheme();
    const { addTransaction } = useFinance();

    // Income State
    const [incomeAmount, setIncomeAmount] = useState('');
    const [incomeOrigin, setIncomeOrigin] = useState(INCOME_ORIGINS[0]);
    const [incomeDesc, setIncomeDesc] = useState('');

    // Expense State
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [expenseSource, setExpenseSource] = useState(EXPENSE_SOURCES[0]);
    const [expenseDesc, setExpenseDesc] = useState('');

    const handleRegisterIncome = () => {
        const amt = parseFloat(incomeAmount);
        if (isNaN(amt) || amt <= 0) return;
        addTransaction({ type: 'income', amount: amt, category: incomeOrigin, description: incomeDesc });
        setIncomeAmount(''); setIncomeDesc('');
    };

    const handleRegisterExpense = () => {
        const amt = parseFloat(expenseAmount);
        if (isNaN(amt) || amt <= 0) return;
        addTransaction({ type: 'expense', amount: amt, category: expenseCategory, source: expenseSource, description: expenseDesc });
        setExpenseAmount(''); setExpenseDesc('');
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>

                {/* Tarjeta Ingreso */}
                <View style={[styles.card, { borderColor: colors.success, backgroundColor: colors.surface }]}>
                    <Text style={[styles.title, { color: colors.success }]}>Ingreso</Text>

                    <View style={[styles.inputContainer, { borderColor: colors.success }]}>
                        <Text style={styles.currencyPrefix}>S/</Text>
                        <TextInput
                            style={styles.amountInput}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            value={incomeAmount}
                            onChangeText={setIncomeAmount}
                        />
                    </View>

                    <View style={[styles.chipContainer, { borderColor: colors.success }]}>
                        <Text style={styles.chipTitle}>Origen</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {INCOME_ORIGINS.map(o => (
                                <TouchableOpacity key={o} onPress={() => setIncomeOrigin(o)}>
                                    <Text style={[styles.chipText, incomeOrigin === o && { color: colors.success, fontWeight: 'bold' }]}>{o}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <Text style={[styles.addText, { color: colors.success }]}>Agregar</Text>

                    <TextInput
                        style={[styles.descInput, { borderColor: colors.success }]}
                        placeholder="Descripción"
                        value={incomeDesc}
                        onChangeText={setIncomeDesc}
                    />

                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.success }]} onPress={handleRegisterIncome}>
                        <Text style={styles.buttonText}>Registrar</Text>
                    </TouchableOpacity>
                </View>

                {/* Tarjeta Gasto */}
                <View style={[styles.card, { borderColor: colors.primary, backgroundColor: colors.surface, marginBottom: 100 }]}>
                    <Text style={[styles.title, { color: colors.primary }]}>Gasto</Text>

                    <View style={[styles.inputContainer, { borderColor: colors.primary }]}>
                        <Text style={styles.currencyPrefix}>S/</Text>
                        <TextInput
                            style={styles.amountInput}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            value={expenseAmount}
                            onChangeText={setExpenseAmount}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <View style={[styles.chipContainer, { borderColor: colors.primary, paddingVertical: 8 }]}>
                                <Text style={styles.chipTitle}>Categoria</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {EXPENSE_CATEGORIES.map(c => (
                                        <TouchableOpacity key={c} onPress={() => setExpenseCategory(c)}>
                                            <Text style={[styles.chipText, expenseCategory === c && { color: colors.primary, fontWeight: 'bold' }]}>{c}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <Text style={[styles.addText, { color: colors.primary }]}>Agregar</Text>
                        </View>

                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <View style={[styles.chipContainer, { borderColor: colors.primary, paddingVertical: 8 }]}>
                                <Text style={styles.chipTitle}>Fuente</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {EXPENSE_SOURCES.map(s => (
                                        <TouchableOpacity key={s} onPress={() => setExpenseSource(s)}>
                                            <Text style={[styles.chipText, expenseSource === s && { color: colors.primary, fontWeight: 'bold' }]}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <Text style={[styles.addText, { color: colors.primary }]}>Agregar</Text>
                        </View>
                    </View>

                    <TextInput
                        style={[styles.descInput, { borderColor: colors.primary }]}
                        placeholder="Descripción"
                        value={expenseDesc}
                        onChangeText={setExpenseDesc}
                    />

                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleRegisterExpense}>
                        <Text style={styles.buttonText}>Registrar</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        paddingTop: 60,
    },
    card: {
        borderRadius: 24,
        borderWidth: 3,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
    },
    currencyPrefix: {
        fontSize: 24,
        marginRight: 8,
        color: '#1F2937',
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        color: '#1F2937',
    },
    chipContainer: {
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    chipTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    chipText: {
        marginHorizontal: 8,
        color: '#6B7280',
    },
    addText: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    descInput: {
        borderWidth: 1.5,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    button: {
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});