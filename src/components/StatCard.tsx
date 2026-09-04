interface Props {
  label: string;
  value: string | number;
  icon?: string;
  accent?: string;
}

export default function StatCard({ label, value, icon, accent = '#a78bfa' }: Props) {
  return (
    <div
      className="glass rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden"
      style={{ borderColor: `${accent}22` }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
        style={{ background: accent }}
      />
      {icon && <span className="text-2xl">{icon}</span>}
      <div
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 700,
          fontSize: '2rem',
          color: accent,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.8rem',
          color: 'rgba(148, 163, 184, 0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </div>
    </div>
  );
}
