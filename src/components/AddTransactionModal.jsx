import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { X, Check } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose, editTransaction = null }) {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringFrequency, setRecurringFrequency] = useState('monthly');
    const [recurringDay, setRecurringDay] = useState(1);

    // Load data for selects
    const categories = useLiveQuery(() => db.categories.toArray());
    const accounts = useLiveQuery(() => db.accounts.toArray());

    // Set defaults when data loads OR when editing
    useEffect(() => {
        if (editTransaction) {
            // Pre-fill form with existing transaction data
            setType(editTransaction.type);
            setAmount(editTransaction.amount.toString());
            setNote(editTransaction.note || '');
            setCategoryId(editTransaction.categoryId);
            setDate(new Date(editTransaction.date).toISOString().split('T')[0]);
            setIsRecurring(false); // Editing doesn't support recurring yet
        } else {
            // For new transactions, reset fields (except type if user is toggling)
            if (!isOpen) {
                setAmount('');
                setNote('');
                setDate(new Date().toISOString().split('T')[0]);
                setIsRecurring(false);
            }

            // Auto-select valid category for current type
            if (categories && categories.length > 0) {
                const currentCat = categories.find(c => Number(c.id) === Number(categoryId));
                const currentCatType = currentCat?.type || 'expense';

                if (!categoryId || currentCatType !== type) {
                    const defaultCat = categories.find(c => (c.type || 'expense') === type) || categories[0];
                    if (defaultCat) setCategoryId(defaultCat.id);
                }
            }
        }
    }, [isOpen, categories, type, editTransaction]);

    // Close modal on navigation
    useEffect(() => {
        const handleHashChange = () => {
            if (isOpen) onClose();
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [isOpen, onClose]);

    const formatInputAmount = (val) => {
        if (!val) return '';
        // Normalize: spaces are removed, comma is replaced by dot for internal processing
        const clean = val.toString().replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
        const parts = clean.split('.');
        // Add thousands separator (space) to integer part
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return parts.join(','); // Display with Czech comma separator if there is a decimal
    };

    const handleAmountChange = (e) => {
        // Accept input with spaces, comma or dot
        let val = e.target.value.replace(/\s/g, '').replace(',', '.');
        // Allow numeric values with at most one dot
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setAmount(val);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Robust numeric parsing
        const parsedAmount = parseFloat(amount.toString().replace(/\s/g, '').replace(',', '.'));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert('Zadejte platnou částku.');
            return;
        }

        if (!categoryId) {
            alert('Vyberte kategorii.');
            return;
        }

        const targetAccountId = 1; // Default to Account ID 1 (Main Account)

        try {
            if (editTransaction) {
                // Update existing transaction
                const oldTx = editTransaction;
                const oldAccount = await db.accounts.get(Number(oldTx.accountId));
                const newAccount = await db.accounts.get(Number(targetAccountId));

                // Reverse old transaction effect
                if (oldAccount) {
                    const reversedBalance = oldTx.type === 'income'
                        ? oldAccount.balance - oldTx.amount
                        : oldAccount.balance + oldTx.amount;
                    await db.accounts.update(Number(oldTx.accountId), { balance: reversedBalance });
                }

                // Apply new transaction effect (to main account)
                if (newAccount) {
                    const freshAccount = await db.accounts.get(Number(targetAccountId));
                    const newBalance = type === 'income'
                        ? freshAccount.balance + parsedAmount
                        : freshAccount.balance - parsedAmount;
                    await db.accounts.update(Number(targetAccountId), { balance: newBalance });
                }

                await db.transactions.update(editTransaction.id, {
                    type,
                    amount: parsedAmount,
                    categoryId: Number(categoryId),
                    accountId: Number(targetAccountId),
                    date: new Date(date),
                    note
                });
            } else {
                // Add new transaction
                await db.transactions.add({
                    type,
                    amount: parsedAmount,
                    categoryId: Number(categoryId),
                    accountId: Number(targetAccountId),
                    date: new Date(date),
                    note
                });

                // Update account balance
                const account = await db.accounts.get(Number(targetAccountId));
                if (account) {
                    const newBalance = type === 'income'
                        ? account.balance + parsedAmount
                        : account.balance - parsedAmount;
                    await db.accounts.update(Number(targetAccountId), { balance: newBalance });
                } else {
                    // Fallback: create account 1 if it somehow doesn't exist
                    await db.accounts.add({ id: 1, name: 'Hlavní účet', balance: type === 'income' ? parsedAmount : -parsedAmount });
                }

                // If recurring, create recurring transaction template
                if (isRecurring) {
                    await db.recurringTransactions.add({
                        type,
                        amount: parsedAmount,
                        categoryId: Number(categoryId),
                        accountId: Number(targetAccountId),
                        note,
                        frequency: recurringFrequency,
                        dayOfMonth: recurringFrequency === 'monthly' ? Number(recurringDay) : null,
                        dayOfWeek: recurringFrequency === 'weekly' ? Number(recurringDay) : null,
                        isActive: true,
                        lastProcessed: new Date()
                    });
                }
            }

            // Reset and close
            setAmount('');
            setNote('');
            setIsRecurring(false);
            onClose();
        } catch (err) {
            console.error('Error saving transaction:', err);
            alert('Chyba při ukládání transakce.');
        }
    };

    const handleDelete = async () => {
        if (!editTransaction || !confirm('Opravdu chcete smazat tuto transakci?')) return;

        try {
            // Reverse transaction effect on account
            const account = await db.accounts.get(Number(editTransaction.accountId));
            if (account) {
                const newBalance = editTransaction.type === 'income'
                    ? account.balance - editTransaction.amount
                    : account.balance + editTransaction.amount;
                await db.accounts.update(Number(editTransaction.accountId), { balance: newBalance });
            }

            // Delete transaction
            await db.transactions.delete(editTransaction.id);
            onClose();
        } catch (err) {
            console.error('Error deleting transaction:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 pb-24 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{editTransaction ? 'Upravit transakci' : 'Nová transakce'}</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">

                    {/* Type Switcher */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`py-2 text-sm font-medium rounded-lg transition-all ${type === 'expense'
                                ? 'bg-white text-red-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Výdaj
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`py-2 text-sm font-medium rounded-lg transition-all ${type === 'income'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Příjem
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Částka</label>
                        <div className="relative bg-gray-50 rounded-xl px-4 py-3 ring-2 ring-transparent focus-within:ring-primary transition-all">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={formatInputAmount(amount)}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className="w-full text-4xl font-bold text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none p-0 placeholder-gray-300 pr-16"
                                autoFocus
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-xl">Kč</span>
                        </div>
                    </div>

                    {/* Date & Account Row */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Datum</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Kategorie</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                        >
                            <option value="" disabled>Vyberte kategorii</option>
                            {categories?.filter(cat => (cat.type || 'expense') === type).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Recurring Options */}
                    {!editTransaction && (
                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={(e) => setIsRecurring(e.target.checked)}
                                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                                />
                                <span className="font-semibold text-gray-900">Opakující se transakce</span>
                            </label>

                            {isRecurring && (
                                <div className="pl-8 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Frekvence</label>
                                            <select
                                                value={recurringFrequency}
                                                onChange={(e) => setRecurringFrequency(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                            >
                                                <option value="weekly">Týdně</option>
                                                <option value="monthly">Měsíčně</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                                                {recurringFrequency === 'weekly' ? 'Den v týdnu' : 'Den v měsíci'}
                                            </label>
                                            <select
                                                value={recurringDay}
                                                onChange={(e) => setRecurringDay(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                            >
                                                {recurringFrequency === 'weekly' ? (
                                                    <>
                                                        <option value="1">Pondělí</option>
                                                        <option value="2">Úterý</option>
                                                        <option value="3">Středa</option>
                                                        <option value="4">Čtvrtek</option>
                                                        <option value="5">Pátek</option>
                                                        <option value="6">Sobota</option>
                                                        <option value="0">Neděle</option>
                                                    </>
                                                ) : (
                                                    Array.from({ length: 31 }, (_, i) => (
                                                        <option key={i + 1} value={i + 1}>{i + 1}.</option>
                                                    ))
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {recurringFrequency === 'weekly'
                                            ? 'Transakce se automaticky vytvoří každý týden.'
                                            : 'Transakce se automaticky vytvoří každý měsíc.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Note */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Název (volitelné)</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder=""
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-2">
                        {editTransaction && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-6 py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg bg-red-500 shadow-lg shadow-red-500/30 hover:brightness-110 active:scale-[0.98] transition-all"
                            >
                                Smazat
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all ${type === 'expense' ? 'bg-red-500 shadow-red-500/30' : 'bg-green-500 shadow-green-500/30'
                                }`}
                        >
                            <Check size={24} />
                            {editTransaction ? 'Uložit změny' : `Uložit ${type === 'expense' ? 'výdaj' : 'příjem'}`}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
