"use client";

import { useActionState, useState } from "react";
import { saveRecordAction } from "@/app/pets/actions";
import {
  DateShortcuts,
  FormField,
  FormFooter,
  Input,
  LABEL_CLASS,
  RadioFieldset,
  ScopedForm,
  Select,
  Textarea,
  useListId,
} from "@/components/forms/form-controls";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";
import type { FormState, FormValues } from "@/lib/forms";

const TITLE_LABELS: Record<MedicalRecordTypeId, string> = {
  vaccination: "Vaccine",
  medication: "Medication",
  visit: "Reason for visit",
  condition: "Allergy or condition",
};

const RECORD_TYPE_IDS = Object.keys(TITLE_LABELS) as MedicalRecordTypeId[];

const SEGMENT_TRACK =
  "grid grid-cols-2 gap-1 rounded-lg border border-rule bg-page p-1 sm:inline-flex sm:flex-wrap";
const SEGMENT =
  "flex min-h-11 min-w-0 cursor-pointer items-center justify-center rounded-md px-3 py-1 text-center text-[14px] leading-5 text-ink transition-colors duration-150 hover:bg-page-tint has-[:checked]:bg-cover has-[:checked]:font-semibold has-[:checked]:text-cover-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus sm:min-h-8 sm:justify-start";

type Fields = {
  values: FormValues;
  errors: Record<string, string>;
  /** Anchor for date shortcuts that count from today. */
  today: string;
};

const NEXT_YEAR = { label: "Next year", months: 12 };
const NEXT_3_YEARS = { label: "+3 years", months: 36 };
const NEXT_MONTH = { label: "Next month", months: 1 };

function VaccinationFields({ values, errors, today }: Fields) {
  return (
    <>
      <FormField
        label="Date given"
        name="occurredOn"
        error={errors.occurredOn}
        required
      >
        <Input
          name="occurredOn"
          type="date"
          required
          defaultValue={values.occurredOn}
          error={errors.occurredOn}
        />
      </FormField>
      <FormField label="Next due" name="dueOn" error={errors.dueOn}>
        <Input
          name="dueOn"
          type="date"
          defaultValue={values.dueOn}
          error={errors.dueOn}
        />
        {/* Boosters fall due a set time after the shot, even a past one. */}
        <DateShortcuts
          name="dueOn"
          label="Next due"
          from={{ name: "occurredOn", label: "the date given" }}
          today={today}
          options={[NEXT_YEAR, NEXT_3_YEARS]}
        />
      </FormField>
    </>
  );
}

function VaccinationMore({ values, errors }: Fields) {
  return (
    <>
      <FormField label="Clinic" name="clinic" error={errors.clinic}>
        <Input
          name="clinic"
          maxLength={200}
          defaultValue={values.clinic}
          error={errors.clinic}
        />
      </FormField>
      <FormField label="Lot number" name="lotNumber" error={errors.lotNumber}>
        <Input
          name="lotNumber"
          maxLength={100}
          autoComplete="off"
          defaultValue={values.lotNumber}
          error={errors.lotNumber}
        />
      </FormField>
    </>
  );
}

function MedicationFields({ values, errors, today }: Fields) {
  return (
    <>
      <FormField
        label="Started"
        name="occurredOn"
        error={errors.occurredOn}
        required
      >
        <Input
          name="occurredOn"
          type="date"
          required
          defaultValue={values.occurredOn}
          error={errors.occurredOn}
        />
      </FormField>
      <FormField label="Stopped" name="endedOn" error={errors.endedOn}>
        <Input
          name="endedOn"
          type="date"
          defaultValue={values.endedOn}
          error={errors.endedOn}
        />
      </FormField>
      <FormField
        label="Refill or recheck due"
        name="dueOn"
        error={errors.dueOn}
      >
        <Input
          name="dueOn"
          type="date"
          defaultValue={values.dueOn}
          error={errors.dueOn}
        />
        {/* A refill counts from now, not from when the medication started. */}
        <DateShortcuts
          name="dueOn"
          label="Refill or recheck due"
          today={today}
          options={[NEXT_MONTH]}
        />
      </FormField>
    </>
  );
}

