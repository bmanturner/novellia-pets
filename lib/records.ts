import type { MedicalRecord } from "@/db/models/medical-record";
import { MEDICAL_RECORD_TYPE_IDS } from "@/db/models/medical-record-type";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";

export const RECORD_TYPE_PLURALS: Record<MedicalRecordTypeId, string> = {
  vaccination: "Vaccinations",
  medication: "Medications",
  visit: "Vet visits",
  condition: "Allergies & conditions",
};

function firstValue(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" ? first : undefined;
}

/** Records-tab filters from raw search params: first value of each, validated. */
export function parseRecordFilters(
  type: unknown,
  q: unknown,
): { type?: MedicalRecordTypeId; q?: string } {
  const rawType = firstValue(type);
  const query = firstValue(q)?.trim().slice(0, 100);
  return {
    type: MEDICAL_RECORD_TYPE_IDS.find((id) => id === rawType),
    q: query || undefined,
  };
}

/** One-line summary of a record's type-specific details, or `null`. */
export function recordSummary(record: MedicalRecord): string | null {
  const parts: (string | null)[] = [];
  switch (record.typeId) {
    case "vaccination":
      parts.push(
        record.details.clinic,
        record.details.lotNumber && `Lot ${record.details.lotNumber}`,
      );
      break;
    case "medication":
      parts.push(
        record.details.dosage,
        record.details.frequency,
        record.details.prescribedBy &&
          `Prescribed by ${record.details.prescribedBy}`,
      );
      break;
    case "visit": {
      const { weight } = record.details;
      parts.push(
        record.details.clinic,
        record.details.veterinarian,
        weight && `${weight.value} ${weight.unit}`,
      );
      break;
    }
    case "condition": {
      const { kind, severity, reaction } = record.details;
      parts.push(
        kind === "allergy" ? "Allergy" : "Condition",
        severity && severity[0].toUpperCase() + severity.slice(1),
        reaction,
      );
      break;
    }
  }
  const present = parts.filter(Boolean);
  return present.length > 0 ? present.join(" · ") : null;
}

/** Distinct titles per type for autocomplete, first-seen casing, sorted. */
export function titleSuggestions(
  records: MedicalRecord[],
): Record<MedicalRecordTypeId, string[]> {
  const byType: Record<MedicalRecordTypeId, Map<string, string>> = {
    vaccination: new Map(),
    medication: new Map(),
    visit: new Map(),
    condition: new Map(),
  };
  for (const record of records) {
    const title = record.title.trim();
    const key = title.toLowerCase();
    if (title && !byType[record.typeId].has(key)) {
      byType[record.typeId].set(key, title);
    }
  }
  return {
    vaccination: [...byType.vaccination.values()].sort((a, b) =>
      a.localeCompare(b),
    ),
    medication: [...byType.medication.values()].sort((a, b) =>
      a.localeCompare(b),
    ),
    visit: [...byType.visit.values()].sort((a, b) => a.localeCompare(b)),
    condition: [...byType.condition.values()].sort((a, b) =>
      a.localeCompare(b),
    ),
  };
}
