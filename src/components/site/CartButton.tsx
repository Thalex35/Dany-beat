import { useNavigate } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { useCartIds, useToggleCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { safeAuthRedirect } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function CartButton({
  beatId,
  className,
  size = "md",
}: {
  beatId: string;
  licenseId?: string | null;
  licenseName?: string | null;
  licensePrice?: number | null;
  className?: string;
  size?: "sm" | "md";
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ids } = useCartIds();
  const toggle = useToggleCart();
  const inCart = !!ids?.includes(beatId);

  return (
    <button
      type="button"
      aria-pressed={inCart}
      aria-label={inCart ? "Retirer ce beat du panier" : "Ajouter ce beat au panier"}
      disabled={toggle.isPending}
      onClick={() => {
        if (!user) {
          toast("Connectez-vous pour ajouter des beats au panier");
          navigate({
            to: "/auth",
            search: { redirect: safeAuthRedirect(window.location.pathname) },
          });
          return;
        }
        toggle.mutate({ beatId, inCart, licenseId, licenseName, licensePrice });
      }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full ring-1 transition-colors disabled:opacity-50",
        size === "sm" ? "size-9" : "size-9",
        inCart
          ? "bg-primary text-primary-foreground ring-primary"
          : "bg-background/90 text-foreground ring-border hover:bg-surface",
        className,
      )}
    >
      <ShoppingCart className="size-4" aria-hidden="true" />
    </button>
  );
}
