"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Check, User, Lock, Globe } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setName(data.user.name || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Profil erfolgreich aktualisiert" });
        fetchProfile();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Fehler beim Aktualisieren" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwörter stimmen nicht überein" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Passwort erfolgreich geändert" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Fehler beim Ändern" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Netzwerkfehler" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Einstellungen</h2>
        <p className="text-muted-foreground">Verwalten Sie Ihr Profil und Ihre Sicherheitseinstellungen.</p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="h-4 w-4 mr-2" />
            Passwort
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="h-4 w-4 mr-2" />
            Präferenzen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profilinformationen</CardTitle>
              <CardDescription>Aktualisieren Sie Ihre persönlichen Daten.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" value={profile?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rolle</Label>
                <Input id="role" value={profile?.role || ""} disabled />
              </div>
              <Button onClick={updateProfile} disabled={loading}>
                {loading ? "Speichern..." : "Speichern"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Passwort ändern</CardTitle>
              <CardDescription>Ändern Sie Ihr Passwort für mehr Sicherheit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={changePassword} disabled={loading}>
                {loading ? "Ändern..." : "Passwort ändern"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Präferenzen</CardTitle>
              <CardDescription>Sprache und Regionaleinstellungen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sprache</Label>
                <p className="text-sm text-muted-foreground">Deutsch (vorerst festgelegt)</p>
              </div>
              <div className="space-y-2">
                <Label>Zeitzone</Label>
                <p className="text-sm text-muted-foreground">Europe/Berlin (vorerst festgelegt)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
