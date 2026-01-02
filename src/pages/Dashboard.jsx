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
        <div className="p-4 pb-24 space-y-7 max-w-2xl mx-auto animate-in fade-in duration-500">

            {/* --- CLEAN HEADER --- */}
            <header className="flex justify-between items-center py-2">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Přehled</h1>
                    <p className="text-gray-400 text-sm font-medium">Vítejte zpět</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <Wallet size={24} />
                </div>
            </header>

            {/* --- BALANCES CARD (REFINED) --- */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
                {/* Subtle Decorative Layers */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                <div className="relative z-10 space-y-1">
                    <p className="text-white/70 text-xs font-black uppercase tracking-widest">Celkový zůstatek</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-5xl font-black tracking-tighter">
                            {totalBalance.toLocaleString('cs-CZ')}
                        </h2>
                        <span className="text-2xl font-medium opacity-50">Kč</span>
                    </div>
                </div>

                <div className="relative z-10 mt-8 flex gap-4">
                    <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2">
                        <ArrowUpRight size={16} className="text-green-300" strokeWidth={3} />
                        <span className="text-xs font-bold text-white">Přehledné úspory</span>
                    </div>
                </div>
            </div>

            {/* --- ACCOUNTS --- */}
            <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Vaše Účty</h3>
                <div className="grid grid-cols-2 gap-4">
                    {accounts?.map(account => (
                        <div key={account.id} className="bg-white px-5 py-6 rounded-[2rem] border border-gray-100 shadow-sm active:scale-95 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Wallet size={18} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{account.name}</span>
                            </div>
                            <p className="text-xl font-black text-gray-900 tracking-tight">
                                {account.balance.toLocaleString('cs-CZ')} <span className="text-sm font-medium opacity-30">Kč</span>
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- RECENT ACTIVITY --- */}
            <section>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nedávná aktivita</h3>
                    <Link to="/transactions" className="text-primary text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity">Zobrazit vše</Link>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden divide-y divide-gray-50/50">
                    {transactions?.map((tx) => (
                        <div
                            key={tx.id}
                            onClick={() => setEditingTransaction(tx)}
                            className="p-5 flex justify-between items-center active:bg-gray-50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                                    }`}>
                                    {tx.type === 'income' ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownLeft size={20} strokeWidth={2.5} />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm leading-tight mb-1">{tx.note || 'Platba'}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                                        {getCategoryName(tx.categoryId)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-black tabular-nums text-base tracking-tighter ${tx.type === 'expense' ? 'text-gray-900' : 'text-green-600'
                                    }`}>
                                    {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString('cs-CZ')}
                                </p>
                            </div>
                        </div>
                    ))}
                    {transactions?.length === 0 && (
                        <div className="p-10 text-center text-gray-300 text-sm font-medium italic">Žádné nedávné pohyby</div>
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
