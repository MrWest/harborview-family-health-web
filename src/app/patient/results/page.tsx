// Design: Patient result status uses Harborview’s editoral patient-services pattern and keeps release information explicitly non-interpreted.
import { LaboratoryResultList } from "@/features/patient/PatientServiceLists";

export default function PatientResultsPage() { return <LaboratoryResultList/>; }
