// src/components/BarChart.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
    data: Record<string, number>;
}

export const BarChart: React.FC<Props> = ({ data }) => {
    const { colors } = useTheme();
    const maxVal = Math.max(...Object.values(data), 1);

    // Generar últimos 7 días con datos
    const days = Object.keys(data).slice(-7);

    return (
        <View style={styles.container}>
            <View style={styles.chartArea}>
                {days.map(day => {
                    const heightPercent = (data[day] / maxVal) * 100;
                    return (
                        <View key={day} style={styles.barContainer}>
                            <View style={[styles.bar, { height: `${heightPercent}%`, backgroundColor: colors.primary }]} />
                            <Text style={[styles.label, { color: colors.textSecondary }]}>{day}</Text>
                        </View>
                    );
                })}
                {days.length === 0 && <Text style={{ color: colors.textSecondary, alignSelf: 'center' }}>Sin gastos aún</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 200,
        marginTop: 16,
    },
    chartArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
    },
    barContainer: {
        alignItems: 'center',
        width: 30,
        height: '100%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: 24,
        borderRadius: 6,
        minHeight: 4,
    },
    label: {
        fontSize: 10,
        marginTop: 8,
    }
});