CREATE TABLE "interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"json_mock_resp" text NOT NULL,
	"job_position" varchar(255) NOT NULL,
	"job_desc" text NOT NULL,
	"job_experience" varchar(50) NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"mock_id" varchar(36) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "interviews_mock_id_unique" UNIQUE("mock_id")
);
--> statement-breakpoint
CREATE TABLE "user_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"mock_id" varchar(36) NOT NULL,
	"question" text NOT NULL,
	"user_ans" text,
	"feedback" text,
	"rating" integer,
	"user_email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"answer_type" varchar(20),
	"original_code" text,
	"modified_code" text,
	"code_language" varchar(50)
);
--> statement-breakpoint
ALTER TABLE "user_answers" ADD CONSTRAINT "fk_user_answers_interview" FOREIGN KEY ("mock_id") REFERENCES "public"."interviews"("mock_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mock_id_idx" ON "interviews" USING btree ("mock_id");--> statement-breakpoint
CREATE INDEX "created_by_idx" ON "interviews" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "interviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mock_id_ref_idx" ON "user_answers" USING btree ("mock_id");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user_answers" USING btree ("user_email");--> statement-breakpoint
CREATE INDEX "user_answers_created_at_idx" ON "user_answers" USING btree ("created_at");