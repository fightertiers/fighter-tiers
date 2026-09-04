import { useApp } from '../contexts/AppContext';

interface Props {
  tierId: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function TierBadge({ tierId, size = 'md' }: Props) {
  const { state } = useApp();
  const tier = state.tiers.find((t) => t.id === tierId);
  if (!tier) return null;

  const sizes = {
    sm: { fontSize: '0.65rem', padding: '1px 6px' },
    md: { fontSize: '0.75rem', padding: '2px 8px' },
    lg: { fontSize: '0.9rem', padding: '4px 12px' },
  };

  return (
    <span
      style={{
        ...sizes[size],
        fontFamily: 'Rajdhani, sans-serif',
        fontWeight: 700,
        letterSpacing: '0.08em',
        borderRadius: '4px',
        background: `${tier.color}22`,
        border: `1px solid ${tier.color}55`,
        color: tier.color,
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {tier.name}
    </span>
  );
}
