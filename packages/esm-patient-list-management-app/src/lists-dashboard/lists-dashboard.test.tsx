import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { openmrsFetch, restBaseUrl, useSession } from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import ListsDashboard from './lists-dashboard.component';

const mockedUseLocation = jest.mocked(useLocation);
const mockedUseSession = jest.mocked(useSession);
const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

describe('ListsDashboard', () => {
  beforeEach(() => {
    mockedUseLocation.mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });

    mockedUseSession.mockReturnValue(mockSession.data);

    mockedOpenmrsFetch.mockResolvedValue({
      data: {
        results: [
          {
            uuid: 'ffff37ca-872f-4ede-9a19-bb6692c5ff98',
            name: 'Test List',
            description: 'Test List',
            display: 'Test List',
            size: 1,
            attributes: [],
            cohortType: {
              name: 'My List',
              description: 'A user-generated patient list',
              uuid: 'e71857cb-33af-4f2c-86ab-7223bcfa37ad',
              display: 'My List',
              links: [
                {
                  rel: 'self',
                  uri: `http://dev3.openmrs.org/openmrs/${restBaseUrl}/cohortm/cohorttype/e71857cb-33af-4f2c-86ab-7223bcfa37ad`,
                  resourceAlias: 'cohorttype',
                },
                {
                  rel: 'full',
                  uri: `http://dev3.openmrs.org/openmrs/${restBaseUrl}/cohortm/cohorttype/e71857cb-33af-4f2c-86ab-7223bcfa37ad?v=full`,
                  resourceAlias: 'cohorttype',
                },
              ],
              resourceVersion: '1.8',
            },
          },
          {
            uuid: '94ee4943-8dcc-409a-86d5-8ab6631a511c',
            name: '2.13.0',
            description: 'Testing',
            display: '2.13.0',
            size: 0,
            attributes: [],
            cohortType: {
              name: 'My List',
              description: 'A user-generated patient list',
              uuid: 'e71857cb-33af-4f2c-86ab-7223bcfa37ad',
              display: 'My List',
              links: [
                {
                  rel: 'self',
                  uri: `http://dev3.openmrs.org/openmrs/${restBaseUrl}/cohortm/cohorttype/e71857cb-33af-4f2c-86ab-7223bcfa37ad`,
                  resourceAlias: 'cohorttype',
                },
                {
                  rel: 'full',
                  uri: `http://dev3.openmrs.org/openmrs/${restBaseUrl}/cohortm/cohorttype/e71857cb-33af-4f2c-86ab-7223bcfa37ad?v=full`,
                  resourceAlias: 'cohorttype',
                },
              ],
              resourceVersion: '1.8',
            },
          },
        ],
      },
    });
  });

  it('renders the patient list page UI correctly', async () => {
    const user = userEvent.setup();
    render(<ListsDashboard />);

    await screen.findByRole('button', { name: /new list/i });
    expect(screen.getByRole('tablist', { name: /list tabs/i })).toBeInTheDocument();

    const tabs = ['Starred lists', 'System lists', 'My lists', 'All lists'];

    tabs.forEach((tab) => {
      expect(screen.getByRole('tab', { name: tab })).toBeInTheDocument();
    });
    expect(screen.getByRole('tab', { name: /starred lists/i })).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('tab', { name: 'All lists' }));
    await screen.findByRole('searchbox');
    expect(screen.getByRole('table')).toBeInTheDocument();

    const columnHeaders = [/List name/, /List type/, /No. of patients/];

    columnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
  });

  it('clicking a tab switches the page content to the selected tab', async () => {
    const user = userEvent.setup();

    render(<ListsDashboard />);

    const systemListsTab = screen.getByRole('tab', { name: /system lists/i });
    expect(systemListsTab).toHaveAttribute('aria-selected', 'false');

    await user.click(systemListsTab);

    expect(systemListsTab).toHaveAttribute('aria-selected', 'true');
  });
});