function MedicationMore({ values, errors }: Fields) {
  return (
    <>
      <FormField label="Dosage" name="dosage" error={errors.dosage}>
        <Input
          name="dosage"
          maxLength={100}
          defaultValue={values.dosage}
          error={errors.dosage}
        />
      </FormField>
      <FormField label="Frequency" name="frequency" error={errors.frequency}>
        <Input
          name="frequency"
          maxLength={100}
          defaultValue={values.frequency}
          error={errors.frequency}
        />
      </FormField>
      <FormField
        label="Prescribed by"
        name="prescribedBy"
        error={errors.prescribedBy}
      >
        <Input
          name="prescribedBy"
          maxLength={200}
          defaultValue={values.prescribedBy}
          error={errors.prescribedBy}
        />
      </FormField>
    </>
  );
}

function VisitFields({ values, errors, today }: Fields) {
  return (
    <>
      <FormField
        label="Visit date"
        name="occurredOn"
        error={errors.occurredOn}
        required
      >
        <Input
          name="occurredOn"
          type="date"
          required
          defaultValue={values.occurredOn}
          error={errors.occurredOn}
        />
      </FormField>
      <FormField label="Next checkup due" name="dueOn" error={errors.dueOn}>
        <Input
          name="dueOn"
          type="date"
          defaultValue={values.dueOn}
          error={errors.dueOn}
        />
        {/* Annual exams come back in a year; rechecks usually within a month. */}
        <DateShortcuts
          name="dueOn"
          label="Next checkup due"
          from={{ name: "occurredOn", label: "the visit date" }}
          today={today}
          options={[NEXT_YEAR, NEXT_MONTH]}
        />
      </FormField>
      <FormField label="Clinic" name="clinic" error={errors.clinic}>
        <Input
          name="clinic"
          maxLength={200}
          defaultValue={values.clinic}
          error={errors.clinic}
        />
      </FormField>
      <FormField
        label="Veterinarian"
        name="veterinarian"
        error={errors.veterinarian}
      >
        <Input
          name="veterinarian"
          maxLength={200}
          defaultValue={values.veterinarian}
          error={errors.veterinarian}
        />
      </FormField>
      <FormField label="Weight" name="weightValue" error={errors.weightValue}>
        <div className="flex gap-2">
          <Input
            name="weightValue"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            defaultValue={values.weightValue}
            error={errors.weightValue}
          />
          <div className="w-24 shrink-0">
            <Select
              name="weightUnit"
              aria-label="Weight unit"
              defaultValue={values.weightUnit || "kg"}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </Select>
          </div>
        </div>
      </FormField>
    </>
  );
}

