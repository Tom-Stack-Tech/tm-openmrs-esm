import {
  type ConfigSchema,
  getDefaultsFromConfigSchema,
  useAppContext,
  useConfig,
  useFeatureFlag,
} from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { renderWithSwr } from 'tools';
import { mockWardPatientGroupDetails } from '../../mock';
import { configSchema } from '../config-schema';
import useWardLocation from '../hooks/useWardLocation';
import WardView from './ward-view.component';

jest.mocked(useConfig).mockReturnValue({
  ...getDefaultsFromConfigSchema<ConfigSchema>(configSchema),
});

const mockUseFeatureFlag = jest.mocked(useFeatureFlag);

jest.mock('../hooks/useWardLocation', () =>
  jest.fn().mockReturnValue({
    location: { uuid: 'abcd', display: 'mock location' },
    isLoadingLocation: false,
    errorFetchingLocation: null,
    invalidLocation: false,
  }),
);

const mockUseWardLocation = jest.mocked(useWardLocation);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));
const mockUseParams = useParams as jest.Mock;

jest.mocked(useAppContext).mockReturnValue(mockWardPatientGroupDetails());

const intersectionObserverMock = () => ({
  observe: () => null,
});
window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock);

describe('WardView', () => {
  let replacedProperty: jest.ReplaceProperty<any> | null = null;

  it('renders the session location when no location provided in URL', () => {
    renderWithSwr(<WardView />);
    const header = screen.getByRole('heading', { name: 'mock location' });
    expect(header).toBeInTheDocument();
  });

  it('renders the location provided in URL', () => {
    mockUseParams.mockReturnValueOnce({ locationUuid: 'abcd' });
    renderWithSwr(<WardView />);
    const header = screen.getByRole('heading', { name: 'mock location' });
    expect(header).toBeInTheDocument();
  });

  it('renders the correct number of occupied and empty beds', async () => {
    renderWithSwr(<WardView />);
    const emptyBedCards = await screen.findAllByText(/empty bed/i);
    expect(emptyBedCards).toHaveLength(3);
  });

  it('renders admitted patient without bed', async () => {
    renderWithSwr(<WardView />);
    const admittedPatientWithoutBed = screen.queryByText('Brian Johnson');
    expect(admittedPatientWithoutBed).toBeInTheDocument();
  });

  it('renders all admitted patients even if bed management module not installed', async () => {
    mockUseFeatureFlag.mockReturnValueOnce(false);
    renderWithSwr(<WardView />);
    const admittedPatientWithoutBed = screen.queryByText('Brian Johnson');
    expect(admittedPatientWithoutBed).toBeInTheDocument();
  });

  it('renders notification for invalid location uuid', () => {
    mockUseWardLocation.mockReturnValueOnce({
      location: null,
      isLoadingLocation: false,
      errorFetchingLocation: null,
      invalidLocation: true,
    });

    renderWithSwr(<WardView />);
    const notification = screen.getByRole('status');
    expect(notification).toBeInTheDocument();
    const invalidText = screen.queryByText('Invalid location specified');
    expect(invalidText).toBeInTheDocument();
  });

  it('should render warning if backend module installed and no beds configured', () => {
    // override the default response so that no beds are returned
    replacedProperty = jest.replaceProperty(mockWardPatientGroupDetails(), 'bedLayouts', []);

    mockUseFeatureFlag.mockReturnValue(true);

    renderWithSwr(<WardView />);
    const noBedsConfiguredForThisLocation = screen.queryByText('No beds configured for this location');
    expect(noBedsConfiguredForThisLocation).toBeInTheDocument();
  });

  it('should not render warning if backend module installed and no beds configured', () => {
    // override the default response so that no beds are returned
    replacedProperty = jest.replaceProperty(mockWardPatientGroupDetails(), 'bedLayouts', []);
    mockUseFeatureFlag.mockReturnValue(false);

    renderWithSwr(<WardView />);
    const noBedsConfiguredForThisLocation = screen.queryByText('No beds configured for this location');
    expect(noBedsConfiguredForThisLocation).not.toBeInTheDocument();
  });

  afterEach(() => {
    replacedProperty?.restore();
    replacedProperty = null;
  });
});
