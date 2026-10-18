import { sqliteTable, text, index, real, integer } from 'drizzle-orm/sqlite-core';
export const accounts = sqliteTable('accounts', {
 id: text('id').primaryKey(), name: text('name').notNull(), firm: text('firm').notNull().default(''),
 type: text('type').notNull().default('Challenge'), currency: text('currency').notNull().default('USD'),
 accountSize: real('account_size'), startingBalance: real('starting_balance'), archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
 notes: text('notes').notNull().default(''), createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull()
}, t => [index('idx_accounts_archived').on(t.archived), index('idx_accounts_name').on(t.name)]);
export const entries = sqliteTable('entries', {
 id: text('id').primaryKey(), date: text('date').notNull(), kind: text('kind').notNull(),
 title: text('title').notNull(), symbol: text('symbol').notNull(), side: text('side').notNull(),
 setup: text('setup').notNull(), outcome: text('outcome').notNull(), idea: text('idea').notNull(),
 review: text('review').notNull(), lessons: text('lessons').notNull(),
 rMultiple: real('r_multiple'), maeR: real('mae_r'), mfeR: real('mfe_r'),
 setupGrade: text('setup_grade').notNull().default('Not graded'),
 followedPlan: integer('followed_plan', { mode: 'boolean' }).notNull().default(false),
 fomo: integer('fomo', { mode: 'boolean' }).notNull().default(false),
 session: text('session').notNull().default('Not set'),
 tags: text('tags').notNull().default('[]'),
 accountId: text('account_id').references(()=>accounts.id,{onDelete:'set null'}), riskAmount: real('risk_amount'), netPnl: real('net_pnl'),
 images: text('images').notNull().default('[]'), updatedAt: text('updated_at').notNull()
}, t => [index('idx_entries_date').on(t.date), index('idx_entries_account').on(t.accountId)]);
