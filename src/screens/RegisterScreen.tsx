import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    useWindowDimensions,
    NativeSyntheticEvent,
    NativeScrollEvent
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { ManageItemsModal } from '../components/ManageItemsModal';

export const RegisterScreen: React.FC = () => {
    const { colors } = useTheme();
    const { width: windowWidth } = useWindowDimensions();

    // Dimensiones responsivas para que la tarjeta activa quede exactamente centrada
    // y la tarjeta contigua asome visiblemente por el borde (~38px) indicando su existencia.
    const CARD_WIDTH = Math.min(320, Math.round(windowWidth * 0.68));
    const CARD_SPACING = 12;
    const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
    const SIDE_SPACER = Math.max(0, (windowWidth - CARD_WIDTH) / 2);

    const scrollViewRef = useRef<any>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [activeIndex, setActiveIndex] = useState(0);

    const scrollToIndex = (index: number) => {
        scrollViewRef.current?.scrollTo({ x: index * SNAP_INTERVAL, animated: true });
        setActiveIndex(index);
    };

    const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset.x;
        const index = Math.round(offset / SNAP_INTERVAL);
        if ((index === 0 || index === 1) && index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    // Interpolaciones de escala y opacidad según el desplazamiento horizontal
    // La tarjeta centrada se muestra en escala completa (1.0) y la otra ligeramente más pequeña (0.90)
    const card0Scale = scrollX.interpolate({
        inputRange: [-SNAP_INTERVAL, 0, SNAP_INTERVAL],
        outputRange: [0.90, 1, 0.90],
        extrapolate: 'clamp',
    });

    const card0Opacity = scrollX.interpolate({
        inputRange: [-SNAP_INTERVAL, 0, SNAP_INTERVAL],
        outputRange: [0.78, 1, 0.78],
        extrapolate: 'clamp',
    });

    const card1Scale = scrollX.interpolate({
        inputRange: [0, SNAP_INTERVAL, SNAP_INTERVAL * 2],
        outputRange: [0.90, 1, 0.90],
        extrapolate: 'clamp',
    });

    const card1Opacity = scrollX.interpolate({
        inputRange: [0, SNAP_INTERVAL, SNAP_INTERVAL * 2],
        outputRange: [0.78, 1, 0.78],
        extrapolate: 'clamp',
    });

    const {
        addTransaction,
        categories,
        sources,
        origins,
        addCategory,
        updateCategory,
        deleteCategory,
        addSource,
        updateSource,
        deleteSource,
        addOrigin,
        updateOrigin,
        deleteOrigin,
    } = useFinance();

    // Ingresos State
    const [incomeAmount, setIncomeAmount] = useState('');
    const [incomeOrigin, setIncomeOrigin] = useState(origins[0] || 'Trabajo');
    const [incomeDesc, setIncomeDesc] = useState('');
    const [isIncomeOriginExpanded, setIsIncomeOriginExpanded] = useState(false);

    // Gastos State
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState(categories[0] || 'Comida');
    const [expenseSource, setExpenseSource] = useState(sources[0] || 'Débito');
    const [expenseDesc, setExpenseDesc] = useState('');
    const [isExpenseCategoryExpanded, setIsExpenseCategoryExpanded] = useState(false);
    const [isExpenseSourceExpanded, setIsExpenseSourceExpanded] = useState(false);

    // Modal State
    const [modalType, setModalType] = useState<'origin' | 'category' | 'source' | null>(null);

    // Mantener los valores seleccionados válidos si se eliminan u omiten elementos
    useEffect(() => {
        if (origins.length > 0 && !origins.includes(incomeOrigin)) {
            setIncomeOrigin(origins[0]);
        }
    }, [origins, incomeOrigin]);

    useEffect(() => {
        if (categories.length > 0 && !categories.includes(expenseCategory)) {
            setExpenseCategory(categories[0]);
        }
    }, [categories, expenseCategory]);

    useEffect(() => {
        if (sources.length > 0 && !sources.includes(expenseSource)) {
            setExpenseSource(sources[0]);
        }
    }, [sources, expenseSource]);

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

                {/* Carrusel de Tarjetas Centrado */}
                <View style={styles.carouselWrapper}>
                    <Animated.ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={SNAP_INTERVAL}
                        snapToOffsets={[0, SNAP_INTERVAL]}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        disableIntervalMomentum={true}
                        bounces={false}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}
                        onMomentumScrollEnd={handleScrollEnd}
                        onScrollEndDrag={handleScrollEnd}
                        contentContainerStyle={[
                            styles.carouselContent,
                            { paddingHorizontal: SIDE_SPACER }
                        ]}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Slide 1: Tarjeta Gasto */}
                        <View style={[styles.cardSlide, { width: CARD_WIDTH, marginRight: CARD_SPACING }]}>
                            <Animated.View
                                style={[
                                    styles.card,
                                    {
                                        borderColor: colors.primary,
                                        backgroundColor: colors.surface,
                                        transform: [{ scale: card0Scale }],
                                        opacity: card0Opacity,
                                    }
                                ]}
                            >
                                <Text style={[styles.title, { color: colors.primary }]}>Registrar Gasto</Text>

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
                                                    {categories.map(c => (
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
                                                    {sources.map(s => (
                                                        <TouchableOpacity key={s} style={styles.accordionItem} onPress={() => { setExpenseSource(s); setIsExpenseSourceExpanded(false); }}>
                                                            <Text style={[styles.chipText, expenseSource === s && { color: colors.primary, fontWeight: 'bold' }]}>{s}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.addButtom}>
                                    <View style={{ flex: 1, marginRight: 4, alignItems: 'flex-start' }}>
                                        <TouchableOpacity onPress={() => setModalType('category')}>
                                            <Text style={[styles.chipText, { color: colors.primary, fontWeight: '600' }]}>Editar categorías</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 4, alignItems: 'flex-start' }}>
                                        <TouchableOpacity onPress={() => setModalType('source')}>
                                            <Text style={[styles.chipText, { color: colors.primary, fontWeight: '600' }]}>Editar fuentes</Text>
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

                                {/* Capa táctil cuando la tarjeta está inactiva para centrarla al tocarla */}
                                {activeIndex !== 0 && (
                                    <TouchableOpacity
                                        style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                                        activeOpacity={0.8}
                                        onPress={() => scrollToIndex(0)}
                                    />
                                )}
                            </Animated.View>
                        </View>

                        {/* Slide 2: Tarjeta Ingreso */}
                        <View style={[styles.cardSlide, { width: CARD_WIDTH }]}>
                            <Animated.View
                                style={[
                                    styles.card,
                                    {
                                        borderColor: colors.success,
                                        backgroundColor: colors.surface,
                                        transform: [{ scale: card1Scale }],
                                        opacity: card1Opacity,
                                    }
                                ]}
                            >
                                <Text style={[styles.title, { color: colors.success }]}>Registrar Ingreso</Text>

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
                                            {origins.map(o => (
                                                <TouchableOpacity key={o} style={styles.accordionItem} onPress={() => { setIncomeOrigin(o); setIsIncomeOriginExpanded(false); }}>
                                                    <Text style={[styles.chipText, incomeOrigin === o && { color: colors.success, fontWeight: 'bold' }]}>{o}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}
                                </TouchableOpacity>
                                <View style={styles.addButtom}>
                                    <View style={{ alignItems: 'flex-end', flex: 1 }}>
                                        <TouchableOpacity onPress={() => setModalType('origin')}>
                                            <Text style={[styles.chipText, { color: colors.success, fontWeight: '600' }]}>Editar orígenes</Text>
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

                                {/* Capa táctil cuando la tarjeta está inactiva para centrarla al tocarla */}
                                {activeIndex !== 1 && (
                                    <TouchableOpacity
                                        style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                                        activeOpacity={0.8}
                                        onPress={() => scrollToIndex(1)}
                                    />
                                )}
                            </Animated.View>
                        </View>
                    </Animated.ScrollView>
                </View>

                {/* Modal para Editar/Agregar/Eliminar Orígenes de Ingreso */}
                <ManageItemsModal
                    visible={modalType === 'origin'}
                    onClose={() => setModalType(null)}
                    title="Gestionar Orígenes"
                    itemTypeLabel="origen"
                    items={origins}
                    accentColor={colors.success}
                    onAddItem={addOrigin}
                    onEditItem={async (oldName, newName) => {
                        await updateOrigin(oldName, newName);
                        if (incomeOrigin === oldName) setIncomeOrigin(newName);
                    }}
                    onDeleteItem={async (name) => {
                        await deleteOrigin(name);
                        if (incomeOrigin === name) {
                            const remaining = origins.filter(o => o !== name);
                            if (remaining.length > 0) setIncomeOrigin(remaining[0]);
                        }
                    }}
                />

                {/* Modal para Editar/Agregar/Eliminar Categorías de Gasto */}
                <ManageItemsModal
                    visible={modalType === 'category'}
                    onClose={() => setModalType(null)}
                    title="Gestionar Categorías"
                    itemTypeLabel="categoría"
                    items={categories}
                    accentColor={colors.primary}
                    onAddItem={addCategory}
                    onEditItem={async (oldName, newName) => {
                        await updateCategory(oldName, newName);
                        if (expenseCategory === oldName) setExpenseCategory(newName);
                    }}
                    onDeleteItem={async (name) => {
                        await deleteCategory(name);
                        if (expenseCategory === name) {
                            const remaining = categories.filter(c => c !== name);
                            if (remaining.length > 0) setExpenseCategory(remaining[0]);
                        }
                    }}
                />

                {/* Modal para Editar/Agregar/Eliminar Fuentes de Pago */}
                <ManageItemsModal
                    visible={modalType === 'source'}
                    onClose={() => setModalType(null)}
                    title="Gestionar Fuentes de Pago"
                    itemTypeLabel="fuente"
                    items={sources}
                    accentColor={colors.primary}
                    onAddItem={addSource}
                    onEditItem={async (oldName, newName) => {
                        await updateSource(oldName, newName);
                        if (expenseSource === oldName) setExpenseSource(newName);
                    }}
                    onDeleteItem={async (name) => {
                        await deleteSource(name);
                        if (expenseSource === name) {
                            const remaining = sources.filter(s => s !== name);
                            if (remaining.length > 0) setExpenseSource(remaining[0]);
                        }
                    }}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    addButtom: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 8,
    },
    container: {
        flex: 1,
        paddingTop: 60,
        justifyContent: 'center',
    },
    carouselWrapper: {
        width: '100%',
        justifyContent: 'center',
    },
    carouselContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    cardSlide: {
        justifyContent: 'center',
    },
    card: {
        borderRadius: 16,
        borderWidth: 2,
        padding: 16,
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