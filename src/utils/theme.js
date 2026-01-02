// Theme colors configuration - Modern, high-contrast, premium palettes
export const themes = {
    titanium: {
        name: 'Titanová',
        primary: '#4b5563', // gray-600
        primaryDark: '#1f2937', // gray-800
        primaryLight: '#9ca3af', // gray-400
        gradient: 'from-gray-600 to-slate-800'
    },
    blue: {
        name: 'Modrá',
        primary: '#3b82f6', // blue-500
        primaryDark: '#2563eb', // blue-600
        primaryLight: '#60a5fa', // blue-400
        gradient: 'from-blue-600 to-indigo-700'
    },
    ocean: {
        name: 'Oceán',
        primary: '#0ea5e9', // sky-500
        primaryDark: '#0369a1', // sky-700
        primaryLight: '#7dd3fc', // sky-300
        gradient: 'from-sky-600 to-indigo-600'
    },
    emerald: {
        name: 'Smaragd',
        primary: '#10b981', // emerald-500
        primaryDark: '#065f46', // emerald-800
        primaryLight: '#6ee7b7', // emerald-300
        gradient: 'from-emerald-600 to-teal-700'
    },
    sunset: {
        name: 'Západ slunce',
        primary: '#f43f5e', // rose-500
        primaryDark: '#9f1239', // rose-900
        primaryLight: '#fb7185', // rose-400
        gradient: 'from-rose-600 to-orange-500'
    },
    purple: {
        name: 'Magická',
        primary: '#8b5cf6', // violet-500
        primaryDark: '#5b21b6', // violet-800
        primaryLight: '#c4b5fd', // violet-300
        gradient: 'from-violet-600 to-fuchsia-700'
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
