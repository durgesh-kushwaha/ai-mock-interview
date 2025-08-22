import { pgTable, serial, text, varchar, integer, timestamp, index, foreignKey, boolean } from "drizzle-orm/pg-core";

export const interviews = pgTable('interviews', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('json_mock_resp').notNull(),
    jobPosition: varchar('job_position', { length: 255 }).notNull(),
    jobDesc: text('job_desc').notNull(),
    jobExperience: varchar('job_experience', { length: 50 }).notNull(),
    createdBy: varchar('created_by', { length: 255 }).notNull(),
    createdAt: text('created_at').notNull(), // Use text to avoid timestamp issues
    mockId: varchar('mock_id', { length: 36 }).notNull().unique(),
    isActive: boolean('is_active').default(true).notNull(),
}, (table) => {
    return {
        interviewsMockIdIdx: index('interviews_mock_id_idx').on(table.mockId),
        createdByIdx: index('created_by_idx').on(table.createdBy),
        createdAtIdx: index('created_at_idx').on(table.createdAt),
    };
});

export const userAnswers = pgTable('user_answers', {
    id: serial('id').primaryKey(),

    mockId: varchar('mock_id', { length: 36 }).notNull(),
    question: text('question').notNull(),
    userAns: text('user_ans'),
    feedback: text('feedback'),
    rating: text('rating'), // Changed from integer to text to handle existing data
    userEmail: varchar('user_email', { length: 255 }),
    createdAt: text('created_at').notNull(), // Use text to avoid timestamp issues
    answerType: varchar('answer_type', { length: 20 }),
    originalCode: text('original_code'),
    modifiedCode: text('modified_code'),
    codeLanguage: varchar('code_language', { length: 50 }),
}, (table) => {
    return {
        userAnswersMockIdIdx: index('user_answers_mock_id_idx').on(table.mockId),
        userEmailIdx: index('user_email_idx').on(table.userEmail),
        createdAtIdx: index('user_answers_created_at_idx').on(table.createdAt),
        interviewFk: foreignKey({
            columns: [table.mockId],
            foreignColumns: [interviews.mockId],
            name: 'fk_user_answers_interview'
        }),
    };
});

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;

export type UserAnswer = typeof userAnswers.$inferSelect;
export type NewUserAnswer = typeof userAnswers.$inferInsert;