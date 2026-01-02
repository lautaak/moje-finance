import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import {
    Check,
    ShoppingBag, Coffee, Car, Home,
    Smartphone, Gift, Heart, Briefcase,
    Utensils, Zap, Bus, Plane, Palette
} from 'lucide-react';

import { ICON_MAP } from './CategoryIcon';

export default function CategorySettings() {
    const categories = useLiveQuery(() => db.categories.toArray());
    const [isAdding, setIsAdding] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#3b82f6');
    const [newCatIcon, setNewCatIcon] = useState('ShoppingBag');

    const handleDelete = async (id) => {
        if (confirm('Opravdu smazat tuto kategorii?')) {
            await db.categories.delete(id);
        }
    };

    const handleAdd = async () => {
        if (!newCatName) return;
        await db.categories.add({
            name: newCatName,
            color: newCatColor,
            icon: newCatIcon
        });
        setNewCatName('');
        setIsAdding(false);
    };

    if (!categories) return null;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] opacity-40">Kategorie</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2"
                >
                    <Plus size={14} strokeWidth={3} /> Přidat
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">

                {/* Add Form */}
                {isAdding && (
                    <div className="p-4 bg-gray-50 space-y-3 animate-in fade-in">
                        <input
                            type="text"
                            placeholder="Název kategorie"
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                            autoFocus
                        />

                        <div className="flex gap-2 items-center overflow-x-auto pb-2">
                            {Object.keys(ICON_MAP).map(iconName => {
                                const Icon = ICON_MAP[iconName];
                                return (
                                    <button
                                        key={iconName}
                                        onClick={() => setNewCatIcon(iconName)}
                                        className={`p-2 rounded-lg transition-colors ${newCatIcon === iconName ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400'}`}
                                    >
                                        <Icon size={18} />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Barva</label>
                            <div className="flex flex-wrap gap-2 px-1">
                                {[
                                    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
                                    '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
                                    '#64748b', '#475569', '#1e293b'
                                ].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewCatColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${newCatColor === color ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                {/* Custom Color Picker Trigger */}
                                <div className="relative group">
                                    <div
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer overflow-hidden ${!['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b', '#475569', '#1e293b'].includes(newCatColor) ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                                        style={{ backgroundColor: newCatColor }}
                                    >
                                        <Palette size={14} className={newCatColor === '#ffffff' ? 'text-gray-900' : 'text-white'} />
                                        <input
                                            type="color"
                                            value={newCatColor}
                                            onChange={e => setNewCatColor(e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                                        />
                                    </div>
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-widest">
                                        Vlastní
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={handleAdd} className="flex-1 bg-primary text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:brightness-110 transition-all">Uložit kategorii</button>
                            <button onClick={() => setIsAdding(false)} className="px-4 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* List */}
                {categories.map(cat => {
                    const Icon = ICON_MAP[cat.icon] || ShoppingBag;
                    return (
                        <div key={cat.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                    style={{ backgroundColor: cat.color }}
                                >
                                    <Icon size={16} />
                                </div>
                                <span className="font-medium text-gray-900">{cat.name}</span>
                            </div>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="text-gray-300 hover:text-red-500 p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
