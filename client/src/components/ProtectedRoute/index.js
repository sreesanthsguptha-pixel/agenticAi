import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
