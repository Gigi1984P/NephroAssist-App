"use client";

import { useTranslation } from "@/components/i18n-provider";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <h1 className="h3 fw-bold mb-4">{t("legal.privacyPolicyTitle", "Datenschutzerklärung")}</h1>
      <p className="text-muted mb-4">{t("legal.effectiveDate", "Stand")}: August 2026</p>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">1. {t("legal.responsible", "Verantwortlicher")}</h2>
        <p>{t("legal.responsibleText", "Verantwortlich für die Datenverarbeitung auf dieser Plattform ist")}:</p>
        <p className="fw-medium">{t("legal.companyName", "NephroAssist GmbH")}<br />
          Musterstraße 1<br />
          10115 Berlin<br />
          Deutschland<br />
          E-Mail: <a href="mailto:support@nephroassist.de">support@nephroassist.de</a>
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">2. {t("legal.purposes", "Zwecke der Datenverarbeitung")}</h2>
        <p>
          {t("legal.purposeList1", "Bereitstellung und Betrieb der NephroAssist-Plattform")}
        </p>
        <ul>
          <li>{t("legal.purposeList2", "Patienten-Onboarding und Koordination von Transplantationsprozessen")}</li>
          <li>{t("legal.purposeList3", "Benachrichtigungen zu Terminen, Aufgaben und Untersuchungen")}</li>
          <li>{t("legal.purposeList4", "Sicherstellung der Authentifizierung und Autorisierung")}</li>
          <li>{t("legal.purposeList5", "Erfüllung rechtlicher Aufbewahrungspflichten")}</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">3. {t("legal.legalBasis", "Rechtsgrundlagen")}</h2>
        <p>{t("legal.legalBasisText", "Die Verarbeitung erfolgt auf Grundlage folgender Rechtsgrundlagen")}:</p>
        <ul>
          <li>{t("legal.legalBasis1", "Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)")}</li>
          <li>{t("legal.legalBasis2", "Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)")}</li>
          <li>{t("legal.legalBasis3", "Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)")}</li>
          <li>{t("legal.legalBasis4", "Art. 9 Abs. 2 lit. h DSGVO (Gesundheitsdaten im Gesundheitswesen)")}</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">4. {t("legal.recipients", "Empfänger von Daten")}</h2>
        <p>{t("legal.recipientsText", "Daten werden nur an die für die Behandlung zuständigen Mitarbeiter der jeweiligen Klinik weitergegeben. Externe Dienstleister werden nur unter Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO eingesetzt.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">5. {t("legal.thirdCountries", "Datenübermittlung in Drittländer")}</h2>
        <p>{t("legal.thirdCountriesText", "Eine Übermittlung personenbezogener Daten in Länder außerhalb des EWR erfolgt nur, soweit dies erforderlich ist und angemessene Garantien im Sinne des Art. 44 ff. DSGVO vorliegen.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">6. {t("legal.retention", "Speicherdauer")}</h2>
        <p>{t("legal.retentionText", "Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorsehen. Anmeldedaten werden gelöscht, sobald das Konto geschlossen wird, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">7. {t("legal.rightsTitle", "Betroffenenrechte")}</h2>
        <p>{t("legal.rightsContact", "Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter")}:</p>
        <ul>
          <li>{t("legal.rightsList1", "Recht auf Auskunft (Art. 15 DSGVO)")}</li>
          <li>{t("legal.rightsList2", "Recht auf Berichtigung (Art. 16 DSGVO)")}</li>
          <li>{t("legal.rightsList3", "Recht auf Löschung (Art. 17 DSGVO)")}</li>
          <li>{t("legal.rightsList4", "Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)")}</li>
          <li>{t("legal.rightsList5", "Recht auf Datenübertragbarkeit (Art. 20 DSGVO)")}</li>
          <li>{t("legal.rightsList6", "Widerspruchsrecht (Art. 21 DSGVO)")}</li>
        </ul>
        <p>
          <a href="mailto:support@nephroassist.de">support@nephroassist.de</a>
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">8. {t("legal.complaintRight", "Beschwerderecht")}</h2>
        <p>{t("legal.complaintText", "Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.")}</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">9. {t("legal.securityTitle", "Sicherheitsmaßnahmen")}</h2>
        <p>{t("legal.securityText", "Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen. Dazu gehören Verschlüsselung im Transit und bei der Speicherung, Zugriffskontrollen sowie regelmäßige Sicherheitsüberprüfungen.")}</p>
      </section>

      <p className="text-muted mt-5" style={{ fontSize: "0.85rem" }}>
        {t("legal.privacyChangeNotice", "Diese Datenschutzerklärung kann sich ändern. Die jeweils aktuelle Version ist auf dieser Seite einsehbar.")}
      </p>
    </div>
  );
}
