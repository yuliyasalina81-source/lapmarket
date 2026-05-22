import { forwardRef } from "react";

const variants = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50",
  secondary:
    "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-50",
  ghost: "text-stone-600 hover:bg-stone-100 disabled:opacity-50",
};

type Variant = keyof typeof variants;

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ className = "", variant = "primary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
