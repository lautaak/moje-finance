import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import {
    Check, Plus, Trash2, X,
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
    const [newCatType, setNewCatType] = useState('expense');
    const [editingId, setEditingId] = useState(null);

    // Custom Color Picker State
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [hue, setHue] = useState(210); // Default Blue
    const [tempColor, setTempColor] = useState('#3b82f6');

    // Helper: HSL to Hex
    const hslToHex = (h, s, l) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    // Generate shades based on current hue
    const getShades = () => {
        const shades = [];
        // High Saturation, Varying Lightness
        for (let l = 20; l <= 80; l += 15) shades.push(hslToHex(hue, 90, l));
        // Medium Saturation
        for (let l = 30; l <= 70; l += 20) shades.push(hslToHex(hue, 60, l));
        return shades;
    };

    const handleDelete = async (id) => {
        if (confirm('Opravdu smazat tuto kategorii?')) {
            await db.categories.delete(id);
        }
    };

    const handleSave = async () => {
        if (!newCatName) return;

        if (editingId) {
            await db.categories.update(editingId, {
                name: newCatName,
                color: newCatColor,
                icon: newCatIcon,
                type: newCatType
            });
            setEditingId(null);
        } else {
            await db.categories.add({
                name: newCatName,
                color: newCatColor,
                icon: newCatIcon,
                type: newCatType
            });
        }

        setNewCatName('');
        setIsAdding(false);
    };

    const handleEdit = (cat) => {
        setNewCatName(cat.name);
        setNewCatColor(cat.color);
        setNewCatIcon(cat.icon);
        setNewCatType(cat.type || 'expense');
        setEditingId(cat.id);
        setIsAdding(true);
    };

    const cancelEdit = () => {
        setIsAdding(false);
        setEditingId(null);
        setNewCatName('');
        setNewCatType('expense');
        setNewCatColor('#3b82f6');
        setNewCatIcon('ShoppingBag');
    };

    if (!categories) return null;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] opacity-40">Kategorie</h2>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setNewCatName('');
                        setNewCatType('expense');
                        setIsAdding(true);
                    }}
                    className="bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2"
                >
                    <Plus size={14} strokeWidth={3} /> Přidat
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">

                {/* Add Form */}
                {isAdding && (
                    <div className="p-4 bg-gray-50 space-y-3 animate-in fade-in">
                        <input
                            type="text"
                            placeholder="Název kategorie"
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            autoFocus
                        />

                        {/* Type Switcher */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setNewCatType('expense')}
                                className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${newCatType === 'expense'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-gray-500'
                                    }`}
                            >
                                Výdaj
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewCatType('income')}
                                className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${newCatType === 'income'
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-gray-500'
                                    }`}
                            >
                                Příjem
                            </button>
                        </div>

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
                                {showColorPicker && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                                        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-6">
                                            <h3 className="text-xl font-bold text-gray-900">Vybrat barvu</h3>

                                            {/* Preview & Hex */}
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-2xl shadow-inner border border-gray-100"
                                                    style={{ backgroundColor: tempColor }}
                                                />
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">HEX Kód</label>
                                                    <input
                                                        type="text"
                                                        value={tempColor}
                                                        onChange={(e) => setTempColor(e.target.value)}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono text-sm uppercase focus:ring-2 focus:ring-primary focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Hue Slider */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Odstín</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="360"
                                                    value={hue}
                                                    onChange={(e) => setHue(Number(e.target.value))}
                                                    className="w-full h-4 rounded-full appearance-none cursor-pointer"
                                                    style={{
                                                        background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                                                    }}
                                                />
                                            </div>

                                            {/* Shades Grid */}
                                            <div className="grid grid-cols-5 gap-2">
                                                {getShades().map((shade, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => setTempColor(shade)}
                                                        className={`w-full aspect-square rounded-xl transition-transform hover:scale-105 ${tempColor === shade ? 'ring-2 ring-gray-900 scale-105' : ''}`}
                                                        style={{ backgroundColor: shade }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => {
                                                        setNewCatColor(tempColor);
                                                        setShowColorPicker(false);
                                                    }}
                                                    className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors"
                                                >
                                                    Použít
                                                </button>
                                                <button
                                                    onClick={() => setShowColorPicker(false)}
                                                    className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                                >
                                                    Zrušit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Custom Color Picker Trigger */}
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTempColor(newCatColor);
                                            setShowColorPicker(true);
                                        }}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer overflow-hidden ${!['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b', '#475569', '#1e293b'].includes(newCatColor) ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                                        style={{ backgroundColor: newCatColor }}
                                    >
                                        <Palette size={14} className={newCatColor === '#ffffff' ? 'text-gray-900' : 'text-white'} />
                                    </button>
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap w-max pointer-events-none font-medium shadow-sm">
                                        Vlastní
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={handleSave} className="flex-1 bg-primary text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:brightness-110 transition-all">
                                {editingId ? 'Upravit kategorii' : 'Uložit kategorii'}
                            </button>
                            <button onClick={cancelEdit} className="px-4 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all">
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
                                <span className="font-medium text-gray-900 truncate">{cat.name}</span>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleEdit(cat)}
                                    className="text-gray-300 hover:text-blue-500 p-2"
                                >
                                    <Palette size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-gray-300 hover:text-red-500 p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
