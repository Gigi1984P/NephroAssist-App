"use client";

import { useState } from "react";
import { Pill, Plus, Pencil, Trash2, Save } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  substance: string;
  dose: string;
  morning: boolean;
  noon: boolean;
  evening: boolean;
  night: boolean;
  notes?: string | null;
}

interface Props {
  patientId: string;
  initialMedications: Medication[];
}

export default function MedicationPlan({ patientId, initialMedications }: Props) {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    substance: "",
    dose: "",
    morning: false,
    noon: false,
    evening: false,
    night: false,
    notes: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      substance: "",
      dose: "",
      morning: false,
      noon: false,
      evening: false,
      night: false,
      notes: "",
    });
    setEditingId(null);
    setError("");
  };

  const startEdit = (med: Medication) => {
    setForm({
      name: med.name,
      substance: med.substance,
      dose: med.dose,
      morning: med.morning,
      noon: med.noon,
      evening: med.evening,
      night: med.night,
      notes: med.notes || "",
    });
    setEditingId(med.id);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        // UPDATE
        const res = await fetch(`/api/patients/${patientId}/medications/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Fehler beim Speichern");
        const updated = await res.json();
        setMedications((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
      } else {
        // CREATE
        const res = await fetch(`/api/patients/${patientId}/medications`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Fehler beim Erstellen");
        const created = await res.json();
        setMedications((prev) => [...prev, created]);
      }
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicationId: string) => {
    if (!confirm("Sind Sie sicher, dass Sie dieses Medikament entfernen möchten?")) return;

    try {
      const res = await fetch(`/api/patients/${patientId}/medications/${medicationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      setMedications((prev) => prev.filter((m) => m.id !== medicationId));
    } catch (err: any) {
      alert(err.message || "Fehler beim Löschen");
    }
  };

  const timeBadge = (active: boolean, label: string) =>
    active ? (
      <span className="badge bg-success me-1">{label}</span>
    ) : (
      <span className="badge bg-light text-muted me-1">{label}</span>
    );

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Pill size={18} /> Medikamentenplan
        </div>
        <button
          className="btn btn-light btn-sm d-flex align-items-center gap-1"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={14} /> Medikament hinzufügen
        </button>
      </div>

      <div className="card-body p-0">
        {medications.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Wirkstoff</th>
                  <th>Dosis</th>
                  <th colSpan={4} className="text-center">Einname</th>
                  <th style={{ width: "100px" }}></th>
                </tr>
                <tr className="table-light">
                  <th></th>
                  <th></th>
                  <th></th>
                  <th className="text-center">Morgens</th>
                  <th className="text-center">Mittags</th>
                  <th className="text-center">Abends</th>
                  <th className="text-center">Nachts</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med) => (
                  <tr key={med.id}>
                    <td className="fw-medium">{med.name}</td>
                    <td>{med.substance}</td>
                    <td>{med.dose}</td>
                    <td className="text-center">{timeBadge(med.morning, "M")}</td>
                    <td className="text-center">{timeBadge(med.noon, "M")}</td>
                    <td className="text-center">{timeBadge(med.evening, "A")}</td>
                    <td className="text-center">{timeBadge(med.night, "N")}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-primary btn-sm me-1"
                        onClick={() => startEdit(med)}
                        title="Bearbeiten"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(med.id)}
                        title="Löschen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted py-4">
            <Pill size={32} className="mb-2" />
            <div>Noch keine Medikamente eingetragen</div>
          </div>
        )}
      </div>

      {/* FORMULAR MODAL */}
      {showForm && (
        <>
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingId ? "Medikament bearbeiten" : "Medikament hinzufügen"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowForm(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger alert-sm">{error}</div>
                    )}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Medikamentenname</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          placeholder="z.B. Tacrolimus Sandoz"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Wirkstoff</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.substance}
                          onChange={(e) => setForm({ ...form, substance: e.target.value })}
                          required
                          placeholder="z.B. Tacrolimus"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Dosis</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.dose}
                          onChange={(e) => setForm({ ...form, dose: e.target.value })}
                          required
                          placeholder="z.B. 2mg"
                        />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label">Einname-Zeiten</label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="morning"
                              checked={form.morning}
                              onChange={(e) => setForm({ ...form, morning: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="morning">
                              Morgens
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="noon"
                              checked={form.noon}
                              onChange={(e) => setForm({ ...form, noon: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="noon">
                              Mittags
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="evening"
                              checked={form.evening}
                              onChange={(e) => setForm({ ...form, evening: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="evening">
                              Abends
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="night"
                              checked={form.night}
                              onChange={(e) => setForm({ ...form, night: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="night">
                              Nachts
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Notizen</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          placeholder="Optional: Hinweise zur Einnahme"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowForm(false)}
                      disabled={saving}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary d-flex align-items-center gap-1"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm" /> Speichern...
                        </>
                      ) : (
                        <>
                          <Save size={16} /> {editingId ? "Aktualisieren" : "Speichern"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ opacity: 0.5 }}></div>
        </>
      )}
    </div>
  );
}
