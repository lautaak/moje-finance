import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import AddTransactionModal from '../components/AddTransactionModal';

export default function Dashboard() {
    const [editingTransaction, setEditingTransaction] = useState(null);
    const accounts = useLiveQuery(() => db.accounts.toArray());
    const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().limit(6).toArray());
    const categories = useLiveQuery(() => db.categories.toArray());

    const totalBalance = accounts?.reduce((acc, account) => acc + account.balance, 0) || 0;

    const getCategoryName = (categoryId) => {
        const category = categories?.find(c => c.id === categoryId);
        return category?.name || 'Bez kategorie';
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">

            {/* --- HERO SECTION --- */}
            <div className="relative pt-12 pb-20 px-6 overflow-hidden">
                {/* Immersive Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark z-0"></div>

                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 animate-pulse"></div>
                <div className="absolute top-1/2 -left-12 w-48 h-48 bg-black/5 rounded-full blur-2xl z-0"></div>

                <header className="relative z-10 flex justify-between items-center mb-10 text-white/90">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Účetní zůstatek</p>
                        <h1 className="text-4xl font-black tracking-tighter text-white">
                            {totalBalance.toLocaleString('cs-CZ')} <span className="text-xl font-medium opacity-60 ml-1">Kč</span>
                        </h1>
                    </div>
                    <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center shadow-lg">
                        <Wallet className="text-white" size={24} strokeWidth={2} />
                    </div>
                </header>

                {/* Quick Actions / Summary Pills */}
                <div className="relative z-10 flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-2 whitespace-nowrap shadow-sm">
                        <ArrowUpRight size={16} className="text-green-400" strokeWidth={3} />
                        <span className="text-xs font-bold text-white">+ 2 450 Kč dnes</span>
                    </div>
                    <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-2 whitespace-nowrap shadow-sm">
                        <ArrowDownLeft size={16} className="text-red-300" strokeWidth={3} />
                        <span className="text-xs font-bold text-white">- 890 Kč dnes</span>
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA (Negative Margin overlap) --- */}
            <div className="relative z-20 -mt-10 px-4 space-y-8">

                {/* Accounts Grid - Horizontal Scroll or Grid */}
                <div>
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest opacity-40">Moje Peněženky</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {accounts?.map(account => (
                            <div
                                key={account.id}
                                className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-premium active:scale-95 transition-all group"
                            >
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                    <Wallet size={20} strokeWidth={2.5} />
                                </div>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{account.name}</p>
                                <p className="font-bold text-xl text-gray-900 tracking-tight">
                                    {account.balance.toLocaleString('cs-CZ')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity - Detailed List */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest opacity-40">Poslední Pohyby</h3>
                        <Link to="/transactions" className="text-primary text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity">Všechny</Link>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-gray-50 overflow-hidden divide-y divide-gray-50/50">
                        {transactions?.length === 0 && (
                            <div className="p-10 text-center flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                    <List size={32} />
                                </div>
                                <p className="text-gray-400 text-sm font-medium">Zatím žádná aktivita k vidění</p>
                            </div>
                        )}
                        {transactions?.map((tx) => (
                            <div
                                key={tx.id}
                                onClick={() => setEditingTransaction(tx)}
                                className="p-6 flex justify-between items-center active:bg-gray-50/80 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                                        }`}>
                                        {tx.type === 'income' ? <ArrowUpRight size={22} strokeWidth={2.5} /> : <ArrowDownLeft size={22} strokeWidth={2.5} />}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-[15px] leading-tight mb-1">{tx.note || 'Bezejmenná platba'}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded-lg">
                                                {getCategoryName(tx.categoryId)}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-300">
                                                {new Date(tx.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black tabular-nums text-lg tracking-tighter ${tx.type === 'expense' ? 'text-gray-900' : 'text-green-600'
                                        }`}>
                                        {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString('cs-CZ')}
                                    </p>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Kč</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
