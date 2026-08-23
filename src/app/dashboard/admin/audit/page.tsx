"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Clock, User, FileText } from "lucide-react";

interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: any;
  ipAddress?: string;
  timestamp: string;
  organization?: { name: string };
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [skip]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?limit=${limit}&skip=${skip}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-100 text-green-800";
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800";
    if (action.includes("DELETE")) return "bg-red-100 text-red-800";
    if (action.includes("PASSWORD")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Audit Log
        </h2>
        <p className="text-muted-foreground">Nachvollziehbarkeit aller Systemaktivitäten.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitäten</CardTitle>
          <CardDescription>Insgesamt {total} Einträge</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Entität</TableHead>
                  <TableHead>Entitäts-ID</TableHead>
                  <TableHead>Organisation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDate(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)} variant="secondary">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        {log.entityType}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.entityId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.organization?.name || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Zeige {skip + 1} - {Math.min(skip + limit, total)} von {total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSkip(Math.max(0, skip - limit))} disabled={skip === 0}>
                Zurück
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSkip(skip + limit)} disabled={skip + limit >= total}>
                Weiter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
