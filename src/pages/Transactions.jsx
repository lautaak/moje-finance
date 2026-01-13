import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { format, isToday, isYesterday } from 'date-fns';
import { cs } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Calendar, Search, X, ChevronDown } from 'lucide-react';
import AddTransactionModal from '../components/AddTransactionModal';
import CategoryIcon from '../components/CategoryIcon';

export default function Transactions() {
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(''); // YYYY-MM
    const [selectedCategory, setSelectedCategory] = useState(''); // Category ID or ''
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const transactions = useLiveQuery(() =>
        db.transactions.orderBy('date').reverse().toArray()
    );

    const categories = useLiveQuery(() => db.categories.toArray());

    // Helper to get category details
    const getCategory = (id) => categories?.find(c => c.id === id);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        return transactions.filter(tx => {
            const matchesSearch = searchTerm === '' ||
                tx.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                getCategory(tx.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesMonth = selectedMonth === '' ||
                format(tx.date, 'yyyy-MM') === selectedMonth;

            const matchesCategory = selectedCategory === '' ||
                tx.categoryId === parseInt(selectedCategory);

            return matchesSearch && matchesMonth && matchesCategory;
        });
    }, [transactions, searchTerm, selectedMonth, selectedCategory, categories]);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        if (!filteredTransactions) return {};

        return filteredTransactions.reduce((groups, tx) => {
            const dateStr = format(tx.date, 'yyyy-MM-dd');
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(tx);
            return groups;
        }, {});
    }, [filteredTransactions]);

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

            {/* Filters */}
            <div className="sticky top-0 z-20 bg-gray-50 pt-2 pb-4 space-y-3">
                <div className="flex gap-2">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Hledat..."
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Month Picker */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar size={18} className="text-gray-500" />
                        </div>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-medium text-gray-700 cursor-pointer"
                        />
                    </div>

                    {/* Category Picker (Custom Dropdown) */}
                    <div className="relative">
                        <button
                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            className="h-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2 min-w-[5rem] justify-between"
                        >
                            {selectedCategory ? (
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                                        style={{ backgroundColor: getCategory(parseInt(selectedCategory))?.color, color: 'white' }}
                                    >
                                        <CategoryIcon iconName={getCategory(parseInt(selectedCategory))?.icon} size={10} />
                                    </div>
                                    <span className="truncate max-w-[4rem]">{getCategory(parseInt(selectedCategory))?.name}</span>
                                </div>
                            ) : (
                                <span>Vše</span>
                            )}
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {isCategoryDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setIsCategoryDropdownOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                    <button
                                        onClick={() => { setSelectedCategory(''); setIsCategoryDropdownOpen(false); }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 font-medium"
                                    >
                                        Všechny kategorie
                                    </button>
                                    {categories?.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setSelectedCategory(c.id); setIsCategoryDropdownOpen(false); }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <div
                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm"
                                                style={{ backgroundColor: c.color }}
                                            >
                                                <CategoryIcon iconName={c.icon} size={12} />
                                            </div>
                                            <span className="font-medium text-gray-700 truncate">{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Active Filter Tags */}
                {(searchTerm || selectedMonth || selectedCategory) && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {selectedMonth && (
                            <button
                                onClick={() => setSelectedMonth('')}
                                className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wide hover:bg-primary/20 transition-colors whitespace-nowrap"
                            >
                                {format(new Date(selectedMonth), 'MMMM yyyy', { locale: cs })}
                                <X size={12} />
                            </button>
                        )}
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory('')}
                                className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wide hover:bg-primary/20 transition-colors whitespace-nowrap"
                            >
                                {categories?.find(c => c.id === parseInt(selectedCategory))?.name}
                                <X size={12} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {(!filteredTransactions || filteredTransactions.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Search size={48} className="mb-4 opacity-50" />
                    <p>Žádné transakce nenalezeny.</p>
                    {(searchTerm || selectedMonth || selectedCategory) && (
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedMonth(''); setSelectedCategory(''); }}
                            className="mt-4 text-primary font-semibold text-sm hover:underline"
                        >
                            Zrušit filtry
                        </button>
                    )}
                </div>
            )}

            {Object.entries(groupedTransactions).map(([dateStr, txs]) => (
                <div key={dateStr} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 ml-1">
                        {getDateHeader(dateStr)}
                    </h3>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        {txs.map(tx => {
                            const category = getCategory(tx.categoryId);
                            return (
                                <div
                                    key={tx.id}
                                    onClick={() => setEditingTransaction(tx)}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Icon Circle */}
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner-soft"
                                            style={{ backgroundColor: `${category?.color || '#94a3b8'}15`, color: category?.color || '#94a3b8' }}>
                                            <CategoryIcon iconName={category?.icon} size={22} strokeWidth={2.5} />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 leading-tight">
                                                {tx.note || category?.name || 'Bez názvu'}
                                            </span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {category && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                                                        {category.name}
                                                    </span>
                                                )}
                                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                                <span className="text-[10px] font-bold text-gray-300">
                                                    {format(tx.date, 'HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <span className={`font-semibold tabular-nums tracking-tight ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'
                                        }`}>
                                        {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString('cs-CZ')} Kč
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

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
