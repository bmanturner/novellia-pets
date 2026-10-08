import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";

type RecordFilterParams = { type?: MedicalRecordTypeId; q?: string };

function filterQuery(filters: RecordFilterParams): string {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.q) params.set("q", filters.q);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const routes = {
  home: "/",
  newPet: "/pets/new",
  pet: (petId: number) => `/pets/${petId}`,
  newRecord: (petId: number, typeId?: MedicalRecordTypeId) =>
    typeId
      ? `/pets/${petId}/records/new?${new URLSearchParams({ type: typeId })}`
      : `/pets/${petId}/records/new`,
  /** New-record form pre-filled to log the next occurrence of a due item. */
  logNext: (
    petId: number,
    typeId: MedicalRecordTypeId,
    title: string,
    from?: "home",
  ) =>
    `/pets/${petId}/records/new?${new URLSearchParams({ type: typeId, title, ...(from ? { from } : {}) })}`,
  petRecords: (petId: number, filters: RecordFilterParams = {}) =>
    `/pets/${petId}/records${filterQuery(filters)}`,
  /** Records page scrolled to one record, highlighted. */
  petRecord: (petId: number, recordId: number) =>
    `/pets/${petId}/records?record=${recordId}#record-${recordId}`,
  /** `type` and `q` are the Records filters to return to after saving. */
  editRecord: (
    petId: number,
    recordId: number,
    filters: RecordFilterParams = {},
  ) => `/pets/${petId}/records/${recordId}/edit${filterQuery(filters)}`,
  petProfile: (petId: number) => `/pets/${petId}/profile`,
  editPet: (petId: number) => `/pets/${petId}/edit`,
};
