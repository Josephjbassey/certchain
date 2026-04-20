import { createContext, useContext, useState, ReactNode } from 'react';

// Using dummy types for User/Session since Supabase is gone
interface User { id: string; email?: string }
interface Session { access_token: string }

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Temporary pure-dApp mock auth state
  // In the future this will be replaced by Hedera Wallet Connect state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setUser(null);
    setSession(null);
  };

  const signIn = (newUser: User) => {
    setUser(newUser);
    setSession({ access_token: "dummy" });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
