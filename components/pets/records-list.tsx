import Link from "next/link";
import { DeleteDialog } from "@/components/delete-dialog";
import { deleteRecordAction } from "@/app/pets/actions";
import type { MedicalRecord } from "@/db/models/medical-record";
import { filterMedicalRecords } from "@/db/models/medical-record";
import {
  listMedicalRecordTypes,
  MEDICAL_RECORD_TYPE_IDS,
} from "@/db/models/medical-record-type";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";
import { formatDate } from "@/lib/format";
import { loadPet, loadPetRecords } from "@/lib/pet-data";
import {
  parseRecordFilters,
  RECORD_TYPE_PLURALS,
  recordStatusLine,
  recordSummary,
} from "@/lib/records";
import { routes } from "@/lib/routes";
import { FirstRecord } from "./first-record";
import { RecordSearch } from "./record-search";

type SearchParams = Record<string, string | string[] | undefined>;
type Filters = { type?: MedicalRecordTypeId; q?: string };

const SMALL_CAPS =
  "text-[11px] leading-4 font-semibold tracking-[0.08em] text-ink-muted uppercase";

function RecordRow({
  record,
  petId,
  typeName,
  today,
  filters,
  highlighted,
}: {
  record: MedicalRecord;
  petId: number;
  typeName: string;
  today: string;
  filters: Filters;
  highlighted: boolean;
}) {
  const summary = recordSummary(record);
  const status = recordStatusLine(record, (date) => formatDate(date, today));
  const when = record.occurredOn
    ? formatDate(record.occurredOn, today)
    : "date not recorded";
  return (
    <li
      id={`record-${record.id}`}
      aria-current={highlighted ? "true" : undefined}
      className={`scroll-mt-6 ${highlighted ? "bg-cover/[0.06] " : ""}grid grid-cols-[minmax(0,1fr)_auto] gap-x-5 gap-y-2 px-4 py-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:px-5`}
    >
      <p className="col-span-2 text-[14px] leading-6 text-ink-muted sm:col-span-1">
        {record.occurredOn ? (
          <time dateTime={record.occurredOn}>
            {formatDate(record.occurredOn, today)}
          </time>
        ) : (
          "—"
        )}
      </p>
      <div className="min-w-0">
        <p className="text-[16px] leading-6 break-words">
          <span className="font-bold">{record.title}</span>{" "}
          <span className="text-[14px] text-ink-muted">{typeName}</span>
        </p>
        {summary && <p className="text-[14px] leading-5">{summary}</p>}
        {status && (
          <p className="text-[13px] leading-5 text-ink-muted">{status}</p>
        )}
        {record.notes && (
          <p className="mt-1 max-w-prose text-[14px] leading-5 whitespace-pre-line text-ink-muted">
            {record.notes}
          </p>
        )}
      </div>
      <div className="flex items-start gap-2 self-start sm:gap-1">
        <Link
          href={routes.editRecord(petId, record.id, filters)}
          className="inline-flex h-11 items-center rounded-md px-4 text-[13px] font-semibold text-cover hover:bg-page-tint sm:h-8 sm:px-3"
        >
          Edit
          <span className="sr-only"> {record.title}</span>
        </Link>
        <DeleteDialog
          triggerVariant="row"
          triggerLabel={
            <>
              Delete<span className="sr-only"> {record.title}</span>
            </>
          }
          title="Delete this record?"
          description={`${record.title}, ${when} (${typeName}). This can't be undone.`}
          confirmLabel="Delete record"
          action={deleteRecordAction}
          fields={{
            petId: String(petId),
            recordId: String(record.id),
            filterType: filters.type ?? "",
            filterQuery: filters.q ?? "",
          }}
        />
      </div>
    </li>
  );
}

export async function PetRecords({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [{ pet, today }, records, types] = await Promise.all([
    loadPet(id),
    loadPetRecords(id),
    listMedicalRecordTypes(),
  ]);

  if (records.length === 0) return <FirstRecord pet={pet} />;

  const filters = parseRecordFilters(query.type, query.q);
  const recordParam = Array.isArray(query.record)
    ? query.record[0]
    : query.record;
  const highlightId =
    recordParam && /^[1-9]\d*$/.test(recordParam)
      ? Number(recordParam)
      : undefined;
  const queryMatches = filterMedicalRecords(records, { query: filters.q });
  const shown = filterMedicalRecords(queryMatches, { typeId: filters.type });
  const typeNames = Object.fromEntries(
    types.map((type) => [type.id, type.name]),
  ) as Record<MedicalRecordTypeId, string>;

  const tabs: { value?: MedicalRecordTypeId; label: string; count: number }[] =
    [
      { label: "All", count: queryMatches.length },
      ...MEDICAL_RECORD_TYPE_IDS.map((value) => ({
        value,
        label: RECORD_TYPE_PLURALS[value],
        count: queryMatches.filter((record) => record.typeId === value).length,
      })),
    ];

  const years = new Map<string, MedicalRecord[]>();
  for (const record of shown) {
    const year = record.occurredOn?.slice(0, 4) ?? "Date not recorded";
    const group = years.get(year);
    if (group) group.push(record);
    else years.set(year, [record]);
  }

  return (
    <section aria-labelledby="records-heading" className="min-w-0">
      <h2 id="records-heading" className="sr-only">
        Records
      </h2>

      <div className="mb-6 flex flex-col gap-3">
        <RecordSearch petId={pet.id} type={filters.type} />
        <nav
          aria-label="Filter by record type"
          className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        >
          <ul className="inline-flex gap-1 rounded-lg border border-rule bg-page p-1">
            {tabs.map(({ value, label, count }) => {
              const current = filters.type === value;
              return (
                <li key={label}>
                  <Link
                    href={routes.petRecords(pet.id, {
                      type: value,
                      q: filters.q,
                    })}
                    scroll={false}
                    aria-current={current ? "page" : undefined}
                    className={[
                      "flex h-11 items-center gap-1.5 rounded-md px-3 text-[14px] whitespace-nowrap transition-colors duration-150 sm:h-8",
                      current
                        ? "bg-cover font-semibold text-cover-ink"
                        : "text-ink hover:bg-page-tint",
                    ].join(" ")}
                  >
                    {label}
                    <span
                      className={
                        current ? "text-cover-muted" : "text-ink-muted"
                      }
                    >
                      {count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {shown.length > 0 ? (
        <div className="space-y-8">
          {[...years].map(([year, group]) => (
            <div key={year}>
              <h3 className={`mb-2 ${SMALL_CAPS}`}>{year}</h3>
              <ul className="divide-y divide-rule overflow-hidden rounded-xl border border-rule bg-page">
                {group.map((record) => (
                  <RecordRow
                    key={record.id}
                    record={record}
                    petId={pet.id}
                    typeName={typeNames[record.typeId]}
                    today={today}
                    filters={filters}
                    highlighted={record.id === highlightId}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-rule-strong bg-page px-5 py-8 text-center">
          <p className="text-[16px] font-semibold">
            No records match these filters.
          </p>
          <Link
            href={routes.petRecords(pet.id)}
            scroll={false}
            className="mt-1 inline-block text-[14px] font-semibold text-cover underline"
          >
            Clear filters
          </Link>
        </div>
      )}
    </section>
  );
}
