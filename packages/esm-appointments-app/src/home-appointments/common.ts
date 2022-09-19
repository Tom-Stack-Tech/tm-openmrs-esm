import { showModal, showNotification, showToast } from '@openmrs/esm-framework';
import { updateAppointmentStatus, undoAppointmentStatus } from './appointments-table.resource';
import {
  closeActionableNotification,
  showActionableNotification,
  onClickUndo,
} from '../hooks/useActionableNotification';

export const launchCheckInAppointmentModal = (appointmentUuid: string) => {
  const dispose = showModal('check-in-appointment-modal', {
    closeCheckInModal: () => dispose(),
    appointmentUuid,
  });
};

export const handleUndoAction = async (appointmentUuid, mutate) => {
  onClickUndo();
  const abortController = new AbortController();
  const { status } = await undoAppointmentStatus(appointmentUuid, abortController);
  if (status === 200) {
    closeActionableNotification();
    mutate(`/ws/rest/v1/appointment/appointment/all`);
  } else {
    closeActionableNotification();
    showNotification({
      title: 'Error Undoing',
      kind: 'error',
      critical: true,
      description: 'Error reverting status',
    });
  }
};

export const handleUpdateStatus = async (
  toStatus: string,
  appointmentUuid: string,
  successDescription: string,
  errorDescription: string,
  successTitle: string,
  errorTitle: string,
  mutate,
) => {
  const abortController = new AbortController();
  const { status } = await updateAppointmentStatus(toStatus, appointmentUuid, abortController);
  if (status === 200) {
    showActionableNotification({
      critical: true,
      kind: 'success',
      subtitle: successDescription,
      title: successTitle,
      actionButtonLabel: 'Undo',
      onActionButtonClick: () => handleUndoAction(appointmentUuid, mutate),
    });
    mutate(`/ws/rest/v1/appointment/appointment/all`);
  } else {
    showNotification({
      title: errorTitle,
      kind: 'error',
      critical: true,
      description: errorDescription,
    });
  }
};

export const handleComplete = (appointmentId, mutate, t) => {
  const successDescription = t('appointmentMarkedAsCompleted', 'It has been successfully marked as Completed');
  const successTitle = t('appointmentCompleted', 'Appointment Completed');
  const errorDescription = t('appointmentCompleted', 'Appointment Completed');
  const errorTitle = t('appointmentCompletedError', 'Error marking appointment as Completed');
  return handleUpdateStatus(
    'Completed',
    appointmentId,
    successDescription,
    errorDescription,
    successTitle,
    errorTitle,
    mutate,
  );
};
