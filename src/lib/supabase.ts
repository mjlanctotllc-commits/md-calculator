import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, AuthState, SavedScenario, TeamMember } from '../types';
import { canManageTeam, mergeSeedMembers, normalizeEmail } from '../org';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseEnabled = Boolean(url && anonKey);
export const supabase: SupabaseClient | null = supabaseEnabled ? createClient(url!, anonKey!) : null;

export interface RemotePayload {
  auth: Partial<AuthState> | null;
  state: AppState | null;
  scenarios: SavedScenario[];
  teamMembers: TeamMember[];
  mode: 'org' | 'legacy';
}

export async function getSupabaseSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.session;
}

export async function sendReset(email: string) {
  if (!supabase) return false;
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return true;
}

export async function signOutSupabase() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

async function loadLegacyState(userId: string): Promise<RemotePayload> {
  if (!supabase) return { auth: null, state: null, scenarios: [], teamMembers: [], mode: 'legacy' };

  const [{ data: profile }, { data: scenarios }] = await Promise.all([
    supabase.from('md_calculator_profiles').select('manager_name, role, app_state').eq('user_id', userId).maybeSingle(),
    supabase.from('md_calculator_scenarios').select('id, name, saved_at, state').eq('user_id', userId).order('saved_at', { ascending: false }),
  ]);

  return {
    auth: profile ? { role: (profile.role as AuthState['role']) ?? 'manager', displayName: (profile.manager_name as string | null) ?? undefined } : null,
    state: (profile?.app_state as AppState | null) ?? null,
    scenarios: (scenarios ?? []).map((scenario) => ({
      id: scenario.id as string,
      name: scenario.name as string,
      savedAt: scenario.saved_at as string,
      state: scenario.state as AppState,
    })),
    teamMembers: [],
    mode: 'legacy',
  };
}

