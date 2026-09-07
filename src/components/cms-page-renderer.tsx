"use client";

import React, { useEffect, useState } from "react";

interface CmsPageRendererProps {
  slug: string;
}

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  updatedAt: string;
}

export function CmsPageRenderer({ slug }: CmsPageRendererProps) {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/cms/pages?slug=${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setPage(data.page);
        setLoading(false);
      })
      .catch(() => {
        setError("Seite nicht gefunden");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="alert alert-warning" role="alert">
        {error || "Seite nicht gefunden"}
      </div>
    );
  }

  return (
    <article className="cms-page">
      <h1 className="h3 fw-bold mb-4">{page.title}</h1>
      <div
        className="cms-content"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  );
}
