
import { useAuth } from '../useAuthContext';

export function useAuthStatus() {
  const { isAuthenticated } = useAuth();
  return { isAuthenticated };
}
