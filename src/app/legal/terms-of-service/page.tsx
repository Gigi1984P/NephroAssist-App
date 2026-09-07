"use client";

import { useTranslation } from "@/components/i18n-provider";

export default function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <h1 className="h3 fw-bold mb-4">{t("legal.termsTitle", "Allgemeine Geschäftsbedingungen (AGB)")}</h1>
      <p className="text-muted mb-4">{t("legal.effectiveDate", "Stand")}: August 2026</p>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">1. {t("legal.scope", "Geltungsbereich")}</h2>
        <p>{t("legal.scopeText", "Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Software NephroAssist, betrieben von der NephroAssist GmbH. Die Plattform unterstützt medizinische Einrichtungen bei der Koordination von Nierentransplantationsprozessen.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">2. {t("legal.subject", "Vertragsgegenstand")}</h2>
        <p>{t("legal.subjectText", "Der Anbieter stellt dem Nutzer eine cloudbasierte Softwarelösung zur Verfügung, die folgende Funktionen umfasst")}:</p>
        <ul>
          <li>{t("legal.subjectList1", "Patienten-Onboarding und Statusverfolgung")}</li>
          <li>{t("legal.subjectList2", "Verwaltung von Untersuchungsanforderungen und Dokumenten")}</li>
          <li>{t("legal.subjectList3", "Kommunikation zwischen Patienten und Klinikpersonal")}</li>
          <li>{t("legal.subjectList4", "Termin- und Aufgabenmanagement")}</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">3. {t("legal.eligibility", "Nutzungsberechtigung")}</h2>
        <p>{t("legal.eligibilityText", "Die Nutzung der Plattform ist nur nach erfolgreicher Registrierung und Bestätigung der E-Mail-Adresse möglich. Jeder Nutzer ist für die Sicherheit seiner Zugangsdaten selbst verantwortlich. Die Weitergabe von Zugangsdaten an Dritte ist untersagt.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">4. {t("legal.dataProtection", "Datenschutz und Datensicherheit")}</h2>
        <p>{t("legal.dataProtectionText", "Der Anbieter verpflichtet sich, die geltenden datenschutzrechtlichen Bestimmungen (DSGVO, BDSG) einzuhalten. Gesundheitsdaten werden gemäß den Anforderungen an besondere Kategorien personenbezogener Daten verarbeitet.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">5. {t("legal.liability", "Haftungsausschluss und Gewährleistung")}</h2>
        <p>{t("legal.liabilityText", "Die Plattform dient der Unterstützung, nicht der Ersetzung ärztlicher Entscheidungen. Der Anbieter haftet nicht für medizinische Fehlentscheidungen, die auf der Nutzung der Software beruhen.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">6. {t("legal.duration", "Vertragslaufzeit und Kündigung")}</h2>
        <p>{t("legal.durationText", "Der Vertrag läuft auf unbestimmte Zeit. Beide Parteien können den Vertrag mit einer Frist von 30 Tagen zum Monatsende kündigen. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">7. {t("legal.changes", "Änderungen der AGB")}</h2>
        <p>{t("legal.changesText", "Änderungen dieser AGB werden dem Nutzer mindestens 30 Tage vor Inkrafttreten schriftlich oder per E-Mail mitgeteilt. Stimmt der Nutzer den geänderten Bedingungen nicht zu, kann er den Vertrag fristgerecht kündigen.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">8. {t("legal.finalProvisions", "Schlussbestimmungen")}</h2>
        <p>{t("legal.finalProvisionsText", "Soweit einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sind, bleibt der Rest des Vertrages wirksam. Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.")}</p>
      </section>

      <p className="text-muted mt-5" style={{ fontSize: "0.85rem" }}>
        {t("legal.termsContact", "Bei Fragen zu diesen AGB erreichen Sie uns unter")} <a href="mailto:support@nephroassist.de">support@nephroassist.de</a>.
      </p>
    </div>
  );
}
