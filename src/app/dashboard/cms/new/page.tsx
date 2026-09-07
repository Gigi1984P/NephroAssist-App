"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/i18n-provider";
import { TipTapEditor } from "@/components/tiptap-editor";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";

export default function CmsNewPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(val: string) {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 100);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/cms/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug || generateSlug(title),
          title,
          content,
          published,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("cms.saveError", "Fehler beim Speichern"));
      } else {
        router.push("/dashboard/cms");
        router.refresh();
      }
    } catch {
      setError(t("cms.saveError", "Fehler beim Speichern"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <PageHeader
        title={t("cms.newPage", "Neue Seite")}
        description={t("cms.newDescription", "Neue CMS-Seite erstellen")}
        action={
          <Link href="/dashboard/cms">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} className="me-2" />
              {t("cms.back", "Zurück")}
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSave} className="d-flex flex-column gap-4">
        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        <div className="d-flex flex-column gap-2">
          <Label htmlFor="title">{t("cms.form.title", "Titel")} *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(generateSlug(e.target.value));
            }}
            placeholder={t("cms.form.titlePlaceholder", "Seitentitel")}
            required
          />
        </div>

        <div className="d-flex flex-column gap-2">
          <Label htmlFor="slug">{t("cms.form.slug", "Slug")} *</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="seiten-slug"
            required
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="published" className="mb-0">
            {t("cms.form.published", "Veröffentlicht")}
          </Label>
        </div>

        <div className="d-flex flex-column gap-2">
          <Label htmlFor="content">{t("cms.form.content", "Inhalt")}</Label>
          <TipTapEditor
            content={content}
            onChange={setContent}
            placeholder={t("cms.form.contentPlaceholder", "Inhalt eingeben...")}
          />
        </div>

        <div className="d-flex gap-2">
          <Button type="submit" disabled={saving}>
            <Save size={16} className="me-2" />
            {saving ? t("cms.saving", "Speichern...") : t("cms.save", "Speichern")}
          </Button>
          <Link href="/dashboard/cms">
            <Button type="button" variant="outline">
              {t("common.cancel", "Abbrechen")}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
