import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import CategoryIcon from './CategoryIcon';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BudgetList() {
    const [isAdding, setIsAdding] = useState(false);
    const [newBudgetCategory, setNewBudgetCategory] = useState('');
    const [newBudgetAmount, setNewBudgetAmount] = useState('');

    const categories = useLiveQuery(() => db.categories.toArray());
    const budgets = useLiveQuery(() => db.budgets.toArray());

    // Calculate spending for current month per category
    const currentMonthExpenses = useLiveQuery(async () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const txs = await db.transactions
            .where('date')
            .between(start, end)
            .filter(tx => tx.type === 'expense')
            .toArray();

        return txs.reduce((acc, tx) => {
            acc[tx.categoryId] = (acc[tx.categoryId] || 0) + tx.amount;
            return acc;
        }, {});
    });

    const handleSaveBudget = async () => {
        if (!newBudgetCategory || !newBudgetAmount) return;

        // Check if budget exists for this category
        const existing = await db.budgets.where('categoryId').equals(parseInt(newBudgetCategory)).first();

        if (existing) {
            await db.budgets.update(existing.id, { limit: parseFloat(newBudgetAmount) });
        } else {
            await db.budgets.add({
                categoryId: parseInt(newBudgetCategory),
                limit: parseFloat(newBudgetAmount),
                month: new Date().toISOString().slice(0, 7) // Simple monthly tracking
            });
        }

        setIsAdding(false);
        setNewBudgetCategory('');
        setNewBudgetAmount('');
    };

    const deleteBudget = (id) => db.budgets.delete(id);

    if (!categories || !budgets || !currentMonthExpenses) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Add New Budget Button/Form */}
            {!isAdding ? (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Nastavit rozpočet
                </button>
            ) : (
                <div className="bg-white p-4 rounded-xl border border-primary/20 shadow-sm space-y-3">
                    <h3 className="font-semibold text-gray-900">Nový rozpočet</h3>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Kategorie</label>
                        <select
                            value={newBudgetCategory}
                            onChange={e => setNewBudgetCategory(e.target.value)}
                            className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
                        >
                            <option value="">Vyberte kategorii</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Měsíční limit (Kč)</label>
                        <input
                            type="number"
                            value={newBudgetAmount}
                            onChange={e => setNewBudgetAmount(e.target.value)}
                            placeholder=""
                            className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setIsAdding(false)} className="flex-1 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg">Zrušit</button>
                        <button onClick={handleSaveBudget} className="flex-1 py-2 text-sm text-white bg-primary rounded-lg font-medium shadow-sm shadow-primary/30">Uložit</button>
                    </div>
                </div>
            )}

            {/* Budget List */}
            <div className="space-y-4">
                {budgets.length === 0 && !isAdding && (
                    <p className="text-center text-gray-400 text-sm py-8">Bohužel zatím nemáte nastavené žádné rozpočty.</p>
                )}

                {budgets.map(budget => {
                    const category = categories.find(c => c.id === budget.categoryId);
                    if (!category) return null;

                    const spent = currentMonthExpenses[budget.categoryId] || 0;
                    const percentage = Math.min(Math.round((spent / budget.limit) * 100), 100);
                    const isOver = spent > budget.limit;

                    return (
                        <div key={budget.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${category?.color || '#94a3b8'}15`, color: category?.color || '#94a3b8' }}>
                                        <CategoryIcon iconName={category?.icon} size={16} strokeWidth={2.5} />
                                    </div>
                                    <span className="font-bold text-gray-900">{category.name}</span>
                                </div>
                                <button onClick={() => deleteBudget(budget.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex justify-between items-end mb-1">
                                <span className={`text-2xl font-bold tracking-tight ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
                                    {spent.toLocaleString()} <span className="text-sm font-normal text-gray-400">/ {budget.limit.toLocaleString()} Kč</span>
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isOver ? 'bg-red-100 text-red-600' : percentage > 80 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {Math.round((spent / budget.limit) * 100)}%
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mt-2">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            {isOver && (
                                <div className="mt-2 flex items-center gap-1.5 text-red-500 text-xs font-medium">
                                    <AlertCircle size={14} />
                                    <span>Překročení o {(spent - budget.limit).toLocaleString()} Kč</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
