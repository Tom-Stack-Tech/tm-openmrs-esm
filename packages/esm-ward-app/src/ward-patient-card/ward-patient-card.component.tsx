import { ExtensionSlot, getPatientName, launchWorkspace } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { useCurrentWardCardConfig } from '../hooks/useCurrentWardCardConfig';
import { type WardPatientCard, type WardPatientWorkspaceProps } from '../types';
import WardPatientBedNumber from './row-elements/ward-patient-bed-number';
import WardPatientName from './row-elements/ward-patient-name';
import { WardPatientCardElement } from './ward-patient-card-element.component';
import styles from './ward-patient-card.scss';

const WardPatientCard: WardPatientCard = (wardPatient) => {
  const { patient, bed } = wardPatient;
  const { id, headerRowElements, footerRowElements } = useCurrentWardCardConfig();

  const headerExtensionSlotName =
    id == 'default' ? 'ward-patient-card-header-slot' : `ward-patient-card-header-${id}-slot`;
  const rowsExtensionSlotName = id == 'default' ? 'ward-patient-card-slot' : `ward-patient-card-${id}-slot`;
  const footerExtensionSlotName =
    id == 'default' ? 'ward-patient-card-footer-slot' : `ward-patient-card-footer-${id}-slot`;

  return (
    <div className={styles.wardPatientCard}>
      <div className={classNames(styles.wardPatientCardRow, styles.wardPatientCardHeader)}>
        {bed ? <WardPatientBedNumber bed={bed} /> : null}
        <WardPatientName patient={patient} />
        {headerRowElements.map((elementId, i) => (
          <WardPatientCardElement
            key={`ward-card-${patient.uuid}-header-${i}`}
            elementId={elementId}
            {...wardPatient}
          />
        ))}
        <ExtensionSlot name={headerExtensionSlotName} state={wardPatient} />
      </div>
      <ExtensionSlot
        name={rowsExtensionSlotName}
        state={wardPatient}
        className={classNames(styles.wardPatientCardRow, styles.wardPatientCardExtensionSlot)}
      />
      <div className={styles.wardPatientCardRow}>
        {footerRowElements.map((elementId, i) => (
          <WardPatientCardElement
            key={`ward-card-${patient.uuid}-footer-${i}`}
            elementId={elementId}
            {...wardPatient}
          />
        ))}
        <ExtensionSlot name={footerExtensionSlotName} state={wardPatient} />
      </div>
      <button
        className={styles.wardPatientCardButton}
        onClick={() => {
          launchWorkspace<WardPatientWorkspaceProps>('ward-patient-workspace', {
            wardPatient,
          });
        }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
