import React from 'react';
// If you haven't installed react-jazzicon:
// npm install react-jazzicon @types/react-jazzicon --save
let Jazzicon: any = null;
try {
  Jazzicon = require('react-jazzicon').default;
} catch (e) {
  Jazzicon = null;
}

interface AvatarProps {
  address?: string;
  src?: string | null | undefined;
  alt?: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = (props) => {
  const { address, src, alt = 'User Avatar', size = 32 } = props;

  if (typeof src === 'string' && src !== '') {
    return (
      <img
        src={typeof src === 'string' ? src : undefined}
        alt={alt}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        role="img"
        aria-label={alt}
      />
    );
  }
  if (address) {
    // Use Jazzicon for wallet addresses
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seed = parseInt(address.slice(2, 10), 16);
    return Jazzicon ? (
      <Jazzicon diameter={size} seed={seed} aria-label="Wallet Identicon" role="img" />
    ) : (
      <span
        className="rounded-full bg-gray-200 flex items-center justify-center text-gray-500"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Wallet Identicon Placeholder"
      >
        <svg className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
        </svg>
      </span>
    );
  }
  // Default fallback
  return (
    <span
      className="rounded-full bg-gray-200 flex items-center justify-center text-gray-500"
      style={{ width: size, height: size }}
    >
      <svg className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
      </svg>
    </span>
  );
};

export default Avatar;
