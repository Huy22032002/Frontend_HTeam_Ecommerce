import { useEffect, useState } from 'react';
import type { UserSummary } from '../models/dashboard/UserSummary';
import { UserApi } from '../api/user/UserApi';

export function useUsers(page = 0, size = 20) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    UserApi.getAll(page, size)
      .then(res => {
        if (res.data && res.data.content) {
          setUsers(res.data.content);
        } else if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          setUsers([]);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, size]);

  return { users, loading, error };
}
