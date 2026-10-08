import { sql } from "kysely";
import type { Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time.

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("species")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("emoji", "text", (col) => col.notNull())
    .addColumn("sort_order", "integer", (col) => col.notNull())
    .execute();

  await db
    .insertInto("species")
    .values(
      [
        ["dog", "Dog", "🐶"],
        ["cat", "Cat", "🐱"],
        ["rabbit", "Rabbit", "🐰"],
        ["hamster", "Hamster", "🐹"],
        ["mouse", "Mouse", "🐭"],
        ["rat", "Rat", "🐀"],
        ["hedgehog", "Hedgehog", "🦔"],
        ["bird", "Bird", "🦜"],
        ["chicken", "Chicken", "🐔"],
        ["fish", "Fish", "🐠"],
        ["turtle", "Turtle", "🐢"],
        ["lizard", "Lizard", "🦎"],
        ["snake", "Snake", "🐍"],
        ["horse", "Horse", "🐴"],
        ["other", "Other", "🐾"],
      ].map(([id, name, emoji], i) => ({ id, name, emoji, sort_order: i + 1 })),
    )
    .execute();

  await db.schema
    .createTable("medical_record_type")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("sort_order", "integer", (col) => col.notNull())
    .execute();

  await db
    .insertInto("medical_record_type")
    .values(
      [
        ["vaccination", "Vaccination"],
        ["medication", "Medication"],
        ["visit", "Vet visit"],
        ["condition", "Allergy or condition"],
      ].map(([id, name], i) => ({ id, name, sort_order: i + 1 })),
    )
    .execute();

  await db.schema
    .createTable("household")
    .addColumn("id", "integer", (col) => col.primaryKey().notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("created_at", "text", (col) => col.notNull().defaultTo(now))
    .execute();

  await db.schema
    .createTable("pet")
    .addColumn("id", "integer", (col) => col.primaryKey().notNull())
    .addColumn("household_id", "integer", (col) =>
      col.notNull().references("household.id").onDelete("cascade"),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("species_id", "text", (col) =>
      col.notNull().references("species.id"),
    )
    .addColumn("breed", "text")
    .addColumn("sex", "text", (col) =>
      col
        .notNull()
        .defaultTo("unknown")
        .check(sql`sex in ('female', 'male', 'unknown')`),
    )
    .addColumn("neutered", "integer", (col) =>
      col.check(sql`neutered in (0, 1)`),
    )
    .addColumn("date_of_birth", "text")
    .addColumn("microchip_id", "text")
    .addColumn("notes", "text")
    .addColumn("created_at", "text", (col) => col.notNull().defaultTo(now))
    .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(now))
    .execute();

  await db.schema
    .createIndex("pet_household_id_index")
    .on("pet")
    .column("household_id")
    .execute();

  await db.schema
    .createTable("medical_record")
    .addColumn("id", "integer", (col) => col.primaryKey().notNull())
    .addColumn("pet_id", "integer", (col) =>
      col.notNull().references("pet.id").onDelete("cascade"),
    )
    .addColumn("type_id", "text", (col) =>
      col.notNull().references("medical_record_type.id"),
    )
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("occurred_on", "text")
    .addColumn("ended_on", "text")
    .addColumn("due_on", "text")
    .addColumn("notes", "text")
    .addColumn("details", "text", (col) => col.notNull().defaultTo("{}"))
    .addColumn("created_at", "text", (col) => col.notNull().defaultTo(now))
    .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(now))
    .execute();

  await db.schema
    .createIndex("medical_record_pet_id_type_id_index")
    .on("medical_record")
    .columns(["pet_id", "type_id"])
    .execute();

  await db.schema
    .createIndex("medical_record_due_on_index")
    .on("medical_record")
    .column("due_on")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("medical_record").execute();
  await db.schema.dropTable("pet").execute();
  await db.schema.dropTable("household").execute();
  await db.schema.dropTable("medical_record_type").execute();
  await db.schema.dropTable("species").execute();
}
