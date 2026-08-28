export default function PrivacyPolicyPage() {
  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <h1 className="h3 fw-bold mb-4">Datenschutzerklärung</h1>
      <p className="text-muted mb-4">Stand: August 2026</p>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">1. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Plattform ist:
        </p>
        <p className="fw-medium">NephroAssist GmbH<br />
          Musterstraße 1<br />
          10115 Berlin<br />
          Deutschland<br />
          E-Mail: <a href="mailto:support@nephroassist.de">support@nephroassist.de</a>
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">2. Zwecke der Datenverarbeitung</h2>
        <p>
          Wir verarbeiten personenbezogene Daten ausschließlich für folgende Zwecke:
        </p>
        <ul>
          <li>Bereitstellung und Betrieb der NephroAssist-Plattform</li>
          <li>Patienten-Onboarding und Koordination von Transplantationsprozessen</li>
          <li>Benachrichtigungen zu Terminen, Aufgaben und Untersuchungen</li>
          <li>Sicherstellung der Authentifizierung und Autorisierung</li>
          <li>Erfüllung rechtlicher Aufbewahrungspflichten</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">3. Rechtsgrundlagen</h2>
        <p>Die Verarbeitung erfolgt auf Grundlage folgender Rechtsgrundlagen:</p>
        <ul>
          <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
          <li>Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)</li>
          <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
          <li>Art. 9 Abs. 2 lit. h DSGVO (Gesundheitsdaten im Gesundheitswesen)</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">4. Empfänger von Daten</h2>
        <p>
          Daten werden nur an die für die Behandlung zuständigen Mitarbeiter der jeweiligen
          Klinik weitergegeben. Externe Dienstleister (z. B. Hosting, E-Mail-Versand) werden
          nur unter Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO eingesetzt.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">5. Datenübermittlung in Drittländer</h2>
        <p>
          Eine Übermittlung personenbezogener Daten in Länder außerhalb des EWR erfolgt nur,
          soweit dies erforderlich ist und angemessene Garantien im Sinne des Art. 44 ff. DSGVO
          (z. B. Standardvertragsklauseln) vorliegen.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">6. Speicherdauer</h2>
        <p>
          Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen
          Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorsehen.
          Anmeldedaten werden gelöscht, sobald das Konto geschlossen wird, sofern keine
          gesetzlichen Aufbewahrungspflichten entgegenstehen.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">7. Betroffenenrechte</h2>
        <p>Sie haben folgende Rechte:</p>
        <ul>
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter{" "}
          <a href="mailto:support@nephroassist.de">support@nephroassist.de</a>.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">8. Beschwerderecht</h2>
        <p>
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehöde über die
          Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">9. Sicherheitsmaßnahmen</h2>
        <p>
          Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre
          Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen. Dazu gehören
          Verschlüsselung im Transit und bei der Speicherung, Zugriffskontrollen sowie
          regelmäßige Sicherheitsüberprüfungen.
        </p>
      </section>

      <p className="text-muted mt-5" style={{ fontSize: "0.85rem" }}>
        Diese Datenschutzerklärung kann sich ändern. Die jeweils aktuelle Version ist auf
        dieser Seite einsehbar.
      </p>
    </div>
  );
}
