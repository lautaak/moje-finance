// Theme colors configuration
export const themes = {
    blue: {
        name: 'Modrá',
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        primaryLight: '#60a5fa',
        gradient: 'from-blue-600 to-indigo-700'
    },
    green: {
        name: 'Zelená',
        primary: '#10b981',
        primaryDark: '#059669',
        primaryLight: '#34d399',
        gradient: 'from-green-600 to-emerald-700'
    },
    purple: {
        name: 'Fialová',
        primary: '#8b5cf6',
        primaryDark: '#7c3aed',
        primaryLight: '#a78bfa',
        gradient: 'from-purple-600 to-violet-700'
    },
    orange: {
        name: 'Oranžová',
        primary: '#f97316',
        primaryDark: '#ea580c',
        primaryLight: '#fb923c',
        gradient: 'from-orange-600 to-amber-700'
    },
    pink: {
        name: 'Růžová',
        primary: '#ec4899',
        primaryDark: '#db2777',
        primaryLight: '#f472b6',
        gradient: 'from-pink-600 to-rose-700'
    },
    teal: {
        name: 'Tyrkysová',
        primary: '#14b8a6',
        primaryDark: '#0d9488',
        primaryLight: '#2dd4bf',
        gradient: 'from-teal-600 to-cyan-700'
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
