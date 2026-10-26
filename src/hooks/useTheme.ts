import { useEffect, useState } from 'react';
import { loadTheme, saveTheme } from '@/lib/storage';

export function useTheme() {
  const [initial] = useState(() => loadTheme());
  const [theme, setTheme] = useState<'light' | 'dark'>(initial.theme);
  const [error, setError] = useState<string | null>(initial.error);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      saveTheme(theme);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar a preferência de tema.');
    }
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return { theme, error, toggle };
}
