export default function ImpressumPage() {
  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <h1 className="h3 fw-bold mb-4">Impressum</h1>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">Angaben gemäß § 5 TMG</h2>
        <p className="fw-medium">
          NephroAssist GmbH<br />
          Musterstraße 1<br />
          10115 Berlin<br />
          Deutschland
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">Kontakt</h2>
        <p>
          Telefon: +49 (0) 30 123456789<br />
          E-Mail: <a href="mailto:support@nephroassist.de">support@nephroassist.de</a>
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">Vertreten durch</h2>
        <p>Geschäftsführer: Max Mustermann</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">Handelsregister</h2>
        <p>
          Registergericht: Amtsgericht Berlin-Charlottenburg<br />
          Registernummer: HRB 123456 B
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">Umsatzsteuer-ID</h2>
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />DE123456789</p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">Streitbeilegung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
          bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>.<br />
          Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor
          einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="h5 fw-semibold">Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen
          Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir
          als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte
          fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
          rechtswidrige Tätigkeit hinweisen.
        </p>
      </section>

      <p className="text-muted mt-5" style={{ fontSize: "0.85rem" }}>
        Dieses Impressum dient als Platzhalter. Die Angaben können vom Betreiber jederzeit
        aktualisiert werden.
      </p>
    </div>
  );
}
