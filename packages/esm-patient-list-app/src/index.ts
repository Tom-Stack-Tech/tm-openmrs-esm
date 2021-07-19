import { getAsyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import './offline/offlineData';
import './patientListData/api';

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};
const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-list-app';
const options = {
  featureName: 'patient list',
  moduleName,
};
const spaBasePath = `${window.spaBase}/patient-list`;

function setupOpenMRS() {
  registerBreadcrumbs([
    {
      path: spaBasePath,
      title: 'Patient List',
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${spaBasePath}/:view?`,
      title: ([x]) => `${x} Dashboard`,
      parent: spaBasePath,
    },
  ]);

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import('./patientListList'), options),
        route: (location: Location) => location.pathname.startsWith(window.getOpenmrsSpaBase() + 'patient-list'),
        online: { syncUserPropertiesChangesOnLoad: true },
        offline: { syncUserPropertiesChangesOnLoad: false },
      },
    ],
    extensions: [
      {
        id: 'patient-list-link',
        slot: 'app-menu-slot',
        load: getAsyncLifecycle(() => import('./patient-list-link'), options),
        online: true,
        offline: true,
      },
      {
        id: 'add-patient-to-patient-list-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./patient-list-action'), {
          featureName: 'patient-actions-slot',
          moduleName,
        }),
      },
      {
        id: 'add-patient-to-patient-list-modal',
        // slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./AddPatientToList'), {
          featureName: 'patient-actions-modal',
          moduleName,
        }),
      },
      {
        id: 'patient-table',
        load: getAsyncLifecycle(() => import('./PatientTable/patient-table.component'), {
          featureName: 'patient-table',
          moduleName,
        }),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
