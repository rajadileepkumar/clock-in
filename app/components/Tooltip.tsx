import React from "react";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
};

export default function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const positionClasses: Record<typeof position, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses: Record<typeof position, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900",
    left:
      "left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900",
  };

  return (
    <span className="relative inline-flex group">
      {children}

      <span
        role="tooltip"
        className={`
          pointer-events-none absolute z-50
          ${positionClasses[position]}
          opacity-0 group-hover:opacity-100 transition
        `}
      >
        {/* Tooltip box */}
        <span className="relative block rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap">
          {content}

          {/* Arrow */}
          <span
            className={`absolute w-0 h-0 ${arrowClasses[position]}`}
          />
        </span>
      </span>
    </span>
  );
}
