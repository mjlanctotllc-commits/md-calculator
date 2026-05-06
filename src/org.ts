import { AuthState, Role, TeamMember } from './types';

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  { email: 'tate.j.breyer@gmail.com', displayName: 'Tate Breyer', role: 'rep', parentEmail: null },
  { email: 'peterdouglas32@gmail.com', displayName: 'Pete', role: 'rep', parentEmail: null },
  { email: 'vectorkuba@gmail.com', displayName: 'Kuba', role: 'rep', parentEmail: null },
  { email: 'liamh1008@gmail.com', displayName: 'Liam', role: 'rep', parentEmail: null },
  { email: 'wee4639@gmail.com', displayName: 'Joon', role: 'rep', parentEmail: null },
  { email: 'yng.omarmares@gmail.com', displayName: 'Omar', role: 'rep', parentEmail: null },
  { email: 'luissaldanapro@gmail.com', displayName: 'Luis Saldana', role: 'rep', parentEmail: null },
  { email: 'scruzcatalan@gmail.com', displayName: 'Spencer', role: 'rep', parentEmail: null },
  { email: 'haydenberko@gmail.com', displayName: 'Hayden', role: 'rep', parentEmail: null },
  { email: 'alexquinn8972@gmail.com', displayName: 'Alex Quin', role: 'rep', parentEmail: null },
  { email: 'aydenparks36@gmail.com', displayName: 'Ayden Parks', role: 'rep', parentEmail: null },
  { email: 'rendon.coast2coast@gmail.com', displayName: 'Rendon', role: 'rep', parentEmail: null },
  { email: 'ignacio.liz2002@gmail.com', displayName: 'Ignacio', role: 'rep', parentEmail: null },
  { email: 'clementplasencia@gmail.com', displayName: 'Clemente', role: 'rep', parentEmail: null },
  { email: 'tylerspadre@gmail.com', displayName: 'Joshua Ledbetter', role: 'rep', parentEmail: null },
  { email: 'chanceatti@gmail.com', displayName: 'Chance', role: 'rep', parentEmail: null },
];

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const canManageOrgState = (role?: Role) => role === 'owner' || role === 'manager';
export const canManageTeam = (role?: Role) => role === 'owner';

export function getSelfMember(auth: AuthState | null, teamMembers: TeamMember[]) {
  if (!auth) return null;
  return teamMembers.find((member) => normalizeEmail(member.email) === normalizeEmail(auth.email)) ?? null;
}

export function getDescendantEmails(memberEmail: string, teamMembers: TeamMember[]) {
  const normalized = normalizeEmail(memberEmail);
  const byParent = new Map<string, TeamMember[]>();
  for (const member of teamMembers) {
    const parentKey = member.parentEmail ? normalizeEmail(member.parentEmail) : '';
    if (!byParent.has(parentKey)) byParent.set(parentKey, []);
    byParent.get(parentKey)!.push(member);
  }
  const descendants = new Set<string>();
  const stack = [...(byParent.get(normalized) ?? [])];
  while (stack.length) {
    const current = stack.pop()!;
    const currentEmail = normalizeEmail(current.email);
    if (descendants.has(currentEmail)) continue;
    descendants.add(currentEmail);
    stack.push(...(byParent.get(currentEmail) ?? []));
  }
  return descendants;
}

export function getAssignableMembers(auth: AuthState | null, teamMembers: TeamMember[]) {
  const self = getSelfMember(auth, teamMembers);
  if (!auth || !self) return [];
  if (auth.role === 'owner') return [...teamMembers].sort((a, b) => a.displayName.localeCompare(b.displayName));
  if (auth.role === 'manager') {
    const descendants = getDescendantEmails(self.email, teamMembers);
    return teamMembers
      .filter((member) => normalizeEmail(member.email) === normalizeEmail(self.email) || descendants.has(normalizeEmail(member.email)))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
  return [self];
}

export function mergeSeedMembers(ownerEmail: string, currentMembers: TeamMember[]) {
  const ownerNormalized = normalizeEmail(ownerEmail);
  const currentByEmail = new Map(currentMembers.map((member) => [normalizeEmail(member.email), member]));
  const seeded = DEFAULT_TEAM_MEMBERS.map((member) => {
    const existing = currentByEmail.get(normalizeEmail(member.email));
    return existing ?? { ...member, parentEmail: ownerNormalized };
  });
  return [...currentMembers, ...seeded.filter((member) => !currentByEmail.has(normalizeEmail(member.email)))];
}
