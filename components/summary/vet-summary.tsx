import { Field } from "@/components/field";
import { Stamp } from "@/components/stamp";
import type { CareStatus } from "@/db/models/care";
import type { MedicalRecord } from "@/db/models/medical-record";
import { listMedicalRecordTypes } from "@/db/models/medical-record-type";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";
import { formatFullDate, formatLongDate } from "@/lib/format";
import { loadPet, loadPetCare, loadPetRecords } from "@/lib/pet-data";
import { recordStatusLine, recordSummary } from "@/lib/records";
import { SummaryToolbar } from "./summary-toolbar";
import { WalletCard } from "./wallet-card";

type SearchParams = Record<string, string | string[] | undefined>;

const LABEL =
  "text-[11px] leading-4 font-semibold tracking-[0.08em] text-ink-muted uppercase";

const ROW = "py-3 break-inside-avoid";

const STAMP_KEY: { status: CareStatus; meaning: string }[] = [
  { status: "overdue", meaning: "Due date has passed" },
  { status: "due-soon", meaning: "Due within 30 days" },
  { status: "up-to-date", meaning: "Not due within 30 days" },
];

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function joinPresent(parts: (string | null | false | undefined)[]): string {
  return parts.filter(Boolean).join(" · ");
}

function DateText({ date }: { date: string }) {
  return <time dateTime={date}>{formatFullDate(date)}</time>;
}

function Section({
  id,
  title,
  count,
  className = "",
  children,
}: {
  id: string;
  title: string;
  count?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={className}>
      <h2
        id={id}
        className="mb-1 flex items-baseline gap-2 border-b border-rule-strong pb-2 text-[16px] leading-6 font-bold break-after-avoid"
      >
        {title}
        {count ? (
          <span className="text-[14px] font-normal text-ink-muted">
            {count}
          </span>
        ) : null}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-3 text-[14px] leading-5 text-ink-muted">{children}</p>
  );
}

