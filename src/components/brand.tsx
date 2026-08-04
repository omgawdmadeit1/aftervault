import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  showWordmark = true,
  to = "/",
}: {
  className?: string;
  showWordmark?: boolean;
  to?: string;
}) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2.5 text-fg no-underline", className)}>
      <span className="grid size-9 place-items-center rounded-[var(--radius-md)] bg-primary text-primary-fg shadow-sm">
        <Shield className="size-4" strokeWidth={2.25} aria-hidden />
      </span>
      {showWordmark ? (
        <span className="text-[15px] font-semibold tracking-tight">
          After<span className="text-primary">Vault</span>
        </span>
      ) : null}
    </Link>
  );
}
