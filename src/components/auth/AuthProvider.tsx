import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Se o evento for SIGNED_OUT, garantir limpeza
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, clearing state');
          setSession(null);
          setUser(null);
        }
        
        setLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', session?.user?.email || 'no user');
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: userData,
      },
    })
    return { error }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Limpar dados locais primeiro
      localStorage.clear(); // Limpa tudo do localStorage
      sessionStorage.clear(); // Limpa tudo do sessionStorage
      
      // Verificar se há sessão antes de tentar logout
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        console.log('📤 Signing out from Supabase...');
        // Só tenta logout se houver sessão válida
        const { error } = await supabase.auth.signOut();
        if (error && !error.message.includes('session missing')) {
          console.error('Logout error:', error);
        }
      } else {
        console.log('ℹ️ No active session found');
      }
      
      // Forçar limpeza de estado
      console.log('🧹 Clearing local state...');
      setSession(null);
      setUser(null);
      
      // Aguardar um pouco para garantir que o estado seja limpo
      setTimeout(() => {
        console.log('🔄 Redirecting to home...');
        window.location.replace('/');
      }, 100);
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Mesmo com erro, limpar estado local
      setSession(null);
      setUser(null);
      
      // Forçar redirecionamento mesmo com erro
      setTimeout(() => {
        window.location.replace('/');
      }, 100);
    }
  }

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}