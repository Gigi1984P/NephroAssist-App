"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X } from "lucide-react";

interface DocumentUploadProps {
  patientId: string;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ patientId, onUploadComplete }: DocumentUploadProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Datei ist zu groß (max. 10 MB)");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError("Datei ist zu groß (max. 10 MB)");
        return;
      }
      setFile(droppedFile);
      setError("");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleUpload = async () => {
    if (!file || !documentType) {
      setError("Bitte wählen Sie eine Datei und einen Dokumenttyp");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", patientId);
    formData.append("documentType", documentType);

    try {
      // Simuliere Progress für bessere UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload fehlgeschlagen");
      }

      setFile(null);
      setDocumentType("");
      setOpen(false);
      router.refresh();
      onUploadComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Dokument hochladen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dokument hochladen</DialogTitle>
          <DialogDescription>
            Laden Sie ein medizinisches Dokument hoch (PDF, JPG, PNG, max. 10 MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              file ? "border-green-300 bg-green-50" : "border-slate-300 hover:border-slate-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Datei hierher ziehen oder
                </p>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:underline">Datei auswählen</span>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </Label>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">Dokumenttyp</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="laborbericht">Laborbericht</SelectItem>
                <SelectItem value="arztbrief">Arztbrief</SelectItem>
                <SelectItem value="befund">Befund</SelectItem>
                <SelectItem value="impfausweis">Impfausweis</SelectItem>
                <SelectItem value="versicherung">Versicherungsbescheinigung</SelectItem>
                <SelectItem value="sonstiges">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                {progress}% hochgeladen
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={uploading}
          >
            Abbrechen
          </Button>
          <Button onClick={handleUpload} disabled={!file || !documentType || uploading}>
            {uploading ? "Wird hochgeladen..." : "Hochladen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