/** One pet's printable handover: wallet card, then the clinical sheet. */
export async function VetSummary({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [{ pet, today }, care, records, types] = await Promise.all([
    loadPet(id),
    loadPetCare(id),
    loadPetRecords(id),
    listMedicalRecordTypes(),
  ]);
  const historyParam = Array.isArray(query.history)
    ? query.history[0]
    : query.history;
  const history = historyParam === "1";
  const typeNames = Object.fromEntries(
    types.map((type) => [type.id, type.name]),
  ) as Record<MedicalRecordTypeId, string>;

  const years = new Map<string, MedicalRecord[]>();
  if (history) {
    for (const record of records) {
      const year = record.occurredOn?.slice(0, 4) ?? "Date not recorded";
      const group = years.get(year);
      if (group) group.push(record);
      else years.set(year, [record]);
    }
  }

  return (
    <>
      <SummaryToolbar
        petId={pet.id}
        petName={pet.name}
        history={history}
        recordCount={records.length}
      />

      <article
        aria-labelledby="summary-title"
        className="rounded-xl border border-rule bg-page p-5 sm:p-8 print:rounded-none print:border-0 print:p-0"
      >
        <div className="grid gap-6 sm:grid-cols-[calc(125mm+18px)_minmax(0,1fr)] sm:items-start sm:gap-8">
          <WalletCard pet={pet} care={care} today={today} />

          <div className="min-w-0">
            <h1
              id="summary-title"
              className="text-[22px] leading-7 font-bold tracking-[-0.01em]"
            >
              Vet summary
            </h1>
            <p className="mt-1 text-[15px] leading-6">
              <span className="font-bold tracking-[0.02em] uppercase">
                {pet.name}
              </span>{" "}
              <span className="text-[14px] text-ink-muted">
                {pet.species.name} · {pet.breed ?? "Breed not recorded"}
              </span>
            </p>
            <p className="mt-3 text-[14px] leading-5">
              As of <time dateTime={today}>{formatLongDate(today, true)}</time>
            </p>
            <p className="mt-1 max-w-[42ch] text-[13px] leading-5 text-ink-muted">
              Kept by the owner in Novellia Pets. Not reviewed by a vet.
            </p>

            <div className="mt-6">
              <p className={LABEL}>Status key</p>
              <dl className="mt-2 space-y-3">
                {STAMP_KEY.map(({ status, meaning }) => (
                  <div key={status} className="flex flex-col items-start gap-1">
                    <dt>
                      <Stamp status={status} tilt={-2} />
                    </dt>
                    <dd className="text-[13px] leading-5">{meaning}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-9 print:mt-8 print:space-y-7">
          <Section
            id="summary-conditions"
            title="Allergies & conditions"
            count={care.conditions.length}
          >
            {care.conditions.length > 0 ? (
              <ul className="divide-y divide-rule">
                {care.conditions.map((condition) => (
                  <li key={condition.recordId} className={ROW}>
                    <p className="text-[15px] leading-6 font-bold break-words">
                      {condition.title}
                    </p>
                    <p className="text-[14px] leading-5 text-ink-muted">
                      {condition.kind === "allergy" ? "Allergy" : "Condition"}
                      {condition.severity && (
                        <>
                          {" · "}
                          <span
                            className={
                              condition.severity === "severe"
                                ? "font-bold text-ink"
                                : ""
                            }
                          >
                            {capitalize(condition.severity)}
                          </span>
                        </>
                      )}
                    </p>
                    {condition.reaction && (
                      <p className="text-[14px] leading-5">
                        Reaction: {condition.reaction}
                      </p>
                    )}
                    {condition.since && (
                      <p className="text-[13px] leading-5 text-ink-muted">
                        Since <DateText date={condition.since} />
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No allergies or conditions recorded.</Empty>
            )}
          </Section>

          <Section
            id="summary-medications"
            title="Current medications"
            count={care.medications.length}
          >
            {care.medications.length > 0 ? (
              <ul className="divide-y divide-rule">
                {care.medications.map((medication) => {
                  const dose = joinPresent([
                    medication.dosage,
                    medication.frequency,
                  ]);
                  return (
                    <li key={medication.recordId} className={ROW}>
                      <p className="text-[15px] leading-6 font-bold break-words">
                        {medication.title}
                      </p>
                      {dose && <p className="text-[14px] leading-5">{dose}</p>}
                      <p className="text-[13px] leading-5 text-ink-muted">
                        {joinPresent([
                          medication.prescribedBy &&
                            `Prescribed by ${medication.prescribedBy}`,
                          `Started ${formatFullDate(medication.startedOn)}`,
                          medication.refillOn &&
                            `Refill or recheck due ${formatFullDate(medication.refillOn)}`,
                        ])}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty>No current medications recorded.</Empty>
            )}
          </Section>

          <Section
            id="summary-vaccinations"
            title="Vaccinations"
            count={care.vaccinations.length}
          >
            {care.vaccinations.length > 0 ? (
              <>
                <table className="hidden w-full text-left text-[14px] leading-5 sm:table print:text-[13px]">
                  <thead>
                    <tr className="border-b border-rule">
                      {["Vaccine", "Given", "Next due", "Clinic", "Lot"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className={`py-2 pr-4 print:pr-3 ${LABEL}`}
                          >
                            {heading}
                          </th>
                        ),
                      )}
                      <th scope="col" className={`py-2 ${LABEL}`}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {care.vaccinations.map((vaccine) => (
                      <tr
                        key={vaccine.recordId}
                        className="border-b border-rule break-inside-avoid last:border-b-0"
                      >
                        <th
                          scope="row"
                          className="py-3 pr-4 font-semibold break-words sm:min-w-[9rem] print:min-w-[7.5rem] print:pr-3"
                        >
                          {vaccine.title}
                        </th>
                        <td className="py-3 pr-4 whitespace-nowrap print:pr-3">
                          <DateText date={vaccine.givenOn} />
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap print:pr-3">
                          {vaccine.dueOn ? (
                            <DateText date={vaccine.dueOn} />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 pr-4 break-words print:pr-3">
                          {vaccine.clinic ?? "—"}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap print:pr-3">
                          {vaccine.lotNumber ?? "—"}
                        </td>
                        <td className="py-3 pr-1">
                          {vaccine.status ? (
                            <Stamp
                              status={vaccine.status}
                              seed={vaccine.recordId}
                            />
                          ) : (
                            <span className="text-[13px] text-ink-muted">
                              No due date
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <ul className="divide-y divide-rule sm:hidden">
                  {care.vaccinations.map((vaccine) => {
                    const where = joinPresent([
                      vaccine.clinic,
                      vaccine.lotNumber && `Lot ${vaccine.lotNumber}`,
                    ]);
                    return (
                      <li key={vaccine.recordId} className={ROW}>
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 text-[15px] leading-6 font-bold break-words">
                            {vaccine.title}
                          </p>
                          {vaccine.status && (
                            <Stamp
                              status={vaccine.status}
                              seed={vaccine.recordId}
                            />
                          )}
                        </div>
                        <p className="text-[13px] leading-5 text-ink-muted">
                          Given {formatFullDate(vaccine.givenOn)} ·{" "}
                          {vaccine.dueOn
                            ? `Next due ${formatFullDate(vaccine.dueOn)}`
                            : "No due date"}
                        </p>
                        {where && (
                          <p className="text-[13px] leading-5 text-ink-muted">
                            {where}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <Empty>No vaccinations recorded.</Empty>
            )}
          </Section>

          <Section
            id="summary-due"
            title="Due care"
            count={care.dueItems.length}
          >
            {care.dueItems.length > 0 ? (
              <ul className="divide-y divide-rule">
                {care.dueItems.map((item) => (
                  <li
                    key={item.recordId}
                    className={`grid grid-cols-[128px_minmax(0,1fr)] items-center gap-3 ${ROW}`}
                  >
                    <div>
                      <Stamp status={item.status} seed={item.recordId} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] leading-6 break-words">
                        <span className="font-bold">{item.title}</span>{" "}
                        <span className="text-[14px] text-ink-muted">
                          {item.typeName}
                        </span>
                      </p>
                      <p className="text-[14px] leading-5">
                        {item.status === "overdue" ? "Was due" : "Due"}{" "}
                        <DateText date={item.dueOn} />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>
                Nothing is overdue or due in the next 30 days.
                {care.nextBeyond && (
                  <>
                    {" "}
                    Next up: {care.nextBeyond.title} on{" "}
                    {formatFullDate(care.nextBeyond.dueOn)}.
                  </>
                )}
              </Empty>
            )}
          </Section>

          <Section id="summary-visit" title="Last vet visit">
            {care.lastVisit ? (
              <div className={ROW}>
                <p className="text-[15px] leading-6 break-words">
                  <span className="font-bold">{care.lastVisit.title}</span>{" "}
                  <span className="text-[14px] text-ink-muted">
                    <DateText date={care.lastVisit.occurredOn} />
                  </span>
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                  <Field label="Clinic">{care.lastVisit.clinic ?? "—"}</Field>
                  <Field label="Veterinarian">
                    {care.lastVisit.veterinarian ?? "—"}
                  </Field>
                  <Field label="Weight">
                    {care.lastVisit.weight
                      ? `${care.lastVisit.weight.value} ${care.lastVisit.weight.unit}`
                      : "—"}
                  </Field>
                </dl>
              </div>
            ) : (
              <Empty>No vet visits recorded.</Empty>
            )}
          </Section>

          {pet.notes && (
            <Section id="summary-notes" title="Notes">
              <p className="max-w-prose py-3 text-[14px] leading-6 whitespace-pre-line">
                {pet.notes}
              </p>
            </Section>
          )}

          {history && (
            <Section
              id="summary-history"
              title="Full history"
              count={records.length}
              className="print:break-before-page"
            >
              {[...years].map(([year, group]) => (
                <div key={year} className="mt-4">
                  <h3 className={`break-after-avoid ${LABEL}`}>{year}</h3>
                  <ul className="divide-y divide-rule">
                    {group.map((record) => {
                      const summary = recordSummary(record);
                      const status = recordStatusLine(record, formatFullDate);
                      return (
                        <li
                          key={record.id}
                          className={`grid grid-cols-[104px_minmax(0,1fr)] gap-x-4 ${ROW}`}
                        >
                          <p className="text-[14px] leading-6 text-ink-muted tabular-nums">
                            {record.occurredOn ? (
                              <DateText date={record.occurredOn} />
                            ) : (
                              "—"
                            )}
                          </p>
                          <div className="min-w-0">
                            <p className="text-[15px] leading-6 break-words">
                              <span className="font-bold">{record.title}</span>{" "}
                              <span className="text-[14px] text-ink-muted">
                                {typeNames[record.typeId]}
                              </span>
                            </p>
                            {summary && (
                              <p className="text-[14px] leading-5">{summary}</p>
                            )}
                            {status && (
                              <p className="text-[13px] leading-5 text-ink-muted">
                                {status}
                              </p>
                            )}
                            {record.notes && (
                              <p className="mt-1 max-w-prose text-[14px] leading-5 whitespace-pre-line text-ink-muted">
                                {record.notes}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </Section>
          )}
        </div>

        <footer className="mt-10 flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-rule pt-3 text-[12px] leading-4 text-ink-muted">
          <p>
            {pet.name} · Vet summary · As of {formatFullDate(today)}
          </p>
          <p>Novellia Pets</p>
        </footer>
      </article>
    </>
  );
}

const block = "animate-pulse rounded-md bg-rule/60";

export function VetSummarySkeleton() {
  return (
    <div aria-busy aria-label="Loading vet summary">
      <div className={`${block} mb-6 h-10`} />
      <div className="rounded-xl border border-rule bg-page p-5 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[calc(125mm+18px)_minmax(0,1fr)] sm:gap-8">
          <div className={`${block} h-[88mm] w-full`} />
          <div className="space-y-3">
            <div className={`${block} h-7 w-40`} />
            <div className={`${block} h-5 w-56`} />
            <div className={`${block} h-24`} />
          </div>
        </div>
        <div className="mt-10 space-y-9">
          {[0, 1, 2].map((section) => (
            <div key={section} className={`${block} h-24`} />
          ))}
        </div>
      </div>
    </div>
  );
}
