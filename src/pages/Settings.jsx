import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Download, Upload, Trash2, Save, FileJson, Palette } from 'lucide-react';
import CategorySettings from '../components/CategorySettings';
import { themes, getTheme, setTheme } from '../utils/theme';

export default function SettingsPage() {
    const [message, setMessage] = useState('');
    const [currentTheme, setCurrentTheme] = useState(getTheme());

    const handleThemeChange = (themeName) => {
        setTheme(themeName);
        setCurrentTheme(themeName);
        setMessage(`Téma změněno na ${themes[themeName].name}`);
        setTimeout(() => setMessage(''), 2000);
    };

    const handleExport = async () => {
        try {
            const data = {
                transactions: await db.transactions.toArray(),
                categories: await db.categories.toArray(),
                accounts: await db.accounts.toArray(),
                exportedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setMessage('Záloha stažena!');
        } catch (err) {
            console.error(err);
            setMessage('Chyba při exportu.');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.transactions) await db.transactions.bulkPut(data.transactions);
                if (data.categories) await db.categories.bulkPut(data.categories);
                if (data.accounts) await db.accounts.bulkPut(data.accounts);
                setMessage('Data úspěšně obnovena!');
                setTimeout(() => window.location.reload(), 1000);
            } catch (err) {
                console.error(err);
                setMessage('Chyba při importu: Neplatný soubor.');
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = async () => {
        if (confirm('Opravdu chcete smazat všechna data? Tato akce je nevratná!')) {
            await db.transactions.clear();
            await db.accounts.clear(); // Careful with this if we want to keep accounts
            // Ideally we re-seed defaults
            setMessage('Data vymazána.');
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    return (
        <div className="p-4 space-y-8 max-w-2xl mx-auto pb-24">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nastavení</h1>
                <p className="text-gray-500 mt-1">Správa dat a aplikace</p>
            </header>

            {message && (
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl text-sm font-medium animate-in fade-in">
                    {message}
                </div>
            )}

            {/* Category Management */}
            <CategorySettings />

            {/* Theme Selection */}
            <section className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider opacity-60 px-1">Barevné téma</h2>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(themes).map(([key, theme]) => (
                            <button
                                key={key}
                                onClick={() => handleThemeChange(key)}
                                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${currentTheme === key
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                                    }`}
                            >
                                <div
                                    className="w-12 h-12 rounded-full shadow-md"
                                    style={{ backgroundColor: theme.primary }}
                                />
                                <span className="text-xs font-semibold text-gray-700">{theme.name}</span>
                                {currentTheme === key && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Data Management Section */}
            <section className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider opacity-60 px-1">Data a zálohování</h2>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">

                    {/* Export */}
                    <button
                        onClick={handleExport}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Download size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Exportovat data</p>
                                <p className="text-xs text-gray-500">Stáhnout zálohu všech transakcí (JSON)</p>
                            </div>
                        </div>
                    </button>

                    {/* Import */}
                    <div className="relative w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Upload size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Importovat data</p>
                                <p className="text-xs text-gray-500">Obnovit data ze zálohy</p>
                            </div>
                        </div>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>

                    {/* Reset */}
                    <button
                        onClick={handleClearData}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-red-600">Smazat všechna data</p>
                                <p className="text-xs text-red-400 opacity-80">Začít znovu od nuly</p>
                            </div>
                        </div>
                    </button>

                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider opacity-60 px-1">O aplikaci</h2>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Verze 1.0.0 (Local PWA)</p>
                    <p className="text-gray-400 text-xs mt-1">Data jsou uložena pouze ve vašem zařízení.</p>
                </div>
            </section>

        </div>
    );
}
