import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import {
    Plus, Trash2, X, Check,
    ShoppingBag, Coffee, Car, Home,
    Smartphone, Gift, Heart, Briefcase,
    Utensils, Zap, Bus, Plane
} from 'lucide-react';

// Icon mapping for selection
const ICON_MAP = {
    ShoppingBag, Coffee, Car, Home,
    Smartphone, Gift, Heart, Briefcase,
    Utensils, Zap, Bus, Plane
};

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
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider opacity-60">Kategorie</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="text-blue-600 text-xs font-semibold hover:text-blue-700 flex items-center gap-1"
                >
                    <Plus size={14} /> Přidat
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

                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={newCatColor}
                                onChange={e => setNewCatColor(e.target.value)}
                                className="h-9 w-9 p-0.5 rounded border border-gray-200 cursor-pointer"
                            />
                            <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white rounded-lg text-sm font-medium">Uložit</button>
                            <button onClick={() => setIsAdding(false)} className="px-3 bg-gray-200 text-gray-600 rounded-lg">
                                <X size={18} />
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
