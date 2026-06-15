import { useState, useEffect, useCallback, useRef } from 'react';

export function useData(fn, deps = []) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fn();
      if (mounted.current) setData(r);
    } catch (e) {
      if (mounted.current) setError(e.message || 'Failed to load');
    } finally {
      if (mounted.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  return { data, loading, error, refetch: load };
}

export function useForm(init) {
  const [values, setValues]   = useState(init);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setValues(p => ({ ...p, [k]: v }));
  const reset = () => { setValues(init); setErrors({}); };
  const clearErrors = () => setErrors({});

  const submit = (fn) => async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true); clearErrors();
    try { await fn(values); }
    catch (err) {
      if (err.data?.errors) {
        const fe = {};
        err.data.errors.forEach(e => { fe[e.path || e.field] = e.msg || e.message; });
        setErrors(fe);
      } else {
        setErrors({ _: err.message });
      }
    } finally { setLoading(false); }
  };

  return { values, errors, loading, set, reset, clearErrors, submit };
}
