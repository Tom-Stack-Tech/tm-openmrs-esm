import { PatientList, PatientListFilter, PatientListMember } from './types';
import { useAsync, useAsyncQuery } from '../utils/use-async.hook';
import {
  getLocalAndRemotePatientListMembers,
  getLocalAndRemotePatientLists,
  getLocalAndRemotePatientListsForPatient,
  updateLocalOrRemotePatientList,
} from './api';

/**
 * A hook for querying all local and remote patient lists belonging to a given user,
 * optionally filtered by the specified {@link filter}.
 */
export function usePatientListDataQuery(userId?: string, filter?: PatientListFilter) {
  return useAsyncQuery(
    ({ abortController }) => {
      if (!userId) {
        return Promise.resolve<Array<PatientList>>([]);
      }

      return getLocalAndRemotePatientLists(userId, filter, abortController);
    },
    [userId, filter],
  );
}

/**
 * A hook for querying all members of a given local or remote patient list.
 */
export function useGetAllPatientListMembersQuery(userId?: string, patientListId?: string) {
  return useAsyncQuery(() => {
    if (!userId || !patientListId) {
      return Promise.resolve<Array<PatientListMember>>([]);
    }

    return getLocalAndRemotePatientListMembers(userId, patientListId);
  }, [userId, patientListId]);
}

/**
 * A hook for querying all local and remote patient lists that exist for a given user,
 * but without those patient lists where a specific patient has already been added as a member.
 *
 * This is intended for displaying all lists to which a given patient can still be added.
 */
export function useGetAllPatientListsWithoutPatientQuery(userId?: string, patientUuid?: string) {
  return useAsyncQuery(
    async ({ abortController }) => {
      if (!userId || !patientUuid) {
        return [];
      }

      const [allLists, listsIdsOfThisPatient] = await Promise.all([
        getLocalAndRemotePatientLists(userId, undefined, abortController),
        getLocalAndRemotePatientListsForPatient(userId, patientUuid, abortController),
      ]);

      const listsWithoutPatient = allLists.filter((list) => !listsIdsOfThisPatient.includes(list.id));
      return listsWithoutPatient;
    },
    [userId, patientUuid],
  );
}

export interface ToggleStarredMutationArgs {
  userId: string;
  patientListId: string;
  isStarred: boolean;
}

/**
 * A hook for mutating a local or remote patient list's `isStarred` attribute.
 */
export function useToggleStarredMutation() {
  return useAsync(({ userId, patientListId, isStarred }: ToggleStarredMutationArgs, { abortController }) => {
    return updateLocalOrRemotePatientList(userId, patientListId, { isStarred }, abortController);
  });
}
