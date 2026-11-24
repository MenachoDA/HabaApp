import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface Props {
    data: Record<string, number>;
    selectedCategory?: string | null;
    onSelectCategory?: (category: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Comida': '#8B94F7',
    'Servicios': '#A78BFA',
    'Movilidad': '#F472B6',
    'Otros': '#60A5FA',
    'Carro': '#34D399',
    'Regalos': '#FBBF24',
};

const FALLBACK_COLORS = [
    '#38BDF8',
    '#FB923C',
    '#A3E635',
    '#E879F9',
    '#2DD4BF',
    '#F87171',
];

const getCategoryColor = (category: string, index: number): string => {
    return CATEGORY_COLORS[category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length] || '#CBD5E1';
};

const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: cx + radius * Math.cos(angleInRadians),
        y: cy + radius * Math.sin(angleInRadians),
    };
};

const createDonutSlicePath = (
    cx: number,
    cy: number,
    rInner: number,
    rOuter: number,
    startAngle: number,
    endAngle: number
): string => {
    const clampedSweep = Math.min(endAngle - startAngle, 359.999);
    const actualEndAngle = startAngle + clampedSweep;

    const outerStart = polarToCartesian(cx, cy, rOuter, startAngle);
    const outerEnd = polarToCartesian(cx, cy, rOuter, actualEndAngle);
    const innerEnd = polarToCartesian(cx, cy, rInner, actualEndAngle);
    const innerStart = polarToCartesian(cx, cy, rInner, startAngle);

    const largeArcFlag = clampedSweep > 180 ? 1 : 0;

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
        'Z',
    ].join(' ');
};

export const DonutChart: React.FC<Props> = ({
    data,
    selectedCategory = null,
    onSelectCategory,
}) => {
    const { colors } = useTheme();
    const size = 200;
    const strokeWidth = 30;
    const center = size / 2;
    const rOuter = size / 2 - 4;
    const rInner = rOuter - strokeWidth;

    const lastPressTimestampRef = useRef<number>(0);
    const touchStartRef = useRef<{ pageX: number; pageY: number } | null>(null);

    const entries = Object.entries(data).filter(([, value]) => value > 0);
    const total = entries.reduce((acc, [, val]) => acc + val, 0);

    if (total === 0) {
        return (
            <View style={[styles.emptyContainer, { width: size, height: size }]}>
                <Text style={{ color: colors.textSecondary }}>Sin datos</Text>
            </View>
        );
    }

    let currentAngle = 0;
    const slices = entries.map(([key, value], index) => {
        const percentage = value / total;
        const sweepAngle = percentage * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sweepAngle;
        currentAngle = endAngle;

        return {
            key,
            value,
            percentage,
            startAngle,
            endAngle,
            color: getCategoryColor(key, index),
        };
    });

    const triggerCategorySelect = (category: string) => {
        const now = Date.now();
        if (now - lastPressTimestampRef.current < 250) {
            return;
        }
        lastPressTimestampRef.current = now;
        onSelectCategory?.(category);
    };

    const handleChartTouchStart = (e: GestureResponderEvent) => {
        const { pageX, pageY } = e.nativeEvent;
        touchStartRef.current = { pageX, pageY };
    };

    const handleChartTouchEnd = (e: GestureResponderEvent) => {
        if (!onSelectCategory) return;
        const { locationX, locationY, pageX, pageY } = e.nativeEvent;

        if (touchStartRef.current) {
            const movedDistance = Math.hypot(
                pageX - touchStartRef.current.pageX,
                pageY - touchStartRef.current.pageY
            );
            if (movedDistance > 10) {
                return;
            }
        }

        const dx = locationX - center;
        const dy = locationY - center;
        const dist = Math.hypot(dx, dy);

        if (dist < rInner - 10 || dist > rOuter + 10) {
            return;
        }

        let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        if (angleDeg < 0) {
            angleDeg += 360;
        }

        const matchedSlice = slices.find(
            s => angleDeg >= s.startAngle && angleDeg <= s.endAngle
        );

        if (matchedSlice) {
            triggerCategorySelect(matchedSlice.key);
        }
    };

    return (
        <View style={styles.container}>
            <View
                style={{ width: size, height: size }}
                onTouchStart={handleChartTouchStart}
                onTouchEnd={handleChartTouchEnd}
            >
                <Svg width={size} height={size}>
                    <G>
                        {slices.map(slice => {
                            const isSelected = selectedCategory === slice.key;
                            const isDimmed = selectedCategory !== null && !isSelected;
                            const sliceOuterRadius = isSelected ? rOuter + 4 : rOuter;
                            const pathData = createDonutSlicePath(
                                center,
                                center,
                                rInner,
                                sliceOuterRadius,
                                slice.startAngle,
                                slice.endAngle
                            );

                            return (
                                <Path
                                    key={slice.key}
                                    d={pathData}
                                    fill={slice.color}
                                    fillOpacity={isDimmed ? 0.35 : 1}
                                    onPress={() => triggerCategorySelect(slice.key)}
                                />
                            );
                        })}
                    </G>
                </Svg>
            </View>

            <View style={styles.legend}>
                {slices.map(slice => {
                    const isSelected = selectedCategory === slice.key;
                    const isDimmed = selectedCategory !== null && !isSelected;

                    return (
                        <TouchableOpacity
                            key={slice.key}
                            style={[
                                styles.legendItem,
                                isSelected && [
                                    styles.legendItemSelected,
                                    { backgroundColor: slice.color + '20', borderColor: slice.color },
                                ],
                                isDimmed && styles.legendItemDimmed,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => onSelectCategory?.(slice.key)}
                        >
                            <View style={[styles.dot, { backgroundColor: slice.color }]} />
                            <Text
                                style={[
                                    styles.legendText,
                                    { color: isSelected ? colors.textMain : colors.textSecondary },
                                    isSelected && styles.legendTextSelected,
                                ]}
                            >
                                {slice.key}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 100,
    },
    legend: {
        marginLeft: 16,
        flex: 1,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        marginBottom: 4,
    },
    legendItemSelected: {
        borderWidth: 1,
    },
    legendItemDimmed: {
        opacity: 0.45,
    },
    legendText: {
        fontSize: 12,
    },
    legendTextSelected: {
        fontWeight: 'bold',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
});