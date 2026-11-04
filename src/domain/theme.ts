export interface ThemeColors {
    background: string;
    surface: string;
    primary: string;
    success: string;
    fail: string;
    textMain: string;
    textSecondary: string;
    border: string;
}

export interface IThemeStrategy {
    getColors(): ThemeColors;
}

export class LightThemeStrategy implements IThemeStrategy {
    getColors(): ThemeColors {
        return {
            background: '#F8F9FA',
            surface: '#FFFFFF',
            primary: '#5C5AE8', // Morado Haba
            success: '#10B981', // Verde Menta
            fail: '#E9040D', // Rojo
            textMain: '#1F2937',
            textSecondary: '#6B7280',
            border: '#E5E7EB',
        };
    }
}

export class DarkThemeStrategy implements IThemeStrategy {
    getColors(): ThemeColors {
        return {
            background: '#111827',
            surface: '#1F2937',
            primary: '#8B5CF6',
            success: '#34D399',
            fail: '#E9040D',
            textMain: '#F9FAFB',
            textSecondary: '#9CA3AF',
            border: '#374151',
        };
    }
}