import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Transaction } from '../domain/models';
import { formatDateTimeDisplay } from '../domain/utils';

interface TransactionDetailModalProps {
    visible: boolean;
    transaction: Transaction | null;
    onClose: () => void;
    categories: string[];
    sources: string[];
    origins: string[];
    onSave: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void> | void;
    onDelete: (id: string) => Promise<void> | void;
}

type EditableField = 'amount' | 'category' | 'source' | 'datetime' | 'description' | null;

const parseTimestampParts = (timestamp: string) => {
    const [datePart = '2026-01-01', timePart = '00:00:00'] = timestamp.split('T');
    const [year = '2026', month = '01', day = '01'] = datePart.split('-');
    const timeClean = timePart.split('.')[0] || '00:00:00';
    const [hour = '00', minute = '00'] = timeClean.split(':');
    const tzMatch = timestamp.match(/([+-]\d{2}:\d{2}|Z)$/);
    const tz = tzMatch ? tzMatch[1] : '-05:00';

    return { year, month, day, hour, minute, tz };
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    visible,
    transaction,
    onClose,
    categories,
    sources,
    origins,
    onSave,
    onDelete,
}) => {
    const { colors } = useTheme();

    const [editingField, setEditingField] = useState<EditableField>(null);

    // Local draft values synced with transaction
    const [amountStr, setAmountStr] = useState('');
    const [categoryVal, setCategoryVal] = useState('');
    const [sourceVal, setSourceVal] = useState('');
    const [descVal, setDescVal] = useState('');
    const [timestampVal, setTimestampVal] = useState('');

    // Date/Time sub-fields
    const [dayStr, setDayStr] = useState('');
    const [monthStr, setMonthStr] = useState('');
    const [yearStr, setYearStr] = useState('');
    const [hourStr, setHourStr] = useState('');
    const [minuteStr, setMinuteStr] = useState('');
    const [tzStr, setTzStr] = useState('-05:00');

    useEffect(() => {
        if (transaction) {
            setAmountStr(transaction.amount.toFixed(2));
            setCategoryVal(transaction.category);
            setSourceVal(transaction.source || (transaction.type === 'income' ? (sources[0] || 'Efectivo') : (sources[0] || 'Débito')));
            setDescVal(transaction.description || '');
            setTimestampVal(transaction.timestamp);

            const parts = parseTimestampParts(transaction.timestamp);
            setDayStr(parts.day);
            setMonthStr(parts.month);
            setYearStr(parts.year);
            setHourStr(parts.hour);
            setMinuteStr(parts.minute);
            setTzStr(parts.tz);
            setEditingField(null);
        }
    }, [transaction, sources]);

    if (!transaction) return null;

    const isIncome = transaction.type === 'income';
    const accentColor = isIncome ? colors.success : colors.primary;
    const categoryOptions = isIncome ? origins : categories;

    const buildValidatedTimestamp = (): string | null => {
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10);
        const d = parseInt(dayStr, 10);
        const hh = parseInt(hourStr, 10);
        const mm = parseInt(minuteStr, 10);

        if (
            isNaN(y) || y < 1970 || y > 2100 ||
            isNaN(m) || m < 1 || m > 12 ||
            isNaN(d) || d < 1 || d > 31 ||
            isNaN(hh) || hh < 0 || hh > 23 ||
            isNaN(mm) || mm < 0 || mm > 59
        ) {
            Alert.alert('Aviso', 'Ingresa una fecha y hora válidas (DD/MM/AAAA y HH:MM).');
            return null;
        }

        const pad2 = (n: number) => String(n).padStart(2, '0');
        return `${y}-${pad2(m)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}:00.000${tzStr}`;
    };

    const saveSingleField = async (field: EditableField): Promise<boolean> => {
        if (!field) return true;

        if (field === 'amount') {
            const parsed = parseFloat(amountStr);
            if (isNaN(parsed) || parsed <= 0) {
                Alert.alert('Aviso', 'Ingresa un monto válido mayor a 0.');
                return false;
            }
            setAmountStr(parsed.toFixed(2));
            await onSave(transaction.id, { amount: parsed });
        } else if (field === 'category') {
            const trimmed = categoryVal.trim();
            if (!trimmed) {
                Alert.alert('Aviso', 'La categoría no puede estar vacía.');
                return false;
            }
            setCategoryVal(trimmed);
            await onSave(transaction.id, { category: trimmed });
        } else if (field === 'source') {
            const trimmed = sourceVal.trim();
            if (!trimmed) {
                Alert.alert('Aviso', 'La fuente/medio de pago no puede estar vacía.');
                return false;
            }
            setSourceVal(trimmed);
            await onSave(transaction.id, { source: trimmed });
        } else if (field === 'datetime') {
            const newTs = buildValidatedTimestamp();
            if (!newTs) return false;
            setTimestampVal(newTs);
            await onSave(transaction.id, { timestamp: newTs });
        } else if (field === 'description') {
            const trimmed = descVal.trim();
            setDescVal(trimmed);
            await onSave(transaction.id, { description: trimmed });
        }

        setEditingField(null);
        return true;
    };

    const handleSaveAllAndClose = async () => {
        const parsedAmount = parseFloat(amountStr);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Aviso', 'Ingresa un monto válido mayor a 0.');
            return;
        }

        let finalTimestamp = timestampVal;
        if (editingField === 'datetime') {
            const validatedTs = buildValidatedTimestamp();
            if (!validatedTs) return;
            finalTimestamp = validatedTs;
        }

        const trimmedCategory = categoryVal.trim() || transaction.category;
        const trimmedSource = sourceVal.trim();

        await onSave(transaction.id, {
            amount: parsedAmount,
            category: trimmedCategory,
            source: trimmedSource || transaction.source,
            timestamp: finalTimestamp,
            description: descVal.trim(),
        });

        setEditingField(null);
        onClose();
    };

    const handleDeleteAndClose = async () => {
        await onDelete(transaction.id);
        setEditingField(null);
        onClose();
    };

    const cancelFieldEdit = (field: EditableField) => {
        if (field === 'amount') setAmountStr(transaction.amount.toFixed(2));
        if (field === 'category') setCategoryVal(transaction.category);
        if (field === 'source') setSourceVal(transaction.source || (sources[0] || ''));
        if (field === 'description') setDescVal(transaction.description || '');
        if (field === 'datetime') {
            const parts = parseTimestampParts(timestampVal);
            setDayStr(parts.day);
            setMonthStr(parts.month);
            setYearStr(parts.year);
            setHourStr(parts.hour);
            setMinuteStr(parts.minute);
        }
        setEditingField(null);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />

                <TouchableOpacity
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.centerContainer}
                >
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: accentColor }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: accentColor }]}>
                                {isIncome ? 'Detalle de Ingreso' : 'Detalle de Gasto'}
                            </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.detailsScroll}
                            contentContainerStyle={styles.detailsContent}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* 1. MONTO */}
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Monto</Text>
                            {editingField === 'amount' ? (
                                <View style={[styles.itemRow, styles.itemRowEditing, { borderColor: accentColor, backgroundColor: colors.background }]}>
                                    <Text style={[styles.currencyPrefix, { color: colors.textMain }]}>S/</Text>
                                    <TextInput
                                        style={[styles.editInput, { color: colors.textMain }]}
                                        value={amountStr}
                                        onChangeText={setAmountStr}
                                        keyboardType="decimal-pad"
                                        autoFocus={true}
                                        returnKeyType="done"
                                        onSubmitEditing={() => saveSingleField('amount')}
                                    />
                                    <View style={styles.itemActions}>
                                        <TouchableOpacity
                                            style={[styles.actionIconBtn, { backgroundColor: accentColor }]}
                                            onPress={() => saveSingleField('amount')}
                                        >
                                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionIconBtn, { backgroundColor: '#9CA3AF' }]}
                                            onPress={() => cancelFieldEdit('amount')}
                                        >
                                            <Ionicons name="close" size={18} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.itemRow, { borderColor: colors.border, backgroundColor: colors.background }]}
                                    onPress={() => setEditingField('amount')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.itemText, { color: isIncome ? colors.success : colors.textMain, fontWeight: '700' }]}>
                                        S/ {parseFloat(amountStr || '0').toFixed(2)}
                                    </Text>
                                    <Ionicons name="pencil-outline" size={18} color={accentColor} />
                                </TouchableOpacity>
                            )}

                            {/* 2. CATEGORÍA */}
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Categoría</Text>
                            {editingField === 'category' ? (
                                <View style={[styles.expandedEditBox, { borderColor: accentColor, backgroundColor: colors.background }]}>
                                    <View style={styles.chipsWrap}>
                                        {categoryOptions.map((option) => {
                                            const selected = categoryVal === option;
                                            return (
                                                <TouchableOpacity
                                                    key={option}
                                                    style={[
                                                        styles.optionChip,
                                                        {
                                                            borderColor: selected ? accentColor : colors.border,
                                                            backgroundColor: selected ? accentColor : colors.surface,
                                                        },
                                                    ]}
                                                    onPress={async () => {
                                                        setCategoryVal(option);
                                                        await onSave(transaction.id, { category: option });
                                                        setEditingField(null);
                                                    }}
                                                >
                                                    <Text style={[styles.optionChipText, { color: selected ? '#FFFFFF' : colors.textMain }]}>
                                                        {option}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                    <View style={styles.inlineInputRow}>
                                        <TextInput
                                            style={[styles.editInput, { color: colors.textMain, borderBottomWidth: 1, borderBottomColor: colors.border }]}
                                            value={categoryVal}
                                            onChangeText={setCategoryVal}
                                            placeholder="Escribir categoría..."
                                            placeholderTextColor="#9CA3AF"
                                            returnKeyType="done"
                                            onSubmitEditing={() => saveSingleField('category')}
                                        />
                                        <View style={styles.itemActions}>
                                            <TouchableOpacity
                                                style={[styles.actionIconBtn, { backgroundColor: accentColor }]}
                                                onPress={() => saveSingleField('category')}
                                            >
                                                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionIconBtn, { backgroundColor: '#9CA3AF' }]}
                                                onPress={() => cancelFieldEdit('category')}
                                            >
                                                <Ionicons name="close" size={18} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.itemRow, { borderColor: colors.border, backgroundColor: colors.background }]}
                                    onPress={() => setEditingField('category')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.itemText, { color: colors.textMain }]}>
                                        {categoryVal}
                                    </Text>
                                    <Ionicons name="pencil-outline" size={18} color={accentColor} />
                                </TouchableOpacity>
                            )}

                            {/* 3. FUENTE / MEDIO DE PAGO */}
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fuente / Medio de pago</Text>
                            {editingField === 'source' ? (
                                <View style={[styles.expandedEditBox, { borderColor: accentColor, backgroundColor: colors.background }]}>
                                    <View style={styles.chipsWrap}>
                                        {sources.map((option) => {
                                            const selected = sourceVal === option;
                                            return (
                                                <TouchableOpacity
                                                    key={option}
                                                    style={[
                                                        styles.optionChip,
                                                        {
                                                            borderColor: selected ? accentColor : colors.border,
                                                            backgroundColor: selected ? accentColor : colors.surface,
                                                        },
                                                    ]}
                                                    onPress={async () => {
                                                        setSourceVal(option);
                                                        await onSave(transaction.id, { source: option });
                                                        setEditingField(null);
                                                    }}
                                                >
                                                    <Text style={[styles.optionChipText, { color: selected ? '#FFFFFF' : colors.textMain }]}>
                                                        {option}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                    <View style={styles.inlineInputRow}>
                                        <TextInput
                                            style={[styles.editInput, { color: colors.textMain, borderBottomWidth: 1, borderBottomColor: colors.border }]}
                                            value={sourceVal}
                                            onChangeText={setSourceVal}
                                            placeholder="Escribir fuente o medio de pago..."
                                            placeholderTextColor="#9CA3AF"
                                            returnKeyType="done"
                                            onSubmitEditing={() => saveSingleField('source')}
                                        />
                                        <View style={styles.itemActions}>
                                            <TouchableOpacity
                                                style={[styles.actionIconBtn, { backgroundColor: accentColor }]}
                                                onPress={() => saveSingleField('source')}
                                            >
                                                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionIconBtn, { backgroundColor: '#9CA3AF' }]}
                                                onPress={() => cancelFieldEdit('source')}
                                            >
                                                <Ionicons name="close" size={18} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.itemRow, { borderColor: colors.border, backgroundColor: colors.background }]}
                                    onPress={() => setEditingField('source')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.itemText, { color: colors.textMain }]}>
                                        {transaction.source || sourceVal || '—'}
                                    </Text>
                                    <Ionicons name="pencil-outline" size={18} color={accentColor} />
                                </TouchableOpacity>
                            )}

                            {/* 4. FECHA Y HORA */}
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fecha y Hora</Text>
                            {editingField === 'datetime' ? (
                                <View style={[styles.expandedEditBox, { borderColor: accentColor, backgroundColor: colors.background }]}>
                                    <View style={styles.dateTimeInputsContainer}>
                                        <View style={styles.dateGroup}>
                                            <View style={styles.dateFieldBox}>
                                                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Día</Text>
                                                <TextInput
                                                    style={[styles.dateInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.surface }]}
                                                    value={dayStr}
                                                    onChangeText={setDayStr}
                                                    keyboardType="number-pad"
                                                    maxLength={2}
                                                    placeholder="DD"
                                                />
                                            </View>
                                            <Text style={[styles.dateSep, { color: colors.textSecondary }]}>/</Text>
                                            <View style={styles.dateFieldBox}>
                                                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Mes</Text>
                                                <TextInput
                                                    style={[styles.dateInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.surface }]}
                                                    value={monthStr}
                                                    onChangeText={setMonthStr}
                                                    keyboardType="number-pad"
                                                    maxLength={2}
                                                    placeholder="MM"
                                                />
                                            </View>
                                            <Text style={[styles.dateSep, { color: colors.textSecondary }]}>/</Text>
                                            <View style={styles.dateFieldBox}>
                                                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Año</Text>
                                                <TextInput
                                                    style={[styles.yearInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.surface }]}
                                                    value={yearStr}
                                                    onChangeText={setYearStr}
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    placeholder="AAAA"
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.timeGroup}>
                                            <View style={styles.dateFieldBox}>
                                                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Hora</Text>
                                                <TextInput
                                                    style={[styles.dateInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.surface }]}
                                                    value={hourStr}
                                                    onChangeText={setHourStr}
                                                    keyboardType="number-pad"
                                                    maxLength={2}
                                                    placeholder="HH"
                                                />
                                            </View>
                                            <Text style={[styles.dateSep, { color: colors.textSecondary }]}>:</Text>
                                            <View style={styles.dateFieldBox}>
                                                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Min</Text>
                                                <TextInput
                                                    style={[styles.dateInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.surface }]}
                                                    value={minuteStr}
                                                    onChangeText={setMinuteStr}
                                                    keyboardType="number-pad"
                                                    maxLength={2}
                                                    placeholder="MM"
                                                />
                                            </View>

                                            <View style={[styles.itemActions, { marginLeft: 'auto', alignSelf: 'flex-end', marginBottom: 4 }]}>
                                                <TouchableOpacity
                                                    style={[styles.actionIconBtn, { backgroundColor: accentColor }]}
                                                    onPress={() => saveSingleField('datetime')}
                                                >
                                                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionIconBtn, { backgroundColor: '#9CA3AF' }]}
                                                    onPress={() => cancelFieldEdit('datetime')}
                                                >
                                                    <Ionicons name="close" size={18} color="#FFFFFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.itemRow, { borderColor: colors.border, backgroundColor: colors.background }]}
                                    onPress={() => setEditingField('datetime')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.itemText, { color: colors.textMain }]}>
                                        {formatDateTimeDisplay(timestampVal)}
                                    </Text>
                                    <Ionicons name="pencil-outline" size={18} color={accentColor} />
                                </TouchableOpacity>
                            )}

                            {/* 5. DESCRIPCIÓN */}
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Descripción</Text>
                            {editingField === 'description' ? (
                                <View style={[styles.itemRow, styles.itemRowEditing, { borderColor: accentColor, backgroundColor: colors.background }]}>
                                    <TextInput
                                        style={[styles.editInput, { color: colors.textMain }]}
                                        value={descVal}
                                        onChangeText={setDescVal}
                                        placeholder="Agregar descripción..."
                                        placeholderTextColor="#9CA3AF"
                                        autoFocus={true}
                                        returnKeyType="done"
                                        onSubmitEditing={() => saveSingleField('description')}
                                    />
                                    <View style={styles.itemActions}>
                                        <TouchableOpacity
                                            style={[styles.actionIconBtn, { backgroundColor: accentColor }]}
                                            onPress={() => saveSingleField('description')}
                                        >
                                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionIconBtn, { backgroundColor: '#9CA3AF' }]}
                                            onPress={() => cancelFieldEdit('description')}
                                        >
                                            <Ionicons name="close" size={18} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.itemRow, { borderColor: colors.border, backgroundColor: colors.background }]}
                                    onPress={() => setEditingField('description')}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.itemText,
                                            { color: descVal ? colors.textMain : colors.textSecondary, fontStyle: descVal ? 'normal' : 'italic' },
                                        ]}
                                    >
                                        {descVal || 'Sin descripción'}
                                    </Text>
                                    <Ionicons name="pencil-outline" size={18} color={accentColor} />
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        {/* Botones Guardar y Eliminar */}
                        <View style={styles.footerButtonsRow}>
                            <TouchableOpacity
                                style={[styles.deleteButton, { backgroundColor: '#EF4444' }]}
                                onPress={handleDeleteAndClose}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.saveButtonText}>Eliminar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: accentColor }]}
                                onPress={handleSaveAllAndClose}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        width: '90%',
        maxWidth: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 2,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },
    closeButton: {
        padding: 4,
        borderRadius: 16,
    },
    detailsScroll: {
        maxHeight: 380,
    },
    detailsContent: {
        paddingVertical: 4,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 6,
    },
    itemRowEditing: {
        paddingVertical: 6,
    },
    expandedEditBox: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginBottom: 6,
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    optionChip: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    optionChipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    inlineInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
    },
    currencyPrefix: {
        fontSize: 15,
        fontWeight: '600',
        marginRight: 6,
    },
    editInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 4,
        paddingHorizontal: 4,
        marginRight: 8,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionIconBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateTimeInputsContainer: {
        gap: 10,
    },
    dateGroup: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    timeGroup: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    dateFieldBox: {
        alignItems: 'center',
    },
    miniLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    dateInput: {
        borderWidth: 1,
        borderRadius: 8,
        width: 44,
        paddingVertical: 5,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
    yearInput: {
        borderWidth: 1,
        borderRadius: 8,
        width: 64,
        paddingVertical: 5,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
    dateSep: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        marginHorizontal: 2,
    },
    footerButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    deleteButton: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

