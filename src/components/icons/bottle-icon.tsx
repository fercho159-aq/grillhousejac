import type { SVGProps } from "react";

export function BottleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 2.118V6l-4 8v6h16v-6l-4-8V2.118" />
      <path d="M8 6h8" />
    </svg>
  );
}
