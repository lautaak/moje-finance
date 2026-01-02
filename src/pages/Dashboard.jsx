import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import AddTransactionModal from '../components/AddTransactionModal';
import CategoryIcon from '../components/CategoryIcon';

// Categories are now self-contained with emojis stored in DB

export default function Dashboard() {
    const [editingTransaction, setEditingTransaction] = useState(null);
    const accounts = useLiveQuery(() => db.accounts.toArray());
    const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().limit(6).toArray());
    const categories = useLiveQuery(() => db.categories.toArray());

    const totalBalance = accounts?.reduce((acc, account) => acc + account.balance, 0) || 0;

    const getCategoryInfo = (categoryId) => {
        const category = categories?.find(c => Number(c.id) === Number(categoryId));
        return {
            name: category?.name || 'Bez kategorie',
            icon: category?.icon || 'HelpCircle',
            color: category?.color || '#94a3b8'
        };
    };

    return (
        <div className="p-4 pb-24 space-y-9 max-w-2xl mx-auto animate-in fade-in duration-700">

            {/* --- CLEAN HEADER --- */}
            <header className="flex justify-between items-center py-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Přehled</h1>
                </div>
            </header>

            {/* --- BALANCES CARD (REFINED) --- */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[3rem] p-10 text-white shadow-2xl shadow-primary/40 relative overflow-hidden group transition-transform active:scale-[0.98]">
                {/* Immersive Decorative Elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl opacity-30"></div>

                <div className="relative z-10 space-y-1">
                    <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-1">Celkový zůstatek</p>
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-5xl font-black tracking-tighter leading-none">
                            {totalBalance.toLocaleString('cs-CZ')}
                        </h2>
                        <span className="text-2xl font-bold opacity-40">Kč</span>
                    </div>
                </div>
            </div>

            {/* --- MODERN TRANSACTION LIST --- */}
            <section>
                <div className="flex justify-between items-center mb-6 px-1">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Poslední Pohyby</h3>
                    <Link to="/transactions" className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-primary/10 transition-all">Vše</Link>
                </div>

                <div className="bg-white rounded-[3rem] shadow-premium border border-gray-50/50 overflow-hidden divide-y divide-gray-50/50">
                    {transactions?.map((tx) => {
                        const info = getCategoryInfo(tx.categoryId);
                        return (
                            <div
                                key={tx.id}
                                onClick={() => setEditingTransaction(tx)}
                                className="p-4 flex justify-between items-center active:bg-gray-50/50 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner-soft transition-transform group-hover:scale-105"
                                        style={{ backgroundColor: `${info.color}15`, color: info.color }}>
                                        <CategoryIcon iconName={info.icon} size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-[16px] leading-tight mb-1">{tx.note || 'Bezejmenná'}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{info.name}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                            <span className="text-[10px] font-bold text-gray-300">
                                                {new Date(tx.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex items-baseline gap-2">
                                    <p className={`font-black tabular-nums text-xl tracking-tighter ${tx.type === 'expense' ? 'text-gray-900' : 'text-green-600'
                                        }`}>
                                        {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString('cs-CZ')}
                                    </p>
                                    <span className="text-[10px] font-black text-gray-300 uppercase">Kč</span>
                                </div>
                            </div>
                        );
                    })}
                    {transactions?.length === 0 && (
                        <div className="p-16 text-center flex flex-col items-center gap-4">
                            <div className="text-4xl">🧾</div>
                            <p className="text-gray-300 text-sm font-bold uppercase tracking-widest">Zatím ticho...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Edit Transaction Modal */}
            {editingTransaction && (
                <AddTransactionModal
                    isOpen={!!editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    editTransaction={editingTransaction}
                />
            )}
        </div>
    );
}
