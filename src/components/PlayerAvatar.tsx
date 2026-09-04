import { useState } from 'react';

interface Props {
  username: string;
  uuid?: string;
  size?: number;
  className?: string;
}

export default function PlayerAvatar({ username, size = 40, className = '' }: Props) {
  const [errored, setErrored] = useState(false);

  const src = errored
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1a1a2e&color=a78bfa&bold=true&size=${size * 2}`
    : `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${size * 2}`;

  return (
    <img
      src={src}
      alt={username}
      width={size}
      height={size}
      className={`rounded-md object-cover bg-white/5 ${className}`}
      style={{ imageRendering: size < 48 ? 'pixelated' : undefined }}
      onError={() => setErrored(true)}
    />
  );
}