function ConditionFields({ values, errors }: Fields) {
  const kind = values.kind || "allergy";
  return (
    <>
      <RadioFieldset legend="Kind" name="kind" error={errors.kind}>
        <div className={SEGMENT_TRACK}>
          {[
            ["allergy", "Allergy"],
            ["condition", "Condition"],
          ].map(([value, label]) => (
            <label key={value} className={SEGMENT}>
              <input
                type="radio"
                name="kind"
                value={value}
                required
                defaultChecked={kind === value}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </RadioFieldset>
      <FormField label="Severity" name="severity" error={errors.severity}>
        <Select
          name="severity"
          defaultValue={values.severity}
          error={errors.severity}
        >
          <option value="">Not recorded</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </Select>
      </FormField>
      <FormField
        label="First noted"
        name="occurredOn"
        error={errors.occurredOn}
      >
        <Input
          name="occurredOn"
          type="date"
          defaultValue={values.occurredOn}
          error={errors.occurredOn}
        />
      </FormField>
      <FormField label="Resolved" name="endedOn" error={errors.endedOn}>
        <Input
          name="endedOn"
          type="date"
          defaultValue={values.endedOn}
          error={errors.endedOn}
        />
      </FormField>
      <FormField
        label="Reaction or symptoms"
        name="reaction"
        error={errors.reaction}
        className="sm:col-span-2"
      >
        <Textarea
          name="reaction"
          maxLength={500}
          defaultValue={values.reaction}
          error={errors.reaction}
        />
      </FormField>
    </>
  );
}

const TYPE_FIELDS: Record<
  MedicalRecordTypeId,
  (props: Fields) => React.ReactNode
> = {
  vaccination: VaccinationFields,
  medication: MedicationFields,
  visit: VisitFields,
  condition: ConditionFields,
};

/** Secondary fields a dose or refill log tucks behind "More details". */
const TYPE_MORE: Partial<
  Record<MedicalRecordTypeId, (props: Fields) => React.ReactNode>
> = {
  vaccination: VaccinationMore,
  medication: MedicationMore,
};

/** Native disclosure; the summary is a full 44px target. */
function MoreDetails({
  open,
  summary,
  children,
}: {
  open: boolean;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="group min-w-0 sm:col-span-2">
      <summary className="flex min-h-11 cursor-pointer items-center gap-1.5 text-[14px] font-semibold leading-5 text-cover outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus">
        <span className="shrink-0 group-open:hidden">More details</span>
        <span className="hidden shrink-0 group-open:inline">Fewer details</span>
        {summary && (
          <span className="min-w-0 truncate font-normal text-ink-muted group-open:hidden">
            · {summary}
          </span>
        )}
      </summary>
      <div className="grid gap-4 pt-1 sm:grid-cols-2">{children}</div>
    </details>
  );
}

export function RecordForm({
  mode,
  log,
  petId,
  petName,
  recordId,
  initialValues,
  typeNames,
  suggestions,
  from,
  filters,
  cancelHref,
  today,
}: {
  mode: "create" | "edit";
  /**
   * Logging a known dose or refill from Next due: the type and title are
   * fixed by the link, dates are prefilled and the rest sits behind a
   * disclosure.
   */
  log?: { verb: string; dueNote?: string };
  petId: number;
  petName: string;
  recordId?: number;
  initialValues: FormValues;
  typeNames: Record<MedicalRecordTypeId, string>;
  suggestions: Record<MedicalRecordTypeId, string[]>;
  from?: "home";
  filters?: { type?: MedicalRecordTypeId; q?: string };
  cancelHref: string;
  /** Default date for a newly picked type; conditions start blank. */
  today: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveRecordAction,
    { values: initialValues, errors: {}, formError: null },
  );
  const [typeId, setTypeId] = useState(
    initialValues.typeId as MedicalRecordTypeId,
  );
  // React resets the form after every action, which puts the type radios back
  // on their first option. Re-mounting them per result (and re-syncing the
  // type to the submitted one) keeps the checked radio and the fields shown
  // in step.
  const [seenState, setSeenState] = useState(state);
  const [resultVersion, setResultVersion] = useState(0);
  if (seenState !== state) {
    setSeenState(state);
    setResultVersion(resultVersion + 1);
    if (state.values.typeId in TITLE_LABELS) {
      setTypeId(state.values.typeId as MedicalRecordTypeId);
    }
  }
  const { values, errors } = state;
  const TypeFields = TYPE_FIELDS[typeId];
  const MoreFields = TYPE_MORE[typeId];
  // Switching type in the create form remounts that type's fields; give them
  // the new type's date default rather than the one picked for the first type.
  const typeValues =
    typeId === values.typeId
      ? values
      : { ...values, occurredOn: typeId === "condition" ? "" : today };

  return (
    <ScopedForm action={formAction} errors={errors}>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-4 text-[14px] text-ink-muted">
          <p>
            For <strong className="font-semibold text-ink">{petName}</strong>
          </p>
          {log?.dueNote && <p className="mt-1">{log.dueNote}</p>}
        </div>
        {state.formError && (
          <p role="alert" className="mb-4 text-[14px] text-danger">
            {state.formError}
          </p>
        )}
        <input type="hidden" name="petId" value={petId} />
        {mode === "edit" && recordId !== undefined && (
          <input type="hidden" name="recordId" value={recordId} />
        )}
        {from && <input type="hidden" name="from" value={from} />}
        <input type="hidden" name="filterType" value={filters?.type ?? ""} />
        <input type="hidden" name="filterQuery" value={filters?.q ?? ""} />

        <div key={resultVersion} className="grid gap-4 sm:grid-cols-2">
          {log ? (
            <>
              <input type="hidden" name="typeId" value={typeId} />
              <input type="hidden" name="title" value={values.title ?? ""} />
            </>
          ) : (
            <>
              <div className="min-w-0 sm:col-span-2">
                {mode === "create" ? (
                  <RadioFieldset
                    legend="Record type"
                    name="typeId"
                    error={errors.typeId}
                  >
                    <div className={SEGMENT_TRACK}>
                      {RECORD_TYPE_IDS.map((id) => (
                        <label key={id} className={SEGMENT}>
                          <input
                            type="radio"
                            name="typeId"
                            value={id}
                            checked={typeId === id}
                            onChange={() => setTypeId(id)}
                            className="sr-only"
                          />
                          {typeNames[id]}
                        </label>
                      ))}
                    </div>
                  </RadioFieldset>
                ) : (
                  <>
                    <input type="hidden" name="typeId" value={typeId} />
                    <p className={LABEL_CLASS}>Record type</p>
                    <p className="text-[15px]">{typeNames[typeId]}</p>
                  </>
                )}
              </div>

              <TitleField
                label={TITLE_LABELS[typeId]}
                value={values.title}
                error={errors.title}
                suggestions={suggestions[typeId]}
              />
            </>
          )}

          <TypeFields
            key={typeId}
            values={typeValues}
            errors={errors}
            today={today}
          />

          {log ? (
            <MoreDetails
              summary={["clinic", "dosage", "frequency", "prescribedBy"]
                .map((name) => typeValues[name]?.trim())
                .filter(Boolean)
                .join(", ")}
              open={[
                "clinic",
                "lotNumber",
                "dosage",
                "frequency",
                "prescribedBy",
                "notes",
              ].some((name) => errors[name])}
            >
              {MoreFields && (
                <MoreFields
                  key={typeId}
                  values={typeValues}
                  errors={errors}
                  today={today}
                />
              )}
              <NotesField values={values} errors={errors} />
            </MoreDetails>
          ) : (
            <>
              {MoreFields && (
                <MoreFields
                  key={typeId}
                  values={typeValues}
                  errors={errors}
                  today={today}
                />
              )}
              <NotesField values={values} errors={errors} />
            </>
          )}
        </div>
      </div>
      <FormFooter
        submitLabel={log?.verb ?? "Save record"}
        pendingLabel={log ? "Logging…" : "Saving…"}
        cancelHref={cancelHref}
      />
    </ScopedForm>
  );
}

function NotesField({
  values,
  errors,
}: {
  values: FormValues;
  errors: Record<string, string>;
}) {
  return (
    <FormField
      label="Notes"
      name="notes"
      error={errors.notes}
      className="sm:col-span-2"
    >
      <Textarea
        name="notes"
        maxLength={2000}
        defaultValue={values.notes}
        error={errors.notes}
      />
    </FormField>
  );
}

function TitleField({
  label,
  value,
  error,
  suggestions,
}: {
  label: string;
  value: string | undefined;
  error: string | undefined;
  suggestions: string[];
}) {
  const listId = useListId("title");
  return (
    <FormField
      label={label}
      name="title"
      error={error}
      className="sm:col-span-2"
      required
    >
      <Input
        name="title"
        required
        maxLength={200}
        list={listId}
        autoComplete="off"
        defaultValue={value}
        error={error}
      />
      <datalist id={listId}>
        {suggestions.map((title) => (
          <option key={title} value={title} />
        ))}
      </datalist>
    </FormField>
  );
}
