"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Trash2 } from "lucide-react";
import type { UserRole } from "@prisma/client";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
}

interface AdminPanelProps {
  users: User[];
  organizations: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string; organizationId: string | null }>;
}

export function AdminPanel({ users, organizations, roles }: AdminPanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT" as UserRole,
    organizationId: "",
    roleId: "",
  });
  const [creating, setCreating] = useState(false);

  const handleCreateUser = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        throw new Error("Erstellen fehlgeschlagen");
      }

      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "PATIENT",
        organizationId: "",
        roleId: "",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Create user error:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRole = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_admin" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Toggle role error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin-Panel</h2>
          <p className="text-muted-foreground">
            Benutzer- und Rollenverwaltung
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Neuer Benutzer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Benutzer erstellen</DialogTitle>
              <DialogDescription>
                Neuen Benutzer mit Rolle und Organisation hinzufügen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rolle</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="COORDINATOR">Koordinator</SelectItem>
                    <SelectItem value="PHYSICIAN">Arzt</SelectItem>
                    <SelectItem value="NURSE">Pflegekraft</SelectItem>
                    <SelectItem value="PATIENT">Patient</SelectItem>
                    <SelectItem value="CAREGIVER">Angehöriger</SelectItem>
                    <SelectItem value="DIALYSIS_STAFF">Dialysepersonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organisation</Label>
                <Select
                  value={newUser.organizationId}
                  onValueChange={(value) => setNewUser({ ...newUser, organizationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Organisation wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateUser} disabled={creating}>
                {creating ? "Wird erstellt..." : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Benutzer</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "—"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    —
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.role === "ADMIN"}
                      onCheckedChange={() => handleToggleRole(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rollen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {organizations.find((o) => o.id === role.organizationId)?.name || "Global"}
                    </p>
                  </div>
                  <Badge>0 Benutzer</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organisationen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-2 border rounded">
                  <p className="font-medium">{org.name}</p>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
