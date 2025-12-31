import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { startOfMonth, endOfMonth } from 'date-fns';
import BudgetList from '../components/BudgetList';
import ComparisonChart from '../components/ComparisonChart';

export default function Analytics() {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'budgets' | 'comparison'

    // Get expenses for current month (Overview only)
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const monthTransactions = useLiveQuery(() =>
        db.transactions
            .where('date')
            .between(start, end)
            .filter(tx => tx.type === 'expense')
            .toArray()
    );

    // Get ALL transactions for Comparison
    const allTransactions = useLiveQuery(() =>
        db.transactions.orderBy('date').toArray()
    );

    const categories = useLiveQuery(() => db.categories.toArray());

    // Aggregate data for Pie Chart (Overview)
    const pieData = useMemo(() => {
        if (!monthTransactions || !categories) return [];

        const agg = monthTransactions.reduce((acc, tx) => {
            const catId = tx.categoryId;
            if (!acc[catId]) acc[catId] = 0;
            acc[catId] += tx.amount;
            return acc;
        }, {});

        return Object.keys(agg).map(catId => {
            const cat = categories.find(c => c.id === parseInt(catId));
            return {
                name: cat ? cat.name : 'Nezařazeno',
                value: agg[catId],
                color: cat ? cat.color : '#94a3b8'
            };
        }).sort((a, b) => b.value - a.value);

    }, [monthTransactions, categories]);

    const totalExpense = pieData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto pb-24">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analýza</h1>
                <p className="text-gray-500 mt-1">Sledujte své finance</p>
            </header>

            {/* Tabs */}
            <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Přehled
                </button>
                <button
                    onClick={() => setActiveTab('budgets')}
                    className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${activeTab === 'budgets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Rozpočty
                </button>
                <button
                    onClick={() => setActiveTab('comparison')}
                    className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${activeTab === 'comparison' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Srovnání
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
                        <p className="text-gray-400 text-sm font-medium">Celkem utraceno (tento měsíc)</p>
                        <h2 className="text-4xl font-bold mt-1">{totalExpense.toLocaleString()} Kč</h2>
                    </div>

                    {/* Chart */}
                    <div className="h-64 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-4">Rozložení výdajů</h3>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `${value.toLocaleString()} Kč`}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                Žádná data pro tento měsíc
                            </div>
                        )}
                    </div>

                    {/* Category List */}
                    <div className="space-y-3">
                        {pieData.map(item => (
                            <div key={item.name} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="font-medium text-gray-700">{item.name}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-gray-900">{item.value.toLocaleString()} Kč</span>
                                    <span className="text-xs text-gray-400">{Math.round((item.value / totalExpense) * 100)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'budgets' && <BudgetList />}

            {activeTab === 'comparison' && (
                <ComparisonChart
                    transactions={allTransactions}
                    categories={categories}
                />
            )}

        </div>
    );
}
