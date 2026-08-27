"use client";

import { useState } from "react";
import { Pill, Plus, Pencil, Trash2, Check, X } from "lucide-react";

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

const emptyForm = {
  name: "",
  substance: "",
  dose: "",
  morning: false,
  noon: false,
  evening: false,
  night: false,
  notes: "",
};

export default function MedicationPlan({ patientId, initialMedications }: Props) {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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
    setAdding(false);
  };

  const startAdd = () => {
    setForm(emptyForm);
    setAdding(true);
    setEditingId(null);
  };

  const cancel = () => {
    setEditingId(null);
    setAdding(false);
    setForm(emptyForm);
  };

  const handleSave = async (medicationId?: string) => {
    if (!form.name.trim() || !form.substance.trim() || !form.dose.trim()) return;
    setSaving(true);

    try {
      if (medicationId) {
        const res = await fetch(`/api/patients/${patientId}/medications/${medicationId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Fehler beim Speichern");
        const updated = await res.json();
        setMedications((prev) => prev.map((m) => (m.id === medicationId ? updated : m)));
      } else {
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
      cancel();
    } catch {
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sind Sie sicher, dass Sie dieses Medikament entfernen möchten?")) return;
    try {
      const res = await fetch(`/api/patients/${patientId}/medications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      setMedications((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Fehler beim Löschen");
    }
  };

  const isEditing = (id: string) => editingId === id;

  const timeCell = (checked: boolean, onChange?: () => void) =>
    onChange ? (
      <div className="form-check d-flex justify-content-center">
        <input
          type="checkbox"
          className="form-check-input"
          checked={checked}
          onChange={onChange}
          style={{ cursor: "pointer" }}
        />
      </div>
    ) : checked ? (
      <span className="badge bg-success">✓</span>
    ) : (
      <span className="text-muted">—</span>
    );

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Pill size={18} /> Medikamentenplan
        </div>
        {!adding && (
          <button
            className="btn btn-light btn-sm d-flex align-items-center gap-1"
            onClick={startAdd}
          >
            <Plus size={14} /> Medikament hinzufügen
          </button>
        )}
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Wirkstoff</th>
                <th style={{ width: "100px" }}>Dosis</th>
                <th className="text-center" style={{ width: "80px" }}>Morgens</th>
                <th className="text-center" style={{ width: "80px" }}>Mittags</th>
                <th className="text-center" style={{ width: "80px" }}>Abends</th>
                <th className="text-center" style={{ width: "80px" }}>Nachts</th>
                <th className="text-end" style={{ width: "120px" }}></th>
              </tr>
            </thead>
            <tbody>
              {/* Neue Zeile (Hinzufügen) */}
              {adding && (
                <tr className="table-warning">
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      autoFocus
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Wirkstoff"
                      value={form.substance}
                      onChange={(e) => setForm({ ...form, substance: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Dosis"
                      value={form.dose}
                      onChange={(e) => setForm({ ...form, dose: e.target.value })}
                    />
                  </td>
                  <td className="text-center">{timeCell(form.morning, () => setForm({ ...form, morning: !form.morning }))}</td>
                  <td className="text-center">{timeCell(form.noon, () => setForm({ ...form, noon: !form.noon }))}</td>
                  <td className="text-center">{timeCell(form.evening, () => setForm({ ...form, evening: !form.evening }))}</td>
                  <td className="text-center">{timeCell(form.night, () => setForm({ ...form, night: !form.night }))}</td>
                  <td className="text-end">
                    <div className="d-flex gap-1 justify-content-end">
                      <button
                        className="btn btn-success btn-sm d-flex align-items-center gap-1"
                        onClick={() => handleSave()}
                        disabled={saving}
                        title="Speichern"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                        onClick={cancel}
                        title="Abbrechen"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Bestehende Medikamente */}
              {medications.map((med) =>
                isEditing(med.id) ? (
                  <tr key={med.id} className="table-warning">
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        autoFocus
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.substance}
                        onChange={(e) => setForm({ ...form, substance: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.dose}
                        onChange={(e) => setForm({ ...form, dose: e.target.value })}
                      />
                    </td>
                    <td className="text-center">{timeCell(form.morning, () => setForm({ ...form, morning: !form.morning }))}</td>
                    <td className="text-center">{timeCell(form.noon, () => setForm({ ...form, noon: !form.noon }))}</td>
                    <td className="text-center">{timeCell(form.evening, () => setForm({ ...form, evening: !form.evening }))}</td>
                    <td className="text-center">{timeCell(form.night, () => setForm({ ...form, night: !form.night }))}</td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          className="btn btn-success btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleSave(med.id)}
                          disabled={saving}
                          title="Speichern"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                          onClick={cancel}
                          title="Abbrechen"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={med.id}>
                    <td className="fw-medium">{med.name}</td>
                    <td>{med.substance}</td>
                    <td>{med.dose}</td>
                    <td className="text-center">{timeCell(med.morning)}</td>
                    <td className="text-center">{timeCell(med.noon)}</td>
                    <td className="text-center">{timeCell(med.evening)}</td>
                    <td className="text-center">{timeCell(med.night)}</td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                          onClick={() => startEdit(med)}
                          title="Bearbeiten"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleDelete(med.id)}
                          title="Löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {medications.length === 0 && !adding && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    <Pill size={24} className="mb-2 d-block mx-auto" />
                    Noch keine Medikamente eingetragen
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
