"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/i18n-provider";
import { TipTapEditor } from "@/components/tiptap-editor";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ArrowLeft,
} from "lucide-react";

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CmsListPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms/pages")
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm(t("cms.deleteConfirm", "Seite wirklich löschen?"))) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cms/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-4">
      <PageHeader
        title={t("cms.title", "CMS Seiten")}
        description={t("cms.description", "Inhaltsseiten verwalten")}
        action={
          <Link href="/dashboard/cms/new">
            <Button size="sm">
              <Plus size={16} className="me-2" />
              {t("cms.newPage", "Neue Seite")}
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading.title", "Laden...")}</span>
          </div>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center p-5 text-muted">
          <p>{t("cms.noPages", "Noch keine Seiten vorhanden.")}</p>
          <Link href="/dashboard/cms/new">
            <Button variant="outline" size="sm">
              <Plus size={16} className="me-2" />
              {t("cms.newPage", "Neue Seite")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("cms.table.title", "Titel")}</TableHead>
                <TableHead>{t("cms.table.slug", "Slug")}</TableHead>
                <TableHead>{t("cms.table.status", "Status")}</TableHead>
                <TableHead>{t("cms.table.updated", "Geändert")}</TableHead>
                <TableHead className="text-end">{t("cms.table.actions", "Aktionen")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted">
                    <code>{page.slug}</code>
                  </TableCell>
                  <TableCell>
                    {page.published ? (
                      <Badge variant="default">{t("cms.status.published", "Veröffentlicht")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("cms.status.draft", "Entwurf")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted">
                    {new Date(page.updatedAt).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Link href={`/dashboard/cms/${page.id}/edit`}>
                        <Button variant="ghost" size="sm" title={t("cms.edit", "Bearbeiten")}>
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={t("cms.delete", "Löschen")}
                        onClick={() => handleDelete(page.id)}
                        disabled={deletingId === page.id}>
                        <Trash2 size={16} className="text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
