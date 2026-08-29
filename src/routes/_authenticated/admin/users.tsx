import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

import { ErrorState, Skeleton } from "@/components/ui/states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminUsersQuery } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const users = useQuery(adminUsersQuery);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tighter">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everyone who has created an account, most recent first.
      </p>

      <div className="mt-8">
        {users.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : users.isError ? (
          <ErrorState
            description="Users could not be loaded — make sure your account has the admin role."
            onRetry={() => void users.refetch()}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last seen</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.display_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {u.last_seen
                      ? formatDistanceToNow(new Date(u.last_seen), { addSuffix: true })
                      : "—"}
                  </TableCell>
                  <TableCell>{u.likes}</TableCell>
                  <TableCell>{u.comments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
