export default function TermsOfServicePage() {
  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <h1 className="h3 fw-bold mb-4">Allgemeine Geschäftsbedingungen (AGB)</h1>
      <p className="text-muted mb-4">Stand: August 2026</p>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">1. Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Software NephroAssist
          (nachfolgend „Plattform"), betrieben von der NephroAssist GmbH (nachfolgend „Anbieter").
          Die Plattform unterstützt medizinische Einrichtungen bei der Koordination von
          Nierentransplantationsprozessen.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">2. Vertragsgegenstand</h2>
        <p>
          Der Anbieter stellt dem Nutzer – vorbehaltlich einer gültigen Vereinbarung –
          eine cloudbasierte Softwarelösung zur Verfügung, die folgende Funktionen umfasst:
        </p>
        <ul>
          <li>Patienten-Onboarding und Statusverfolgung</li>
          <li>Verwaltung von Untersuchungsanforderungen und Dokumenten</li>
          <li>Kommunikation zwischen Patienten und Klinikpersonal</li>
          <li>Termin- und Aufgabenmanagement</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">3. Nutzungsberechtigung</h2>
        <p>
          Die Nutzung der Plattform ist nur nach erfolgreicher Registrierung und
          Bestätigung der E-Mail-Adresse möglich. Jeder Nutzer ist für die Sicherheit
          seiner Zugangsdaten selbst verantwortlich. Die Weitergabe von Zugangsdaten an
          Dritte ist untersagt.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">4. Datenschutz und Datensicherheit</h2>
        <p>
          Der Anbieter verpflichtet sich, die geltenden datenschutzrechtlichen Bestimmungen
          (DSGVO, BDSG) einzuhalten. Gesundheitsdaten werden gemäß den Anforderungen an
          besondere Kategorien personenbezogener Daten (Art. 9 DSGVO) verarbeitet.
          Eine Übermittlung von Daten außerhalb des EWR erfolgt nur auf Grundlage
          angemessener Garantien.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">5. Haftungsausschluss und Gewährleistung</h2>
        <p>
          Die Plattform dient der Unterstützung, nicht der Ersetzung ärztlicher Entscheidungen.
          Der Anbieter haftet nicht für medizinische Fehlentscheidungen, die auf der Nutzung
          der Software beruhen. Eine Haftung für leichte Fahrlässigkeit ist auf
          vertragswesentliche Pflichten begrenzt.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">6. Vertragslaufzeit und Kündigung</h2>
        <p>
          Der Verauf läuft auf unbestimmte Zeit, sofern nicht eine feste Laufzeit vereinbart wurde.
          Beide Parteien können den Vertrag mit einer Frist von 30 Tagen zum Monatsende kündigen.
          Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">7. Änderungen der AGB</h2>
        <p>
          Änderungen dieser AGB werden dem Nutzer mindestens 30 Tage vor Inkrafttreten
          schriftlich oder per E-Mail mitgeteilt. Stimmt der Nutzer den geänderten
          Bedingungen nicht zu, kann er den Vertrag fristgerecht kündigen.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">8. Schlussbestimmungen</h2>
        <p>
          Soweit einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sind,
          bleibt der Rest des Vertrages wirksam. Es gilt das Recht der Bundesrepublik Deutschland
          unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist der Sitz des Anbieters,
          sofern der Nutzer Kaufmann ist.
        </p>
      </section>

      <p className="text-muted mt-5" style={{ fontSize: "0.85rem" }}>
        Bei Fragen zu diesen AGB erreichen Sie uns unter{" "}
        <a href="mailto:support@nephroassist.de">support@nephroassist.de</a>.
      </p>
    </div>
  );
}
