import { pgTable, text, timestamp, boolean, integer, date, smallint, jsonb, unique, index } from "drizzle-orm/pg-core";
import { organization, user } from "./auth";
import { sql } from "drizzle-orm";

// Application tables - all have household_id (tenant key)

export const householdsProfile = pgTable("households_profile", {
  householdId: text("household_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  timezone: text("timezone").notNull().default("UTC"),
  weekStartsOn: smallint("week_starts_on").notNull().default(0), // 0=Sun..6=Sat
  pointsEnabled: boolean("points_enabled").notNull().default(true),
  approvalRequired: boolean("approval_required").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const memberProfile = pgTable(
  "member_profile",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    householdId: text("household_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    displayName: text("display_name"),
    avatarColor: text("avatar_color"),
    pointsBalance: integer("points_balance").notNull().default(0),
    birthdate: date("birthdate"),
  },
  (table) => ({
    uniqueHouseholdUser: unique().on(table.householdId, table.userId),
    householdIdx: index("member_profile_household_idx").on(table.householdId),
  })
);

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    householdId: text("household_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"), // chores, homework, shopping, appointments, custom
    priority: smallint("priority").notNull().default(1), // 0=low, 1=med, 2=high
    assignedTo: text("assigned_to").references(() => user.id),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    pointValue: integer("point_value").notNull().default(0),
    estimateMinutes: integer("estimate_minutes"),
    dueAt: timestamp("due_at"),
    recurrenceRule: text("recurrence_rule"), // RFC5545 RRULE string
    recurrenceEnd: timestamp("recurrence_end"),
    isTemplateOrigin: text("is_template_origin"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"), // soft delete
  },
  (table) => ({
    householdIdx: index("tasks_household_idx").on(table.householdId),
    assignedToIdx: index("tasks_assigned_to_idx").on(table.householdId, table.assignedTo),
    dueAtIdx: index("tasks_due_at_idx").on(table.householdId, table.dueAt),
  })
);

export const taskOccurrences = pgTable(
  "task_occurrences",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    householdId: text("household_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    occurrenceDate: date("occurrence_date").notNull(),
    status: text("status").notNull().default("todo"), // todo | in_progress | pending_approval | completed | skipped
    completedBy: text("completed_by").references(() => user.id),
    completedAt: timestamp("completed_at"),
    approvedBy: text("approved_by").references(() => user.id),
    pointsAwarded: integer("points_awarded").notNull().default(0),
  },
  (table) => ({
    uniqueTaskDate: unique().on(table.taskId, table.occurrenceDate),
    householdDateStatusIdx: index("occurrences_household_date_status_idx").on(
      table.householdId,
      table.occurrenceDate,
      table.status
    ),
    completedByIdx: index("occurrences_completed_by_idx").on(table.householdId, table.completedBy),
  })
);

export const subtasks = pgTable(
  "subtasks",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    householdId: text("household_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    isDone: boolean("is_done").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    taskIdx: index("subtasks_task_idx").on(table.taskId),
  })
);

export const taskTemplates = pgTable("task_templates", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  householdId: text("household_id").references(() => organization.id, { onDelete: "cascade" }), // null = global system template
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  defaultPointValue: integer("default_point_value").notNull().default(0),
  defaultEstimateMinutes: integer("default_estimate_minutes"),
  suggestedRecurrence: text("suggested_recurrence"), // RRULE
});

export const rewards = pgTable(
  "rewards",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    householdId: text("household_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    pointCost: integer("point_cost").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    householdIdx: index("rewards_household_idx").on(table.householdId),
  })
);

export const rewardRedemptions = pgTable(
  "reward_redemptions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    householdId: text("household_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rewardId: text("reward_id")
      .notNull()
      .references(() => rewards.id),
    pointsSpent: integer("points_spent").notNull(),
    status: text("status").notNull().default("pending"), // pending | approved | fulfilled | denied
    approvedBy: text("approved_by").references(() => user.id),
    redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
  },
  (table) => ({
    householdIdx: index("redemptions_household_idx").on(table.householdId),
    userIdx: index("redemptions_user_idx").on(table.userId),
  })
);

export const pointsLedger = pgTable(
  "points_ledger",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    householdId: text("household_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(), // +earn / -spend
    reason: text("reason").notNull(), // task_completed | reward_redeemed | manual_adjust
    refOccurrenceId: text("ref_occurrence_id").references(() => taskOccurrences.id),
    refRedemptionId: text("ref_redemption_id").references(() => rewardRedemptions.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    householdUserIdx: index("ledger_household_user_idx").on(table.householdId, table.userId),
    createdAtIdx: index("ledger_created_at_idx").on(table.createdAt),
  })
);

export const activityLog = pgTable(
  "activity_log",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    householdId: text("household_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    actionType: text("action_type").notNull(), // task_created | assigned | completed | approved | reward_redeemed | member_joined
    taskId: text("task_id").references(() => tasks.id),
    pointsChange: integer("points_change").notNull().default(0),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    householdCreatedIdx: index("activity_household_created_idx").on(table.householdId, table.createdAt),
  })
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    householdId: text("household_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    householdUserIdx: index("push_household_user_idx").on(table.householdId, table.userId),
  })
);
