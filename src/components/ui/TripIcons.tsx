// src/components/ui/TripIcons.tsx
import React from "react";

export type TripIconProps = {
  /** Размер в px (width & height). По подразбиране 24 */
  size?: number;
  /** Допълнителен className за стилизиране */
  className?: string;
};

function baseSvgProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
  };
}

/**
 * Икона за „Море“ – слънце + вълни.
 */
export const TripBeachIcon: React.FC<TripIconProps> = ({
  size = 24,
  className,
}) => (
  <svg {...baseSvgProps(size, className)}>
    {/* слънце */}
    <circle
      cx="7"
      cy="7"
      r="3"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
    />
    <path
      d="M7 2.5V3.5M7 10.5V11.5M3.5 7H2.5M11.5 7H10.5M4.6 4.6L3.9 3.9M10.1 10.1L9.4 9.4M4.6 9.4L3.9 10.1M10.1 3.9L9.4 4.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    {/* вълни */}
    <path
      d="M3 16C4 16.6 4.7 17 6 17C7.3 17 8 16.6 9 16C10 15.4 10.7 15 12 15C13.3 15 14 15.4 15 16C16 16.6 16.7 17 18 17C19.3 17 20 16.6 21 16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 19C4 19.6 4.7 20 6 20C7.3 20 8 19.6 9 19C10 18.4 10.7 18 12 18C13.3 18 14 18.4 15 19C16 19.6 16.7 20 18 20C19.3 20 20 19.6 21 19"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Икона за „Екскурзия“ – пин + пътечка.
 */
export const TripExcursionIcon: React.FC<TripIconProps> = ({
  size = 24,
  className,
}) => (
  <svg {...baseSvgProps(size, className)}>
    {/* пин */}
    <path
      d="M8 5.5C8 3.6 9.6 2 11.5 2C13.4 2 15 3.6 15 5.5C15 7.9 11.5 11.2 11.5 11.2C11.5 11.2 8 7.9 8 5.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle
      cx="11.5"
      cy="5.5"
      r="1.3"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
    />

    {/* пътечка */}
    <path
      d="M5 18C6.2 17.2 7.4 16.9 8.5 17C9.6 17.1 10.6 17.6 11.5 18C12.4 18.4 13.4 18.9 14.5 19C15.6 19.1 16.8 18.8 18 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 14.5L5 16"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M17 13L18.5 14.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Икона за „Друго“ – минималистичен куфар.
 */
export const TripOtherIcon: React.FC<TripIconProps> = ({
  size = 24,
  className,
}) => (
  <svg {...baseSvgProps(size, className)}>
    {/* тяло на куфара */}
    <rect
      x="5"
      y="7"
      width="14"
      height="12"
      rx="2.3"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
    />
    {/* дръжка */}
    <path
      d="M10 7V5.8C10 4.8 10.8 4 11.8 4H12.2C13.2 4 14 4.8 14 5.8V7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* вътрешни линии */}
    <path
      d="M9 11V15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M15 11V15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
