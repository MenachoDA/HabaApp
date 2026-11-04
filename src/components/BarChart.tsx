// src/components/BarChart.tsx
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
    data: Record<string, number>;
}

const VISIBLE_DAYS = 7;

export const BarChart: React.FC<Props> = ({ data }) => {
    const { colors } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);
    const [chartWidth, setChartWidth] = useState<number>(Dimensions.get('window').width - 72);

    const maxVal = Math.max(...Object.values(data), 1);

    // Todos los días que tengan registros
    const days = Object.keys(data);

    const formatAmount = (val: number): string => {
        // Máximo 2 decimales
        return Number(val.toFixed(2)).toString();
    };

    const barWidth = days.length > VISIBLE_DAYS && chartWidth > 0
        ? chartWidth / VISIBLE_DAYS
        : 38;

    return (
        <View
            style={styles.container}
            onLayout={e => setChartWidth(e.nativeEvent.layout.width)}
        >
            <View style={[styles.chartArea, { borderBottomColor: colors.border }]}>
                {days.length > 0 ? (
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={days.length > VISIBLE_DAYS}
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            days.length <= VISIBLE_DAYS && styles.scrollContentFill,
                        ]}
                        onContentSizeChange={() => {
                            scrollViewRef.current?.scrollToEnd({ animated: false });
                        }}
                        onLayout={() => {
                            scrollViewRef.current?.scrollToEnd({ animated: false });
                        }}
                    >
                        {days.map(day => {
                            const amount = data[day] || 0;
                            const heightPercent = maxVal > 0 ? (amount / maxVal) * 80 : 0;
                            return (
                                <View key={day} style={[styles.barContainer, { width: barWidth }]}>
                                    <View style={styles.barWrapper}>
                                        <Text
                                            style={[styles.valueText, { color: colors.textSecondary }]}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {formatAmount(amount)}
                                        </Text>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: `${heightPercent}%`,
                                                    backgroundColor: colors.primary,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>{day}</Text>
                                </View>
                            );
                        })}
                    </ScrollView>
                ) : (
                    <Text style={{ color: colors.textSecondary, alignSelf: 'center' }}>Sin gastos aún</Text>
                )}
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
        paddingBottom: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        height: '100%',
        alignItems: 'flex-end',
    },
    scrollContentFill: {
        flexGrow: 1,
        justifyContent: 'space-around',
    },
    barContainer: {
        alignItems: 'center',
        width: 38,
        height: '100%',
        justifyContent: 'flex-end',
    },
    barWrapper: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: 22,
        borderRadius: 6,
        minHeight: 4,
    },
    valueText: {
        fontSize: 9,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    label: {
        fontSize: 10,
        marginTop: 8,
    }
});