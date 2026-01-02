import { db } from '../db';

// Process recurring transactions
export async function processRecurringTransactions() {
    const recurring = await db.recurringTransactions.where('isActive').equals(1).toArray();
    const now = new Date();

    for (const template of recurring) {
        const lastProcessed = template.lastProcessed ? new Date(template.lastProcessed) : new Date(0);
        let shouldCreate = false;

        if (template.frequency === 'weekly') {
            // Check if it's the right day of week and hasn't been processed this week
            const daysSinceProcessed = Math.floor((now - lastProcessed) / (1000 * 60 * 60 * 24));
            if (now.getDay() === template.dayOfWeek && daysSinceProcessed >= 7) {
                shouldCreate = true;
            }
        } else if (template.frequency === 'monthly') {
            // Check if it's the right day of month and hasn't been processed this month
            const currentDay = now.getDate();
            const lastProcessedMonth = lastProcessed.getMonth();
            const currentMonth = now.getMonth();

            if (currentDay === template.dayOfMonth &&
                (currentMonth !== lastProcessedMonth || now.getFullYear() !== lastProcessed.getFullYear())) {
                shouldCreate = true;
            }
        }

        if (shouldCreate) {
            // Create the transaction
            await db.transactions.add({
                type: template.type,
                amount: template.amount,
                categoryId: template.categoryId,
                accountId: template.accountId,
                date: now,
                note: template.note
            });

            // Update account balance
            const account = await db.accounts.get(template.accountId);
            if (account) {
                const newBalance = template.type === 'income'
                    ? account.balance + template.amount
                    : account.balance - template.amount;
                await db.accounts.update(template.accountId, { balance: newBalance });
            }

            // Update lastProcessed
            await db.recurringTransactions.update(template.id, { lastProcessed: now });
        }
    }
}
