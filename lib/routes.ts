import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";

export const routes = {
  home: "/",
  newPet: "/pets/new",
  pet: (petId: number) => `/pets/${petId}`,
  /** New-record form pre-filled to log the next occurrence of a due item. */
  logNext: (petId: number, typeId: MedicalRecordTypeId, title: string) =>
    `/pets/${petId}/records/new?${new URLSearchParams({ type: typeId, title })}`,
};
