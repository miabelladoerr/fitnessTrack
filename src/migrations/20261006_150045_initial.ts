import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_profile_goals" AS ENUM('glutes', 'tone', 'bulk', 'strong', 'lose', 'stamina');
  CREATE TYPE "public"."enum_users_profile_go_easy_on" AS ENUM('back', 'shoulder', 'knee');
  CREATE TYPE "public"."enum_users_profile_measurement_targets_measure" AS ENUM('weight', 'waist', 'hips', 'chest', 'arm', 'thigh', 'bf');
  CREATE TYPE "public"."enum_users_profile_lift_targets_lift" AS ENUM('bench', 'squat', 'deadlift', 'ohp', 'thrust');
  CREATE TYPE "public"."enum_users_role" AS ENUM('member', 'admin');
  CREATE TYPE "public"."enum_users_profile_calorie_formula" AS ENUM('m', 'f');
  CREATE TYPE "public"."enum_users_profile_experience" AS ENUM('beg', 'int', 'adv');
  CREATE TYPE "public"."enum_users_profile_location" AS ENUM('home', 'gym');
  CREATE TYPE "public"."enum_routines_days_type" AS ENUM('full', 'upper', 'lower', 'push', 'pull', 'legs');
  CREATE TYPE "public"."enum_food_entries_meal" AS ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack');
  CREATE TYPE "public"."enum_stickers_tab" AS ENUM('me', 'log', 'routine', 'food', 'progress', 'library');
  CREATE TABLE "users_profile_goals" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_profile_goals",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_profile_go_easy_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_profile_go_easy_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_profile_measurement_targets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"measure" "enum_users_profile_measurement_targets_measure" NOT NULL,
  	"value" numeric NOT NULL
  );
  
  CREATE TABLE "users_profile_lift_targets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lift" "enum_users_profile_lift_targets_lift" NOT NULL,
  	"one_rep_max_lb" numeric NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'member' NOT NULL,
  	"profile_age" numeric,
  	"profile_height_in" numeric,
  	"profile_calorie_formula" "enum_users_profile_calorie_formula",
  	"profile_training_days" numeric DEFAULT 4,
  	"profile_session_minutes" numeric DEFAULT 60,
  	"profile_experience" "enum_users_profile_experience" DEFAULT 'int',
  	"profile_location" "enum_users_profile_location" DEFAULT 'gym',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "measurements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"weight" numeric,
  	"waist" numeric,
  	"hips" numeric,
  	"chest" numeric,
  	"arm" numeric,
  	"thigh" numeric,
  	"body_fat" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workouts_exercises_sets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"weight" numeric,
  	"reps" numeric,
  	"rpe" numeric,
  	"done" boolean
  );
  
  CREATE TABLE "workouts_exercises" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"rep_low" numeric,
  	"rep_high" numeric,
  	"target_rpe" numeric
  );
  
  CREATE TABLE "workouts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "routines_days_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"exercise" varchar NOT NULL,
  	"pattern" varchar,
  	"sets" numeric,
  	"reps" varchar,
  	"rest_seconds" numeric
  );
  
  CREATE TABLE "routines_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_routines_days_type"
  );
  
  CREATE TABLE "routines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"title" varchar DEFAULT 'My routine' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "food_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"meal" "enum_food_entries_meal" NOT NULL,
  	"food" varchar NOT NULL,
  	"kcal" numeric NOT NULL,
  	"protein" numeric,
  	"carbs" numeric,
  	"fat" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "stickers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"tab" "enum_stickers_tab" NOT NULL,
  	"kind" varchar NOT NULL,
  	"x" numeric NOT NULL,
  	"y" numeric NOT NULL,
  	"rotation" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"measurements_id" integer,
  	"workouts_id" integer,
  	"routines_id" integer,
  	"food_entries_id" integer,
  	"stickers_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_profile_goals" ADD CONSTRAINT "users_profile_goals_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_profile_go_easy_on" ADD CONSTRAINT "users_profile_go_easy_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_profile_measurement_targets" ADD CONSTRAINT "users_profile_measurement_targets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_profile_lift_targets" ADD CONSTRAINT "users_profile_lift_targets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_texts" ADD CONSTRAINT "users_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "measurements" ADD CONSTRAINT "measurements_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workouts_exercises_sets" ADD CONSTRAINT "workouts_exercises_sets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workouts_exercises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workouts_exercises" ADD CONSTRAINT "workouts_exercises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workouts" ADD CONSTRAINT "workouts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "routines_days_items" ADD CONSTRAINT "routines_days_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."routines_days"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "routines_days" ADD CONSTRAINT "routines_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "routines" ADD CONSTRAINT "routines_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "food_entries" ADD CONSTRAINT "food_entries_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stickers" ADD CONSTRAINT "stickers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_measurements_fk" FOREIGN KEY ("measurements_id") REFERENCES "public"."measurements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workouts_fk" FOREIGN KEY ("workouts_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_routines_fk" FOREIGN KEY ("routines_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_food_entries_fk" FOREIGN KEY ("food_entries_id") REFERENCES "public"."food_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stickers_fk" FOREIGN KEY ("stickers_id") REFERENCES "public"."stickers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_profile_goals_order_idx" ON "users_profile_goals" USING btree ("order");
  CREATE INDEX "users_profile_goals_parent_idx" ON "users_profile_goals" USING btree ("parent_id");
  CREATE INDEX "users_profile_go_easy_on_order_idx" ON "users_profile_go_easy_on" USING btree ("order");
  CREATE INDEX "users_profile_go_easy_on_parent_idx" ON "users_profile_go_easy_on" USING btree ("parent_id");
  CREATE INDEX "users_profile_measurement_targets_order_idx" ON "users_profile_measurement_targets" USING btree ("_order");
  CREATE INDEX "users_profile_measurement_targets_parent_id_idx" ON "users_profile_measurement_targets" USING btree ("_parent_id");
  CREATE INDEX "users_profile_lift_targets_order_idx" ON "users_profile_lift_targets" USING btree ("_order");
  CREATE INDEX "users_profile_lift_targets_parent_id_idx" ON "users_profile_lift_targets" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_texts_order_parent" ON "users_texts" USING btree ("order","parent_id");
  CREATE INDEX "measurements_owner_idx" ON "measurements" USING btree ("owner_id");
  CREATE INDEX "measurements_date_idx" ON "measurements" USING btree ("date");
  CREATE INDEX "measurements_updated_at_idx" ON "measurements" USING btree ("updated_at");
  CREATE INDEX "measurements_created_at_idx" ON "measurements" USING btree ("created_at");
  CREATE INDEX "workouts_exercises_sets_order_idx" ON "workouts_exercises_sets" USING btree ("_order");
  CREATE INDEX "workouts_exercises_sets_parent_id_idx" ON "workouts_exercises_sets" USING btree ("_parent_id");
  CREATE INDEX "workouts_exercises_order_idx" ON "workouts_exercises" USING btree ("_order");
  CREATE INDEX "workouts_exercises_parent_id_idx" ON "workouts_exercises" USING btree ("_parent_id");
  CREATE INDEX "workouts_owner_idx" ON "workouts" USING btree ("owner_id");
  CREATE INDEX "workouts_date_idx" ON "workouts" USING btree ("date");
  CREATE INDEX "workouts_updated_at_idx" ON "workouts" USING btree ("updated_at");
  CREATE INDEX "workouts_created_at_idx" ON "workouts" USING btree ("created_at");
  CREATE INDEX "routines_days_items_order_idx" ON "routines_days_items" USING btree ("_order");
  CREATE INDEX "routines_days_items_parent_id_idx" ON "routines_days_items" USING btree ("_parent_id");
  CREATE INDEX "routines_days_order_idx" ON "routines_days" USING btree ("_order");
  CREATE INDEX "routines_days_parent_id_idx" ON "routines_days" USING btree ("_parent_id");
  CREATE INDEX "routines_owner_idx" ON "routines" USING btree ("owner_id");
  CREATE INDEX "routines_updated_at_idx" ON "routines" USING btree ("updated_at");
  CREATE INDEX "routines_created_at_idx" ON "routines" USING btree ("created_at");
  CREATE INDEX "food_entries_owner_idx" ON "food_entries" USING btree ("owner_id");
  CREATE INDEX "food_entries_date_idx" ON "food_entries" USING btree ("date");
  CREATE INDEX "food_entries_updated_at_idx" ON "food_entries" USING btree ("updated_at");
  CREATE INDEX "food_entries_created_at_idx" ON "food_entries" USING btree ("created_at");
  CREATE INDEX "stickers_owner_idx" ON "stickers" USING btree ("owner_id");
  CREATE INDEX "stickers_updated_at_idx" ON "stickers" USING btree ("updated_at");
  CREATE INDEX "stickers_created_at_idx" ON "stickers" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_measurements_id_idx" ON "payload_locked_documents_rels" USING btree ("measurements_id");
  CREATE INDEX "payload_locked_documents_rels_workouts_id_idx" ON "payload_locked_documents_rels" USING btree ("workouts_id");
  CREATE INDEX "payload_locked_documents_rels_routines_id_idx" ON "payload_locked_documents_rels" USING btree ("routines_id");
  CREATE INDEX "payload_locked_documents_rels_food_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("food_entries_id");
  CREATE INDEX "payload_locked_documents_rels_stickers_id_idx" ON "payload_locked_documents_rels" USING btree ("stickers_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_profile_goals" CASCADE;
  DROP TABLE "users_profile_go_easy_on" CASCADE;
  DROP TABLE "users_profile_measurement_targets" CASCADE;
  DROP TABLE "users_profile_lift_targets" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_texts" CASCADE;
  DROP TABLE "measurements" CASCADE;
  DROP TABLE "workouts_exercises_sets" CASCADE;
  DROP TABLE "workouts_exercises" CASCADE;
  DROP TABLE "workouts" CASCADE;
  DROP TABLE "routines_days_items" CASCADE;
  DROP TABLE "routines_days" CASCADE;
  DROP TABLE "routines" CASCADE;
  DROP TABLE "food_entries" CASCADE;
  DROP TABLE "stickers" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_profile_goals";
  DROP TYPE "public"."enum_users_profile_go_easy_on";
  DROP TYPE "public"."enum_users_profile_measurement_targets_measure";
  DROP TYPE "public"."enum_users_profile_lift_targets_lift";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_profile_calorie_formula";
  DROP TYPE "public"."enum_users_profile_experience";
  DROP TYPE "public"."enum_users_profile_location";
  DROP TYPE "public"."enum_routines_days_type";
  DROP TYPE "public"."enum_food_entries_meal";
  DROP TYPE "public"."enum_stickers_tab";`)
}
