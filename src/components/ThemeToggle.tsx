import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <button
      onClick={toggleTheme}
      className={`text-xs tracking-widest transition-colors px-2 py-1 border rounded ${className}`}
      style={{
        borderColor: 'var(--border2)',
        color: 'var(--muted)',
        background: 'transparent',
      }}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
    </button>
  );
}