async function bootstrapOwnerIfNeeded(userId: string, email: string, fallbackState: AppState) {
  if (!supabase) return null;
  const normalizedEmail = normalizeEmail(email);

  await supabase.from('md_calculator_memberships').upsert({
    user_id: userId,
    email: normalizedEmail,
    display_name: fallbackState.settings.managerName || email.split('@')[0],
    role: 'owner',
    org_owner_id: userId,
    parent_email: null,
    updated_at: new Date().toISOString(),
  });

  await supabase.from('md_calculator_org_state').upsert({
    org_owner_id: userId,
    app_state: fallbackState,
    updated_at: new Date().toISOString(),
  });

  const seededMembers = mergeSeedMembers(normalizedEmail, []);
  if (seededMembers.length) {
    await supabase.from('md_calculator_memberships').upsert(
      seededMembers.map((member) => ({
        user_id: member.userId ?? null,
        email: normalizeEmail(member.email),
        display_name: member.displayName,
        role: member.role,
        org_owner_id: userId,
        parent_email: member.parentEmail ? normalizeEmail(member.parentEmail) : normalizedEmail,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'email' },
    );
  }
}

async function claimMembership(userId: string, email: string) {
  if (!supabase) return;
  const normalizedEmail = normalizeEmail(email);
  await supabase
    .from('md_calculator_memberships')
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq('email', normalizedEmail)
    .is('user_id', null);
}

export async function loadRemoteState(userId: string, fallbackState?: AppState): Promise<RemotePayload> {
  if (!supabase) return { auth: null, state: null, scenarios: [], teamMembers: [], mode: 'legacy' };
  const session = await getSupabaseSession();
  const email = session?.user?.email ?? '';

  try {
    let { data: membership } = await supabase
      .from('md_calculator_memberships')
      .select('user_id, email, display_name, role, org_owner_id, parent_email')
      .eq('user_id', userId)
      .maybeSingle();

    if (!membership && email) {
      await claimMembership(userId, email);
      const { data: claimedMembership } = await supabase
        .from('md_calculator_memberships')
        .select('user_id, email, display_name, role, org_owner_id, parent_email')
        .eq('user_id', userId)
        .maybeSingle();
      membership = claimedMembership;
    }

    if (!membership && email && fallbackState) {
      await bootstrapOwnerIfNeeded(userId, email, fallbackState);
      const { data: ownerMembership } = await supabase
        .from('md_calculator_memberships')
        .select('user_id, email, display_name, role, org_owner_id, parent_email')
        .eq('user_id', userId)
        .maybeSingle();
      membership = ownerMembership;
    }

    if (!membership) {
      return { auth: email ? { email, role: 'rep' } : null, state: null, scenarios: [], teamMembers: [], mode: 'org' };
    }

    const orgOwnerId = membership.org_owner_id as string;
    const [{ data: orgState }, { data: memberships }, { data: scenarios }] = await Promise.all([
      supabase.from('md_calculator_org_state').select('app_state').eq('org_owner_id', orgOwnerId).maybeSingle(),
      supabase.from('md_calculator_memberships').select('user_id, email, display_name, role, parent_email').eq('org_owner_id', orgOwnerId).order('display_name', { ascending: true }),
      supabase.from('md_calculator_scenarios').select('id, name, saved_at, state').eq('user_id', orgOwnerId).order('saved_at', { ascending: false }),
    ]);

    const teamMembers: TeamMember[] = (memberships ?? []).map((member) => ({
      email: member.email as string,
      displayName: member.display_name as string,
      role: (member.role as TeamMember['role']) ?? 'rep',
      parentEmail: (member.parent_email as string | null) ?? null,
      userId: (member.user_id as string | null) ?? null,
    }));

    return {
      auth: {
        email: membership.email as string,
        role: (membership.role as AuthState['role']) ?? 'rep',
        displayName: (membership.display_name as string | null) ?? undefined,
        orgOwnerId,
      },
      state: (orgState?.app_state as AppState | null) ?? null,
      scenarios: (scenarios ?? []).map((scenario) => ({
        id: scenario.id as string,
        name: scenario.name as string,
        savedAt: scenario.saved_at as string,
        state: scenario.state as AppState,
      })),
      teamMembers,
      mode: 'org',
    };
  } catch (error) {
    console.error('Org-state load failed, falling back to legacy state.', error);
    return loadLegacyState(userId);
  }
}

export async function saveRemoteState(auth: AuthState, state: AppState, scenarios: SavedScenario[]) {
  if (!supabase) return;
  const session = await getSupabaseSession();
  if (!session?.user) return;

  try {
    const { data: membership } = await supabase
      .from('md_calculator_memberships')
      .select('org_owner_id, role, display_name, email')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!membership) throw new Error('No membership found for current user.');

    await supabase.from('md_calculator_org_state').upsert({
      org_owner_id: membership.org_owner_id,
      app_state: state,
      updated_at: new Date().toISOString(),
    });

    if ((membership.role as AuthState['role']) === 'owner') {
      await supabase.from('md_calculator_scenarios').delete().eq('user_id', membership.org_owner_id as string);
      if (scenarios.length) {
        await supabase.from('md_calculator_scenarios').insert(
          scenarios.map((scenario) => ({
            id: scenario.id,
            user_id: membership.org_owner_id as string,
            name: scenario.name,
            saved_at: scenario.savedAt,
            state: scenario.state,
          })),
        );
      }
    }
  } catch (error) {
    console.error('Org-state save failed, falling back to legacy save.', error);
    await supabase.from('md_calculator_profiles').upsert({
      user_id: session.user.id,
      manager_name: auth.displayName ?? state.settings.managerName,
      role: auth.role,
      app_state: state,
      updated_at: new Date().toISOString(),
    });

    await supabase.from('md_calculator_scenarios').delete().eq('user_id', session.user.id);
    if (scenarios.length) {
      await supabase.from('md_calculator_scenarios').insert(
        scenarios.map((scenario) => ({
          id: scenario.id,
          user_id: session.user.id,
          name: scenario.name,
          saved_at: scenario.savedAt,
          state: scenario.state,
        })),
      );
    }
  }
}

export async function saveTeamMembers(auth: AuthState, teamMembers: TeamMember[]) {
  if (!supabase || !canManageTeam(auth.role) || !auth.orgOwnerId) return;
  await supabase.from('md_calculator_memberships').upsert(
    teamMembers.map((member) => ({
      user_id: member.userId ?? null,
      email: normalizeEmail(member.email),
      display_name: member.displayName,
      role: member.role,
      org_owner_id: auth.orgOwnerId,
      parent_email: member.parentEmail ? normalizeEmail(member.parentEmail) : null,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'email' },
  );
}
