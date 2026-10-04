import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface Props {
    data: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Comida': '#8B94F7',
    'Servicios': '#A78BFA',
    'Movilidad': '#F472B6',
    'Otros': '#60A5FA',
    'Carro': '#34D399',
    'Regalos': '#FBBF24',
};

export const DonutChart: React.FC<Props> = ({ data }) => {
    const { colors } = useTheme();
    const size = 200;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const total = Object.values(data).reduce((a, b) => a + b, 0);

    let currentOffset = 0;

    if (total === 0) {
        return (
            <View style={[styles.emptyContainer, { width: size, height: size }]}>
                <Text style={{ color: colors.textSecondary }}>Sin datos</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    {Object.entries(data).map(([key, value]) => {
                        const percentage = value / total;
                        const strokeDashoffset = circumference - (percentage * circumference);
                        const offset = currentOffset;
                        currentOffset += percentage * circumference;

                        return (
                            <Circle
                                key={key}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={CATEGORY_COLORS[key] || '#CBD5E1'}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="butt"
                                origin={`${size / 2}, ${size / 2}`}
                                rotation={(offset / circumference) * 360}
                                fill="transparent"
                            />
                        );
                    })}
                </G>
            </Svg>
            <View style={styles.legend}>
                {Object.keys(data).map(key => (
                    <View key={key} style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[key] || '#CBD5E1' }]} />
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{key}</Text>
                    </View>
                ))}
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
        marginLeft: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    }
});