'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AVOBBadgeProps } from '@/types/avob';

const sizeConfig = {
  small: { width: 80, height: 80, className: 'w-20 h-20' },
  medium: { width: 120, height: 120, className: 'w-[120px] h-[120px]' },
  large: { width: 160, height: 160, className: 'w-40 h-40' },
};

const variantConfig = {
  standard: '/images/avob/AVOB.jpg',
  'defense-force': '/images/avob/AVOB_DF.png', // PNG for transparent background
};

export function AVOBBadge({
  variant = 'standard',
  size = 'medium',
  className = '',
  link = true,
}: AVOBBadgeProps) {
  const { width, height, className: sizeClass } = sizeConfig[size];
  const imagePath = variantConfig[variant];

  const badge = (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Image
        src={imagePath}
        alt="Australian Veteran Owned Business Certification"
        width={width}
        height={height}
        quality={95}
        priority={false}
        className={`${sizeClass} object-contain transition-transform hover:scale-105`}
      />
    </div>
  );

  if (link) {
    return (
      <Link
        href="https://avob.org.au"
        target="_blank"
        rel="noopener noreferrer"
        title="Verify Rocky Web Studio's AVOB certification"
        className="inline-block"
      >
        {badge}
      </Link>
    );
  }

  return badge;
}

export function AVOBBadgeWithText({
  variant = 'standard',
  size = 'medium',
}: Omit<AVOBBadgeProps, 'link'>) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <AVOBBadge variant={variant} size={size} link={true} />
      <div className="text-sm font-semibold text-muted-foreground">
        <p>Certified Australian</p>
        <p>Veteran Owned Business</p>
      </div>
    </div>
  );
}

