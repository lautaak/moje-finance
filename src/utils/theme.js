// Theme colors configuration - Modern, high-contrast, premium palettes
export const themes = {
    steel: {
        name: 'Ocelová',
        primary: '#64748b', // slate-500
        primaryDark: '#334155', // slate-700
        primaryLight: '#cbd5e1', // slate-200
        gradient: 'from-slate-500 to-slate-700'
    },
    turquoise: {
        name: 'Tyrkysová',
        primary: '#14b8a6', // teal-500
        primaryDark: '#0d9488', // teal-600
        primaryLight: '#99f6e4', // teal-200
        gradient: 'from-teal-400 to-teal-600'
    },
    rose: {
        name: 'Starorůžová',
        primary: '#b8747d', // dusty rose
        primaryDark: '#8c525a', // deep dusty rose
        primaryLight: '#e5c1c5', // soft dusty rose
        gradient: 'from-[#b8747d] to-[#8c525a]'
    },
    sage: {
        name: 'Šalvějová',
        primary: '#8da491', // sage green
        primaryDark: '#5f7463', // deep sage
        primaryLight: '#cedbd0', // soft sage
        gradient: 'from-[#8da491] to-[#5f7463]'
    },
    blue: {
        name: 'Klasická',
        primary: '#3b82f6', // blue-500
        primaryDark: '#2563eb', // blue-600
        primaryLight: '#60a5fa', // blue-400
        gradient: 'from-blue-500 to-indigo-600'
    }
};

export function getTheme() {
    return localStorage.getItem('theme') || 'blue';
}

export function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    applyTheme(themeName);
}

export function applyTheme(themeName) {
    const theme = themes[themeName] || themes.blue;
    const root = document.documentElement;

    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-dark', theme.primaryDark);
    root.style.setProperty('--color-primary-light', theme.primaryLight);

    // Store gradient class name for Tailwind
    root.setAttribute('data-gradient', theme.gradient);
}
