import { Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

interface PaidGateProps {
  children: React.ReactNode;
  isPaid: boolean;
  loading?: boolean;
}

export function PaidGate({ children, isPaid, loading = false }: PaidGateProps) {
  if (loading || isPaid) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[3px]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-background/70 backdrop-blur-[1px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock size={22} className="text-primary" />
        </div>
        <p className="mt-2 text-center text-sm font-black text-foreground">Συνδρομή απαιτείται</p>
        <Link to="/pricing">
          <Button size="sm" className="mt-3 h-9 rounded-full px-5 text-xs font-black">
            🔓 Ξεκλείδωσε
          </Button>
        </Link>
      </div>
    </div>
  );
}
