import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, isToday, isYesterday } from 'date-fns';
import { cs } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';

export default function Transactions() {
    const transactions = useLiveQuery(() =>
        db.transactions.orderBy('date').reverse().toArray()
    );

    const categories = useLiveQuery(() => db.categories.toArray());

    // Helper to get category details
    const getCategory = (id) => categories?.find(c => c.id === id);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        if (!transactions) return {};

        return transactions.reduce((groups, tx) => {
            const dateStr = format(tx.date, 'yyyy-MM-dd');
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(tx);
            return groups;
        }, {});
    }, [transactions]);

    // Format header date (Dnes, Včera, or full date)
    const getDateHeader = (dateStr) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Dnes';
        if (isYesterday(date)) return 'Včera';
        return format(date, 'd. MMMM yyyy', { locale: cs });
    };

    return (
        <div className="p-4 pb-24 space-y-6 max-w-2xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transakce</h1>
                <p className="text-gray-500 mt-1">Historie vašich příjmů a výdajů</p>
            </header>

            {(!transactions || transactions.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Calendar size={48} className="mb-4 opacity-50" />
                    <p>Zatím zde nejsou žádné transakce.</p>
                </div>
            )}

            {Object.entries(groupedTransactions).map(([dateStr, txs]) => (
                <div key={dateStr} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-gray-50 py-2 z-10 w-full">
                        {getDateHeader(dateStr)}
                    </h3>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        {txs.map(tx => {
                            const category = getCategory(tx.categoryId);
                            return (
                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* Icon Circle */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tx.type === 'income'
                                                ? <ArrowUpRight size={20} />
                                                : <ArrowDownLeft size={20} />
                                            }
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {tx.note || category?.name || 'Bez názvu'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {category && (
                                                    <span
                                                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                                                    >
                                                        {category.name}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    {format(tx.date, 'HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <span className={`font-semibold tabular-nums tracking-tight ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'
                                        }`}>
                                        {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString()} Kč
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
