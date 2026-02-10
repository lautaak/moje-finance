import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfYear, subYears } from 'date-fns';
import { cs } from 'date-fns/locale';

export default function ComparisonChart({ transactions, categories }) {
    const [timeScale, setTimeScale] = useState('month'); // 'month' | 'year'
    const [hiddenCategories, setHiddenCategories] = useState(new Set());

    // Aggregate data based on time scale
    const data = useMemo(() => {
        if (!transactions || !categories) return [];

        const grouped = {};
        const allCategoryIds = new Set();

        transactions.forEach(tx => {
            if (tx.type !== 'expense') return;

            const date = new Date(tx.date);
            let key;
            let label;

            if (timeScale === 'month') {
                key = format(date, 'yyyy-MM');
                label = format(date, 'MMM yyyy', { locale: cs });
            } else {
                key = format(date, 'yyyy');
                label = key;
            }

            if (!grouped[key]) {
                grouped[key] = { name: label, date: date.getTime(), total: 0 };
            }

            grouped[key][tx.categoryId] = (grouped[key][tx.categoryId] || 0) + tx.amount;
            grouped[key].total += tx.amount;
            allCategoryIds.add(tx.categoryId);
        });

        // Convert to array and sort by date
        return Object.values(grouped).sort((a, b) => a.date - b.date);
    }, [transactions, categories, timeScale]);

    const toggleCategory = (catId) => {
        const newHidden = new Set(hiddenCategories);
        if (newHidden.has(catId)) {
            newHidden.delete(catId);
        } else {
            newHidden.add(catId);
        }
        setHiddenCategories(newHidden);
    };

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-gray-400">Žádná data pro porovnání.</p>
                <p className="text-xs text-gray-300 mt-1">Zkuste přidat transakce do různých měsíců.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Controls */}
            <div className="flex justify-center bg-gray-50 p-1 rounded-lg w-max mx-auto">
                <button
                    onClick={() => setTimeScale('month')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${timeScale === 'month' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Po měsících
                </button>
                <button
                    onClick={() => setTimeScale('year')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${timeScale === 'year' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Po letech
                </button>
            </div>

            {/* Chart */}
            <div className="h-80 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `${val}`} />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value, name, props) => {
                                const cat = categories.find(c => c.name === name); // Recharts passes name as key
                                // We need to map back correctly, checking payload is safer
                                return [`${value.toLocaleString()} Kč`, name];
                            }}
                        />
                        {/* Render Bars for each category */}
                        {categories.map(cat => (
                            !hiddenCategories.has(cat.id) && (
                                <Bar
                                    key={cat.id}
                                    dataKey={cat.id}
                                    name={cat.name}
                                    stackId="a"
                                    fill={cat.color}
                                    radius={[0, 0, 0, 0]}
                                />
                            )
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Interactive Legend */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Filtrování kategorií</h4>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                        const isHidden = hiddenCategories.has(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isHidden
                                    ? 'bg-gray-100 text-gray-400 opacity-50'
                                    : 'bg-gray-50 text-gray-900 ring-1 ring-inset ring-gray-200'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${isHidden ? 'bg-gray-400' : ''}`} style={!isHidden ? { background: cat.color } : {}} />
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
