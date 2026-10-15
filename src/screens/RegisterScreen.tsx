import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
    const [isIncomeOriginExpanded, setIsIncomeOriginExpanded] = useState(false);

    // Expense State
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [expenseSource, setExpenseSource] = useState(EXPENSE_SOURCES[0]);
    const [expenseDesc, setExpenseDesc] = useState('');
    const [isExpenseCategoryExpanded, setIsExpenseCategoryExpanded] = useState(false);
    const [isExpenseSourceExpanded, setIsExpenseSourceExpanded] = useState(false);

    const handleRegisterIncome = () => {
        const amt = parseFloat(incomeAmount);
        if (isNaN(amt) || amt <= 0) return;
        addTransaction({ type: 'income', amount: amt, category: incomeOrigin, description: incomeDesc });
        setIncomeAmount(''); setIncomeDesc('');
        setIsIncomeOriginExpanded(false);
    };

    const handleRegisterExpense = () => {
        const amt = parseFloat(expenseAmount);
        if (isNaN(amt) || amt <= 0) return;
        addTransaction({ type: 'expense', amount: amt, category: expenseCategory, source: expenseSource, description: expenseDesc });
        setExpenseAmount(''); setExpenseDesc('');
        setIsExpenseCategoryExpanded(false);
        setIsExpenseSourceExpanded(false);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>

                {/* Tarjeta Ingreso */}
                <View style={[styles.incomeContainer]}>
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

                        <TouchableOpacity
                            style={[styles.chipContainer, { borderColor: colors.success }]}
                            onPress={() => setIsIncomeOriginExpanded(!isIncomeOriginExpanded)}
                        >
                            <Text style={styles.chipTitle}>Origen: {incomeOrigin}</Text>
                            {isIncomeOriginExpanded && (
                                <ScrollView style={styles.accordionScroll} nestedScrollEnabled={true}>
                                    {INCOME_ORIGINS.map(o => (
                                        <TouchableOpacity key={o} style={styles.accordionItem} onPress={() => { setIncomeOrigin(o); setIsIncomeOriginExpanded(false); }}>
                                            <Text style={[styles.chipText, incomeOrigin === o && { color: colors.success, fontWeight: 'bold' }]}>{o}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </TouchableOpacity>
                        <View style={[styles.addButtom]}>
                            <View style={{ alignItems: 'flex-end', flex: 1 }}>
                                <TouchableOpacity>
                                    <Text style={[styles.chipText]}>Editar origenes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>


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
                </View>
                {/* Tarjeta Gasto */}
                <View style={[styles.expenseContainer]}>
                    <View style={[styles.card, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
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
                            <View style={{ flex: 1, marginRight: 4 }}>
                                <TouchableOpacity
                                    style={[styles.chipContainer, { borderColor: colors.primary }]}
                                    onPress={() => setIsExpenseCategoryExpanded(!isExpenseCategoryExpanded)}
                                >
                                    <Text style={styles.chipTitle}>Categoría: {expenseCategory}</Text>
                                    {isExpenseCategoryExpanded && (
                                        <ScrollView style={styles.accordionScroll} nestedScrollEnabled={true}>
                                            {EXPENSE_CATEGORIES.map(c => (
                                                <TouchableOpacity key={c} style={styles.accordionItem} onPress={() => { setExpenseCategory(c); setIsExpenseCategoryExpanded(false); }}>
                                                    <Text style={[styles.chipText, expenseCategory === c && { color: colors.primary, fontWeight: 'bold' }]}>{c}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={{ flex: 1, marginLeft: 4 }}>
                                <TouchableOpacity
                                    style={[styles.chipContainer, { borderColor: colors.primary }]}
                                    onPress={() => setIsExpenseSourceExpanded(!isExpenseSourceExpanded)}
                                >
                                    <Text style={styles.chipTitle}>Fuente: {expenseSource}</Text>
                                    {isExpenseSourceExpanded && (
                                        <ScrollView style={styles.accordionScroll} nestedScrollEnabled={true}>
                                            {EXPENSE_SOURCES.map(s => (
                                                <TouchableOpacity key={s} style={styles.accordionItem} onPress={() => { setExpenseSource(s); setIsExpenseSourceExpanded(false); }}>
                                                    <Text style={[styles.chipText, expenseSource === s && { color: colors.primary, fontWeight: 'bold' }]}>{s}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[styles.addButtom]}>
                            <View>
                                <TouchableOpacity>
                                    <Text style={[styles.chipText]}>Agregar Categoria</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ alignItems: 'center', flex: 1 }}>
                                <TouchableOpacity>
                                    <Text style={[styles.chipText]}>Agregar Fuente</Text>
                                </TouchableOpacity>
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
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    addButtom: {
        flexDirection: 'row',
        justifyContent: 'flex-start'

    },
    container: {
        flex: 1,
        padding: 40,
        paddingTop: 80
    },
    incomeContainer: {},
    expenseContainer: {
        flex: 1,
        paddingTop: 20,
        justifyContent: 'flex-start'


    },
    card: {
        borderRadius: 16,
        borderWidth: 2,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    currencyPrefix: {
        fontSize: 20,
        marginRight: 6,
        color: '#1F2937',
    },
    amountInput: {
        flex: 1,
        fontSize: 20,
        color: '#1F2937',
    },
    chipContainer: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 7,
        alignItems: 'center',
        marginBottom: 12,
    },
    chipTitle: {
        fontWeight: 'bold',
        fontSize: 13,
        textAlign: 'center',
    },
    accordionScroll: {
        marginTop: 4,
        maxHeight: 120,
        width: '100%',
    },
    accordionItem: {
        paddingVertical: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
        width: '100%',
        alignItems: 'center',
    },
    chipText: {
        marginHorizontal: 4,
        marginVertical: 4,
        fontSize: 12,
        color: '#6B7280',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    descInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        fontSize: 14,
    },
    button: {
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    }
});