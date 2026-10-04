import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface Props {
    onPress: () => void;
    isActive: boolean;
}

export const BearButton: React.FC<Props> = ({ onPress, isActive }) => {
    const { colors } = useTheme();

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(isActive ? 1.1 : 1) }],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <TouchableOpacity
                style={[styles.button, { borderColor: colors.primary, backgroundColor: colors.surface }]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Text style={styles.icon}>🐻</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        zIndex: 100,
    },
    button: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    icon: {
        fontSize: 28,
    }
});