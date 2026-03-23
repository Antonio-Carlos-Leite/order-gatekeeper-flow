import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthUserInfo {
  user: User | null;
  userId: string;
  username: string;
  displayName: string;
  userType: 'funcionario' | 'diretor';
  empresaId: string;
  codigoAcesso: string;
  municipio: string;
}

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<AuthUserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Defer profile fetch to avoid deadlock
        setTimeout(() => fetchUserProfile(session.user), 0);
      } else {
        setUserInfo(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user: User) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, empresas:empresa_id(codigo_acesso, nome)')
        .eq('user_id', user.id)
        .single();

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const empresa = profile.empresas as any;
        setUserInfo({
          user,
          userId: user.id,
          username: profile.username,
          displayName: profile.display_name,
          userType: (roleData?.role as 'funcionario' | 'diretor') || 'funcionario',
          empresaId: profile.empresa_id,
          codigoAcesso: empresa?.codigo_acesso || '',
          municipio: empresa?.nome || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata: {
    empresa_id: string;
    display_name: string;
    username: string;
    role: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserInfo(null);
  };

  return { session, userInfo, loading, signIn, signUp, signOut };
}
