import Dexie from 'dexie';

export const db = new Dexie('FinanceAppDB');

db.version(1).stores({
    transactions: '++id, date, type, categoryId, accountId',
    categories: '++id, name, parentId',
    accounts: '++id, name',
    budgets: '++id, categoryId, month'
});

// Version 2: Add recurring transactions
db.version(2).stores({
    transactions: '++id, date, type, categoryId, accountId',
    categories: '++id, name, parentId',
    accounts: '++id, name',
    budgets: '++id, categoryId, month',
    recurringTransactions: '++id, dayOfMonth, isActive'
});

// Pre-populate default categories if empty
db.on('populate', () => {
    db.categories.bulkAdd([
        { name: 'Jídlo', icon: 'Utensils', emoji: '🍔', color: '#ef4444' },
        { name: 'Bydlení', icon: 'Home', emoji: '🏠', color: '#3b82f6' },
        { name: 'Doprava', icon: 'Car', emoji: '🚗', color: '#f59e0b' },
        { name: 'Zábava', icon: 'Gamepad2', emoji: '🎮', color: '#8b5cf6' },
        { name: 'Mzda', icon: 'Banknote', emoji: '💰', color: '#10b981', type: 'income' },
    ]);

    db.accounts.bulkAdd([
        { id: 1, name: 'Hlavní účet', type: 'bank', balance: 0 },
    ]);
});
