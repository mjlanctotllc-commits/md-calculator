import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, AuthState, SavedScenario } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseEnabled = Boolean(url && anonKey);
export const supabase: SupabaseClient | null = supabaseEnabled ? createClient(url!, anonKey!) : null;

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

export async function loadRemoteState(userId: string): Promise<{ auth: Partial<AuthState> | null; state: AppState | null; scenarios: SavedScenario[] }> {
  if (!supabase) return { auth: null, state: null, scenarios: [] };

  const [{ data: profile }, { data: scenarios }] = await Promise.all([
    supabase.from('md_calculator_profiles').select('manager_name, role, app_state').eq('user_id', userId).maybeSingle(),
    supabase.from('md_calculator_scenarios').select('id, name, saved_at, state').eq('user_id', userId).order('saved_at', { ascending: false }),
  ]);

  return {
    auth: profile ? { role: (profile.role as AuthState['role']) ?? 'manager' } : null,
    state: (profile?.app_state as AppState | null) ?? null,
    scenarios: (scenarios ?? []).map((scenario) => ({
      id: scenario.id as string,
      name: scenario.name as string,
      savedAt: scenario.saved_at as string,
      state: scenario.state as AppState,
    })),
  };
}

export async function saveRemoteState(auth: AuthState, state: AppState, scenarios: SavedScenario[]) {
  if (!supabase) return;
  const session = await getSupabaseSession();
  if (!session?.user) return;

  await supabase.from('md_calculator_profiles').upsert({
    user_id: session.user.id,
    manager_name: state.settings.managerName,
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
