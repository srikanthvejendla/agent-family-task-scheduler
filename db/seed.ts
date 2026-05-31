import { db } from "./client";
import { taskTemplates } from "./schema";
import { sql } from "drizzle-orm";

const systemTemplates = [
  {
    title: "Take out trash",
    description: "Empty all trash cans and take to curb",
    category: "chores",
    defaultPointValue: 10,
    defaultEstimateMinutes: 10,
    suggestedRecurrence: "FREQ=WEEKLY;BYDAY=MO",
  },
  {
    title: "Do dishes",
    description: "Wash, dry, and put away all dishes",
    category: "chores",
    defaultPointValue: 15,
    defaultEstimateMinutes: 20,
    suggestedRecurrence: "FREQ=DAILY",
  },
  {
    title: "Clean room",
    description: "Tidy up bedroom, make bed, put away clothes",
    category: "chores",
    defaultPointValue: 20,
    defaultEstimateMinutes: 30,
    suggestedRecurrence: "FREQ=WEEKLY;BYDAY=SA",
  },
  {
    title: "Vacuum floors",
    description: "Vacuum all carpeted areas",
    category: "chores",
    defaultPointValue: 15,
    defaultEstimateMinutes: 25,
    suggestedRecurrence: "FREQ=WEEKLY;BYDAY=SA",
  },
  {
    title: "Feed pets",
    description: "Feed and give water to pets",
    category: "chores",
    defaultPointValue: 5,
    defaultEstimateMinutes: 5,
    suggestedRecurrence: "FREQ=DAILY",
  },
  {
    title: "Homework",
    description: "Complete daily homework assignments",
    category: "homework",
    defaultPointValue: 25,
    defaultEstimateMinutes: 60,
    suggestedRecurrence: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
  },
  {
    title: "Practice instrument",
    description: "Practice musical instrument",
    category: "homework",
    defaultPointValue: 20,
    defaultEstimateMinutes: 30,
    suggestedRecurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
  },
  {
    title: "Water plants",
    description: "Water indoor and outdoor plants",
    category: "chores",
    defaultPointValue: 10,
    defaultEstimateMinutes: 15,
    suggestedRecurrence: "FREQ=WEEKLY;BYDAY=WE,SA",
  },
  {
    title: "Fold laundry",
    description: "Fold and put away clean laundry",
    category: "chores",
    defaultPointValue: 15,
    defaultEstimateMinutes: 20,
    suggestedRecurrence: "FREQ=WEEKLY;BYDAY=SU",
  },
  {
    title: "Set dinner table",
    description: "Set table before dinner",
    category: "chores",
    defaultPointValue: 5,
    defaultEstimateMinutes: 5,
    suggestedRecurrence: "FREQ=DAILY",
  },
];

async function seed() {
  console.log("Seeding database with system task templates...");

  try {
    // Insert system templates idempotently
    for (const template of systemTemplates) {
      await db
        .insert(taskTemplates)
        .values({
          ...template,
          householdId: null, // null = global system template
        })
        .onConflictDoNothing();
    }

    console.log(`✓ Seeded ${systemTemplates.length} system task templates`);

    // Verify
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(taskTemplates)
      .where(sql`household_id IS NULL`);

    console.log(`✓ Total system templates in DB: ${count[0].count}`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
