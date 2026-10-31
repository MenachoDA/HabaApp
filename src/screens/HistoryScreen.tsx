import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { groupTransactionsByDay } from '../domain/utils';
import { TransactionDetailModal } from '../components/TransactionDetailModal';

interface HistoryScreenProps {
    onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
    const { colors } = useTheme();
    const {
        transactions,
        updateTransaction,
        deleteTransaction,
        categories,
        sources,
        origins,
    } = useFinance();

    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            onBack();
            return true;
        });
        return () => sub.remove();
    }, [onBack]);

    const dayGroups = groupTransactionsByDay(transactions);
    const selectedTransaction = transactions.find(t => t.id === selectedTxId) || null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={onBack}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Historial</Text>
                <View style={styles.headerRightSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {dayGroups.length === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No hay registros de gastos o ingresos aún.
                        </Text>
                    </View>
                ) : (
                    dayGroups.map(group => (
                        <View key={group.dateKey} style={styles.dayGroupContainer}>
                            {/* Pestaña superior gris claro con la fecha: "30 de Octubre 2026" */}
                            <View style={styles.dateTab}>
                                <Text style={styles.dateTabText}>{group.label}</Text>
                            </View>

                            {/* Lista de registros de ese día */}
                            <View style={[styles.recordsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                {group.transactions.map((tx, idx) => {
                                    const isIncome = tx.type === 'income';
                                    const rowTextColor = isIncome ? colors.success : colors.textMain;
                                    const isLast = idx === group.transactions.length - 1;
                                    const paymentOrSource = tx.source || (isIncome ? 'Ingreso' : '—');

                                    return (
                                        <TouchableOpacity
                                            key={tx.id}
                                            style={[
                                                styles.recordRow,
                                                !isLast && [styles.recordRowBorder, { borderBottomColor: colors.border }],
                                            ]}
                                            activeOpacity={0.65}
                                            onPress={() => setSelectedTxId(tx.id)}
                                        >
                                            <Text
                                                style={[styles.amountText, { color: rowTextColor }]}
                                                numberOfLines={1}
                                            >
                                                S/ {tx.amount.toFixed(2)}
                                            </Text>

                                            <Text
                                                style={[styles.categoryText, { color: rowTextColor }]}
                                                numberOfLines={1}
                                            >
                                                {tx.category}
                                            </Text>

                                            <View style={styles.sourceColumn}>
                                                <Text
                                                    style={[styles.sourceText, { color: rowTextColor }]}
                                                    numberOfLines={1}
                                                >
                                                    {paymentOrSource}
                                                </Text>
                                                <Ionicons
                                                    name="chevron-forward"
                                                    size={15}
                                                    color={isIncome ? colors.success : colors.textSecondary}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Pestaña modal de detalle y edición del registro */}
            <TransactionDetailModal
                visible={selectedTransaction !== null}
                transaction={selectedTransaction}
                onClose={() => setSelectedTxId(null)}
                categories={categories}
                sources={sources}
                origins={origins}
                onSave={updateTransaction}
                onDelete={deleteTransaction}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 56,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerRightSpacer: {
        width: 38,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    emptyCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 32,
        alignItems: 'center',
        marginTop: 24,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    dayGroupContainer: {
        marginBottom: 20,
    },
    dateTab: {
        backgroundColor: '#E5E7EB',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        marginBottom: 4,
    },
    dateTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    recordsCard: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    recordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        paddingHorizontal: 14,
    },
    recordRowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    amountText: {
        flex: 1.1,
        fontSize: 14,
        fontWeight: '700',
    },
    categoryText: {
        flex: 1.2,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    sourceColumn: {
        flex: 1.1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    sourceText: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'right',
    },
});

