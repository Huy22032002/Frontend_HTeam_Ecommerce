import { useEffect, useState, useRef } from 'react';
import type { UserSummary } from '../models/dashboard/UserSummary';
import { UserApi } from '../api/user/UserApi';

export function useUsers(page = 0, size = 20) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  
  // Use ref to prevent double-loading in React StrictMode (dev only)
  const hasLoadedRef = useRef(false);
  const prevParamsRef = useRef({ page, size });

  useEffect(() => {
    // Check if params changed
    const paramsChanged = prevParamsRef.current.page !== page || prevParamsRef.current.size !== size;
    
    // In StrictMode (dev), useEffect runs twice. Prevent double API calls.
    if (hasLoadedRef.current && !paramsChanged) {
      console.log("🔄 Skipping duplicate users fetch due to StrictMode");
      return;
    }
    
    hasLoadedRef.current = true;
    prevParamsRef.current = { page, size };
    
    console.log(`👥 Loading users (page: ${page}, size: ${size})...`);
    setLoading(true);
    
    UserApi.getAll(page, size)
      .then(res => {
        console.log("✅ Users loaded:", res.data?.content?.length || res.data?.length || 0, "items");
        if (res.data && res.data.content) {
          setUsers(res.data.content);
        } else if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          setUsers([]);
        }
      })
      .catch(e => {
        console.error("❌ Users error:", e);
        setError(e);
      })
      .finally(() => setLoading(false));
  }, [page, size]);

  return { users, loading, error };
}

