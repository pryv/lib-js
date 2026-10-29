/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// Compiled (never run) by typings.test.js: account auto-deletion calls, their
// answer and the service-info feature, as a server sends them.
import type { Connection, AutoDeletion, AutoDeletionSetParams, ServiceInfo } from 'pryv';

// An answer as the server sends it (account.getAutoDeletion / setAutoDeletion).
export const answer: AutoDeletion = {
  effective: { source: 'user', mode: 'date', date: 1811887199, action: 'delete' },
  setting: { mode: 'date', date: 1811887199, action: 'delete', updatedAt: 1735689600 },
  lastActivity: { personal: 1735689600, app: null, delegate: null, max: 1735689600, by: 'owner' },
  deadline: 1811887199,
  deleteAt: 1811887199,
  deadlineReason: 'date',
  nextReminderAt: 1806703199,
  remindersSent: [],
  blocked: null,
  mail: 'available',
  bounds: { minDays: 90, maxDays: 3650, minLeadDays: 14 },
  userOverride: true,
  allowUserOptOut: true,
  actions: ['delete']
};

// Nothing scheduled: no setting, no deadline, platform policy none.
export const none: AutoDeletion = {
  ...answer,
  effective: { source: 'none', mode: 'never', action: 'delete' },
  setting: null,
  deadline: null,
  deleteAt: null,
  deadlineReason: null,
  nextReminderAt: null,
  actions: []
};

export const arm: AutoDeletionSetParams = { mode: 'inactivity', inactivityDays: 365, password: 'secret' };
export const backToDefault: AutoDeletionSetParams = { mode: 'default' };
// @ts-expect-error mode is required
export const noMode: AutoDeletionSetParams = { inactivityDays: 365 };
// @ts-expect-error acknowledgeNoReminders is only ever true
export const ackFalse: AutoDeletionSetParams = { mode: 'never', acknowledgeNoReminders: false };

export async function schedule (conn: Connection): Promise<number | null> {
  const current: AutoDeletion = await conn.apiOne('account.getAutoDeletion', {}, 'autoDeletion');
  const after = await conn.apiOne('account.setAutoDeletion', { mode: 'date', date: '2027-06-01T23:59:59+02:00', password: 'secret' }, 'autoDeletion');
  return after.deleteAt ?? current.deadline;
}

export function deleteOffered (info: ServiceInfo): boolean {
  const feature = info.features?.autoDeletion;
  return feature != null && feature.actions.includes('delete') && feature.triggers.includes('inactivity');
}
