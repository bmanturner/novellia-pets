import type {
  ActiveCondition,
  ActiveMedication,
  LastVisit,
  LatestVaccination,
} from "@/db/models/care";
import { Field } from "@/components/field";
import { formatDate } from "@/lib/format";

const HEADING = "text-[22px] leading-7 font-bold tracking-[-0.01em]";
const LIST =
  "divide-y divide-rule rounded-xl border border-rule bg-page";
const ROW = "px-4 py-4 sm:px-5";
const SMALL_CAPS =
  "text-[11px] leading-4 font-semibold tracking-[0.08em] text-ink-muted uppercase";

function SectionHeading({
  id,
  title,
  count,
}: {
  id: string;
  title: string;
  count?: number;
}) {
  return (
    <h2 id={id} className={`mb-3 ${HEADING}`}>
      {title}
      {count !== undefined && count > 0 && (
        <>
          {" "}
          <span className="font-normal text-ink-muted">{count}</span>
        </>
      )}
    </h2>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-rule bg-page px-4 py-4 text-[14px] text-ink-muted sm:px-5">
      {children}
    </p>
  );
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function Conditions({ conditions }: { conditions: ActiveCondition[] }) {
  return (
    <section aria-labelledby="conditions-heading" className="min-w-0">
      <SectionHeading
        id="conditions-heading"
        title="Allergies & conditions"
        count={conditions.length}
      />
      {conditions.length > 0 ? (
        <ul className={LIST}>
          {conditions.map((condition) => (
            <li key={condition.recordId} className={ROW}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="min-w-0 text-[16px] leading-6 font-bold break-words">
                  {condition.title}
                </p>
                <p className="shrink-0 text-right text-[14px] leading-5 text-ink-muted">
                  {capitalise(condition.kind)}
                  {condition.severity && ` · ${capitalise(condition.severity)}`}
                </p>
              </div>
              {condition.reaction && (
                <div className="mt-2">
                  <p className={SMALL_CAPS}>Reaction</p>
                  <p className="text-[14px] leading-5 whitespace-pre-line">
                    {condition.reaction}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyCard>None on file.</EmptyCard>
      )}
    </section>
  );
}

export function Medications({
  medications,
  today,
}: {
  medications: ActiveMedication[];
  today: string;
}) {
  return (
    <section aria-labelledby="medications-heading" className="min-w-0">
      <SectionHeading
        id="medications-heading"
        title="Current medications"
        count={medications.length}
      />
      {medications.length > 0 ? (
        <ul className={LIST}>
          {medications.map((medication) => {
            const dose = [medication.dosage, medication.frequency]
              .filter(Boolean)
              .join(" · ");
            return (
              <li
                key={medication.recordId}
                className={`flex items-start justify-between gap-4 ${ROW}`}
              >
                <div className="min-w-0">
                  <p className="text-[16px] leading-6 font-bold break-words">
                    {medication.title}
                  </p>
                  {dose && <p className="text-[14px] leading-5">{dose}</p>}
                  {medication.prescribedBy && (
                    <p className="text-[14px] leading-5 text-ink-muted">
                      Prescribed by {medication.prescribedBy}
                    </p>
                  )}
                </div>
                {(medication.refillOn || medication.endsOn) && (
                  <div className="shrink-0 text-right">
                    {medication.refillOn && (
                      <>
                        <p className={SMALL_CAPS}>Refill</p>
                        <p className="text-[14px] leading-5">
                          <time dateTime={medication.refillOn}>
                            {formatDate(medication.refillOn, today)}
                          </time>
                        </p>
                      </>
                    )}
                    {medication.endsOn && (
                      <p className="text-[13px] leading-5 text-ink-muted">
                        Until{" "}
                        <time dateTime={medication.endsOn}>
                          {formatDate(medication.endsOn, today)}
                        </time>
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyCard>No current medications.</EmptyCard>
      )}
    </section>
  );
}

export function Vaccinations({
  vaccinations,
  today,
}: {
  vaccinations: LatestVaccination[];
  today: string;
}) {
  return (
    <section aria-labelledby="vaccinations-heading" className="min-w-0">
      <SectionHeading
        id="vaccinations-heading"
        title="Vaccinations"
        count={vaccinations.length}
      />
      {vaccinations.length > 0 ? (
        <ul className={LIST}>
          {vaccinations.map((vaccination) => (
            <li
              key={vaccination.recordId}
              className={`flex items-start justify-between gap-4 ${ROW}`}
            >
              <div className="min-w-0">
                <p className="text-[16px] leading-6 font-bold break-words">
                  {vaccination.title}
                </p>
                <p className="text-[14px] leading-5 text-ink-muted">
                  Given {formatDate(vaccination.givenOn, today)}
                  {vaccination.clinic && ` · ${vaccination.clinic}`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {vaccination.dueOn ? (
                  <>
                    <p className={SMALL_CAPS}>
                      {vaccination.dueOn < today ? "Was due" : "Due"}
                    </p>
                    <p className="text-[14px] leading-5">
                      <time dateTime={vaccination.dueOn}>
                        {formatDate(vaccination.dueOn, today)}
                      </time>
                    </p>
                  </>
                ) : (
                  <p className="text-[14px] leading-5 text-ink-muted">
                    No due date
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyCard>No vaccinations on file.</EmptyCard>
      )}
    </section>
  );
}

export function LastVisitCard({
  visit,
  today,
}: {
  visit: LastVisit | null;
  today: string;
}) {
  return (
    <section aria-labelledby="last-visit-heading" className="min-w-0">
      <SectionHeading id="last-visit-heading" title="Last vet visit" />
      {visit ? (
        <div className={`rounded-xl border border-rule bg-page ${ROW}`}>
          <p className="text-[16px] leading-6 font-bold break-words">
            {visit.title}
          </p>
          <p className="text-[14px] leading-5 text-ink-muted">
            <time dateTime={visit.occurredOn}>
              {formatDate(visit.occurredOn, today)}
            </time>
          </p>
          {(visit.clinic || visit.veterinarian || visit.weight) && (
            <dl className="mt-3 grid grid-cols-3 gap-x-4 gap-y-2">
              {visit.clinic && <Field label="Clinic">{visit.clinic}</Field>}
              {visit.veterinarian && (
                <Field label="Veterinarian">{visit.veterinarian}</Field>
              )}
              {visit.weight && (
                <Field label="Weight">
                  {visit.weight.value} {visit.weight.unit}
                </Field>
              )}
            </dl>
          )}
        </div>
      ) : (
        <EmptyCard>No vet visits on file.</EmptyCard>
      )}
    </section>
  );
}
