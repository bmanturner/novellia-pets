import { NextDue } from "@/components/dashboard/next-due";
import { Toast } from "@/components/toast";
import { getMedicalRecord } from "@/db/models/medical-record";
import { loadPet, loadPetCare, loadPetRecords } from "@/lib/pet-data";
import { FirstRecord } from "./first-record";
import {
  Conditions,
  LastVisitCard,
  Medications,
  Vaccinations,
} from "./status-sections";

type SearchParams = Record<string, string | string[] | undefined>;

export async function PetStatus({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [{ householdId, pet, today }, care, records] = await Promise.all([
    loadPet(id),
    loadPetCare(id),
    loadPetRecords(id),
  ]);

  if (records.length === 0) return <FirstRecord pet={pet} />;

  const rawLogged = Array.isArray(query.logged) ? query.logged[0] : query.logged;
  const loggedId = Number(rawLogged);
  const logged =
    Number.isInteger(loggedId) && loggedId > 0
      ? await getMedicalRecord(householdId, loggedId)
      : undefined;

  return (
    <>
      <NextDue
        scope="pet"
        items={care.dueItems}
        nextBeyond={care.nextBeyond}
        today={today}
      />
      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
        <Conditions conditions={care.conditions} />
        <Medications medications={care.medications} today={today} />
        <Vaccinations vaccinations={care.vaccinations} today={today} />
        <LastVisitCard visit={care.lastVisit} today={today} />
      </div>
      {logged && logged.petId === pet.id && (
        <Toast
          message={`Logged ${logged.title} for ${pet.name}.`}
          param="logged"
        />
      )}
    </>
  );
}
