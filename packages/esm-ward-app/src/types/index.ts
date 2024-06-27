import {
  type OpenmrsResource,
  type OpenmrsResourceStrict,
  type Person,
  type Visit,
  type Location,
  type Patient,
} from '@openmrs/esm-framework';
import type React from 'react';

export interface WardPatientCardProps {
  patient: Patient;
  visit: Visit;
  bed: Bed;
}

export type WardPatientCardRow = React.FC<WardPatientCardProps>;
export type WardPatientCardElement = React.FC<WardPatientCardProps>;

export const patientCardElementTypes = [
  'bed-number',
  'patient-name',
  'patient-age',
  'patient-address',
  'patient-obs',
  'patient-coded-obs-tags',
  'admission-time',
] as const;
export type PatientCardElementType = (typeof patientCardElementTypes)[number];

// server-side types defined in openmrs-module-bedmanagement:

export interface AdmissionLocation {
  totalBeds: number;
  occupiedBeds: number;
  ward: Location;
  bedLayouts: Array<BedLayout>;
}
export interface Bed {
  id: number;
  uuid: string;
  bedNumber: string;
  bedType: BedType;
  row: number;
  column: number;
  status: BedStatus;
}

export interface BedLayout {
  rowNumber: number;
  columnNumber: number;
  bedNumber: string;
  bedId: number;
  bedUuid: string;
  status: BedStatus;
  bedType: BedType;
  location: string;
  patients: Patient[];
  bedTagMaps: BedTagMap[];
}

export interface BedType {
  uuid: string;
  name: string;
  displayName: string;
  description: string;
  resourceVersion: string;
}

interface BedTagMap {
  uuid: string;
  bedTag: {
    id: number;
    name: string;
    uuid: string;
    resourceVersion: string;
  };
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED';

export type DispositionType = 'ADMISSION' | 'TRANSFER' | 'DISCHARGE';

export interface InpatientRequest {
  patient: Patient;
  visit: Visit;
  type: DispositionType;
  encounter?: Encounter;
  dispositionObs?: Observation;
  dispositionLocation?: Location;
  dispositionDate?: Date;
}
// TODO: Move these types to esm-core
export interface Observation extends OpenmrsResourceStrict {
  concept: OpenmrsResource;
  person: Person;
  obsDatetime: string;
  accessionNumber: string;
  obsGroup: Observation;
  value: number | string | boolean | OpenmrsResource;
  valueCodedName: OpenmrsResource; // ConceptName
  groupMembers: Array<Observation>;
  comment: string;
  location: Location;
  order: OpenmrsResource; // Order
  encounter: Encounter;
  voided: boolean;
}

export interface Encounter extends OpenmrsResourceStrict {
  encounterDatetime?: string;
  patient?: Patient;
  location?: Location;
  form?: OpenmrsResource;
  encounterType?: EncounterType;
  obs?: Array<Observation>;
  orders?: any;
  voided?: boolean;
  visit?: Visit;
  encounterProviders?: Array<EncounterProvider>;
  diagnoses?: any;
}

export interface EncounterProvider extends OpenmrsResourceStrict {
  provider?: OpenmrsResource;
  encounterRole?: EncounterRole;
  voided?: boolean;
}

export interface EncounterType extends OpenmrsResourceStrict {
  name?: string;
  description?: string;
  retired?: boolean;
}

export interface EncounterRole extends OpenmrsResourceStrict {
  name?: string;
  description?: string;
  retired?: boolean;
}
