import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";

export const interviews = pgTable('interviews', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('json_mock_resp').notNull(),
    jobPosition: varchar('job_position').notNull(),
    jobDesc: varchar('job_desc').notNull(),
    jobExperience: varchar('job_experience').notNull(),
    createdBy: varchar('created_by').notNull(),
    createdAt: varchar('created_at'),
    mockId: varchar('mock_id').notNull().unique(),
});

export const userAnswers = pgTable('user_answers', {
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mock_id').notNull(),
    question: varchar('question').notNull(),
    userAns: text('user_ans'),
    feedback: text('feedback'),
    rating: varchar('rating'),
    userEmail: varchar('user_email'),
    createdAt: varchar('created_at'),
    answerType: varchar('answer_type'),
    originalCode: text('original_code'),
    modifiedCode: text('modified_code'),
    codeLanguage: varchar('code_language'),
});
