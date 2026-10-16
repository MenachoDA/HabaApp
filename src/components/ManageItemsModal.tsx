import React, { useState } from 'react';
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

interface ManageItemsModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    itemTypeLabel: string; // e.g. "origen", "categoría", "fuente"
    items: string[];
    accentColor: string;
    onAddItem: (name: string) => Promise<void> | void;
    onEditItem: (oldName: string, newName: string) => Promise<void> | void;
    onDeleteItem: (name: string) => Promise<void> | void;
}

export const ManageItemsModal: React.FC<ManageItemsModalProps> = ({
    visible,
    onClose,
    title,
    itemTypeLabel,
    items,
    accentColor,
    onAddItem,
    onEditItem,
    onDeleteItem,
}) => {
    const { colors } = useTheme();

    // Add state
    const [newItemName, setNewItemName] = useState('');

    // Inline edit state
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editedName, setEditedName] = useState('');

    const handleAdd = async () => {
        const trimmed = newItemName.trim();
        if (!trimmed) {
            Alert.alert('Aviso', `Ingresa un nombre para el nuevo ${itemTypeLabel}.`);
            return;
        }

        const exists = items.some(i => i.trim().toLowerCase() === trimmed.toLowerCase());
        if (exists) {
            Alert.alert('Aviso', `Ya existe un ${itemTypeLabel} con ese nombre.`);
            return;
        }

        await onAddItem(trimmed);
        setNewItemName('');
    };

    const startEditing = (item: string) => {
        setEditingItem(item);
        setEditedName(item);
    };

    const cancelEditing = () => {
        setEditingItem(null);
        setEditedName('');
    };

    const saveEditing = async (oldItem: string) => {
        const trimmed = editedName.trim();
        if (!trimmed) {
            Alert.alert('Aviso', 'El nombre no puede quedar vacío.');
            return;
        }

        if (trimmed.toLowerCase() === oldItem.toLowerCase()) {
            // No changes or just casing
            if (trimmed !== oldItem) {
                await onEditItem(oldItem, trimmed);
            }
            setEditingItem(null);
            setEditedName('');
            return;
        }

        const exists = items.some(i => i.trim().toLowerCase() === trimmed.toLowerCase());
        if (exists) {
            Alert.alert('Aviso', `Ya existe un ${itemTypeLabel} con ese nombre.`);
            return;
        }

        await onEditItem(oldItem, trimmed);
        setEditingItem(null);
        setEditedName('');
    };

    const handleDelete = (item: string) => {
        if (items.length <= 1) {
            Alert.alert('Aviso', `Debes mantener al menos un ${itemTypeLabel}.`);
            return;
        }

        Alert.alert(
            'Eliminar',
            `¿Seguro que deseas eliminar "${item}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        if (editingItem === item) {
                            cancelEditing();
                        }
                        await onDeleteItem(item);
                    },
                },
            ]
        );
    };

    const handleClose = () => {
        setNewItemName('');
        setEditingItem(null);
        setEditedName('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                {/* Blur Background covering the entire screen */}
                <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />

                {/* Dark dimming backdrop */}
                <TouchableOpacity
                    style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
                    activeOpacity={1}
                    onPress={handleClose}
                />

                {/* Centered Modal Card */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.centerContainer}
                >
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: accentColor }]}>
                        {/* Header: Title & Close ('X') Button in the top right */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Add Item Section */}
                        <View style={styles.addSection}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        borderColor: colors.border,
                                        color: colors.textMain,
                                        backgroundColor: colors.background,
                                    },
                                ]}
                                placeholder={`Nuevo ${itemTypeLabel}...`}
                                placeholderTextColor="#9CA3AF"
                                value={newItemName}
                                onChangeText={setNewItemName}
                                onSubmitEditing={handleAdd}
                                returnKeyType="done"
                            />
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: accentColor }]}
                                onPress={handleAdd}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={20} color="#FFFFFF" />
                                <Text style={styles.addButtonText}>Agregar</Text>
                            </TouchableOpacity>
                        </View>

                        {/* List of existing items */}
                        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                            Lista de {itemTypeLabel}s actuales:
                        </Text>

                        <ScrollView
                            style={styles.itemsScroll}
                            contentContainerStyle={styles.itemsContent}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                        >
                            {items.map((item) => {
                                const isEditing = editingItem === item;

                                if (isEditing) {
                                    return (
                                        <View
                                            key={item}
                                            style={[
                                                styles.itemRow,
                                                styles.itemRowEditing,
                                                { borderColor: accentColor, backgroundColor: colors.background },
                                            ]}
                                        >
                                            <TextInput
                                                style={[
                                                    styles.editInput,
                                                    { color: colors.textMain },
                                                ]}
                                                value={editedName}
                                                onChangeText={setEditedName}
                                                autoFocus={true}
                                                returnKeyType="done"
                                                onSubmitEditing={() => saveEditing(item)}
                                            />
                                            <View style={styles.itemActions}>
                                                <TouchableOpacity
                                                    style={[styles.actionIconBtn, { backgroundColor: accentColor }]}
                                                    onPress={() => saveEditing(item)}
                                                >
                                                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionIconBtn, { backgroundColor: '#9CA3AF' }]}
                                                    onPress={cancelEditing}
                                                >
                                                    <Ionicons name="close" size={18} color="#FFFFFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                }

                                return (
                                    <View
                                        key={item}
                                        style={[
                                            styles.itemRow,
                                            { borderColor: colors.border, backgroundColor: colors.background },
                                        ]}
                                    >
                                        <Text
                                            style={[styles.itemText, { color: colors.textMain }]}
                                            numberOfLines={1}
                                        >
                                            {item}
                                        </Text>
                                        <View style={styles.itemActions}>
                                            <TouchableOpacity
                                                style={styles.iconButton}
                                                onPress={() => startEditing(item)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <Ionicons name="pencil-outline" size={18} color={accentColor} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.iconButton}
                                                onPress={() => handleDelete(item)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
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
        marginBottom: 16,
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
    addSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        fontSize: 14,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 13,
    },
    sectionSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemsScroll: {
        maxHeight: 220,
    },
    itemsContent: {
        paddingVertical: 2,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    itemRowEditing: {
        paddingVertical: 6,
    },
    itemText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
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
    iconButton: {
        padding: 4,
    },
    actionIconBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
