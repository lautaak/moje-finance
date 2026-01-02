import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import AddTransactionModal from '../components/AddTransactionModal';

export default function Dashboard() {
    const [editingTransaction, setEditingTransaction] = useState(null);
    const accounts = useLiveQuery(() => db.accounts.toArray());
    const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().limit(5).toArray());
    const categories = useLiveQuery(() => db.categories.toArray());

    // Safe checks for undefined data
    const totalBalance = accounts?.reduce((acc, account) => acc + account.balance, 0) || 0;

    const getCategoryName = (categoryId) => {
        const category = categories?.find(c => c.id === categoryId);
        return category?.name || 'Bez kategorie';
    };

    return (
        <div className="p-4 pb-24 space-y-6 max-w-2xl mx-auto">

            {/* Header */}
            <header className="flex justify-between items-center pt-4 px-1">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-primary tracking-tight">Přehled</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Vítejte zpět</p>
                </div>
            </header>

            {/* Main Balance Card (Glassmorphism / Gradient) */}
            <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-primary/20 transform transition-transform active:scale-[0.98] duration-200">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark z-0"></div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl z-0"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/10 rounded-full blur-2xl z-0"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <p className="text-white/80 font-medium tracking-wide text-xs uppercase opacity-90">Celkový stav</p>
                    <h2 className="text-4xl font-extrabold mt-1 tracking-tight">
                        {totalBalance.toLocaleString('cs-CZ')} <span className="text-xl opacity-70 font-normal">Kč</span>
                    </h2>
                </div>
            </div>

            {/* Accounts Section */}
            <div>
                <h3 className="text-xs font-bold text-gray-900 mb-3 px-1 uppercase tracking-wider opacity-60">Vaše Účty</h3>
                <div className="grid grid-cols-2 gap-3">
                    {accounts?.map(account => (
                        <div key={account.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all">
                            <div className="flex items-start justify-between mb-2">
                                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                                    <Wallet size={20} strokeWidth={2} />
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wide mb-0.5 opacity-80">{account.name}</p>
                                <p className="font-bold text-lg text-gray-900 tracking-tight">{account.balance.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div>
                <div className="flex justify-between items-end mb-3 px-1">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider opacity-60">Nedávná aktivita</h3>
                    <Link to="/transactions" className="text-primary text-xs font-bold hover:text-primary-dark bg-primary/10 px-3 py-1 rounded-full">Vše</Link>
                </div>

                <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 space-y-0.5">
                    {transactions?.length === 0 && (
                        <div className="p-6 text-center text-gray-400 text-sm">Zatím žádné pohyby</div>
                    )}
                    {transactions?.map((tx, i) => (
                        <div
                            key={tx.id}
                            onClick={() => setEditingTransaction(tx)}
                            className={`p-4 flex justify-between items-center rounded-2xl active:bg-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${i !== transactions.length - 1 ? '' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                                    }`}>
                                    {tx.type === 'income' ? <ArrowUpRight size={18} strokeWidth={2.5} /> : <ArrowDownLeft size={18} strokeWidth={2.5} />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{tx.note || 'Položka'}</p>
                                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                                        {getCategoryName(tx.categoryId)} • {new Date(tx.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-bold tabular-nums text-sm tracking-tight ${tx.type === 'expense' ? 'text-gray-900' : 'text-green-600'}`}>
                                {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString('cs-CZ')}
                            </span>
                        </div>
                    ))}
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
