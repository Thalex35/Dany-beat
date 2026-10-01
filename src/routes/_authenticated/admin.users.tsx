import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge, ErrorState, Skeleton } from "@/components/ui/states";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { deleteRegularUser } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

type UserRow = {
  id: string;
  display_name: string | null;
  email: string;
  created_at: string;
  likes: number;
  comments: number;
  last_seen: string | null;
  is_admin: boolean;
};

function AdminUsers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<UserRow[]> => {
      const { data, error } = await supabase.rpc("admin_users_overview");
      if (error) throw error;
      return (data ?? []) as unknown as UserRow[];
    },
  });

  const setAdmin = useMutation({
    mutationFn: async ({ id, make }: { id: string; make: boolean }) => {
      const { error } = await supabase.rpc("admin_set_admin", { _user_id: id, _make: make });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Rôle mis à jour");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Le rôle n'a pas pu être mis à jour."),
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => deleteRegularUser({ data: { userId } }),
    onSuccess: async (_, userId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "overview"] }),
        queryClient.invalidateQueries({ queryKey: ["beat-stats"] }),
      ]);
      setUserToDelete(null);
      toast.success("Utilisateur supprimé");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "L'utilisateur n'a pas pu être supprimé.",
      ),
  });

  if (users.isError) {
    return (
      <ErrorState
        title="Une erreur est survenue"
        description="Les utilisateurs n'ont pas pu être chargés."
        onRetry={() => void users.refetch()}
      />
    );
  }

  return (
    <div className="admin-users-page space-y-6">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow text-primary">Audience</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">Utilisateurs</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Suivez vos auditeurs et gérez les accès à l'espace administration.
          </p>
        </div>
        <div className="admin-page-icon">
          <ShieldCheck />
        </div>
      </header>
      <div className="admin-data-panel overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-surface text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Nom</th>
              <th className="px-4 py-3 font-normal">E-mail</th>
              <th className="px-4 py-3 font-normal">Inscription</th>
              <th className="px-4 py-3 font-normal">Favoris</th>
              <th className="px-4 py-3 font-normal">Commentaires</th>
              <th className="px-4 py-3 font-normal">Dernière visite</th>
              <th className="px-4 py-3 font-normal">Rôle</th>
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.isPending ? (
              <tr>
                <td colSpan={8} className="px-4 py-6">
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            ) : (users.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun utilisateur inscrit pour le moment.
                </td>
              </tr>
            ) : (
              (users.data ?? []).map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3">{u.display_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{u.likes}</td>
                  <td className="px-4 py-3 tabular-nums">{u.comments}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.last_seen ? new Date(u.last_seen).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.is_admin ? <Badge>Admin</Badge> : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={setAdmin.isPending || (u.is_admin && u.id === user?.id)}
                        onClick={() => setAdmin.mutate({ id: u.id, make: !u.is_admin })}
                      >
                        {u.is_admin ? "Retirer l'accès admin" : "Nommer admin"}
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!u.is_admin ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Supprimer ${u.email}`}
                        title="Supprimer l'utilisateur"
                        disabled={deleteUser.isPending || u.id === user?.id}
                        onClick={() => setUserToDelete(u)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open && !deleteUser.isPending) setUserToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete?.email} sera supprimé. Son profil, ses likes, commentaires, panier et
              demandes d'achat seront effacés. Ses événements de statistiques seront conservés sans
              lien vers son compte. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                disabled={deleteUser.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  if (userToDelete) deleteUser.mutate(userToDelete.id);
                }}
              >
                {deleteUser.isPending ? "Suppression…" : "Supprimer le compte"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
