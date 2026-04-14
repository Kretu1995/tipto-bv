import { setRequestLocale } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { COMPANY } from '@/lib/constants';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({ title: 'Algemene Voorwaarden | Tipto BV', description: 'De algemene voorwaarden van Tipto BV voor producten en diensten.', locale, path: '/algemene-voorwaarden' });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-off-white">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-gray">
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-8">Algemene Voorwaarden</h1>
          <p className="text-sm text-gray-400 mb-8">Laatst bijgewerkt: april 2026</p>

          <h2>1. Identiteit van het bedrijf</h2>
          <p>{COMPANY.name}<br />
          {COMPANY.address.full}<br />
          BTW: {COMPANY.vat}<br />
          E-mail: {COMPANY.email}<br />
          Telefoon: {COMPANY.phoneDisplay}</p>

          <h2>2. Toepasselijkheid</h2>
          <p>Deze algemene voorwaarden zijn van toepassing op alle offertes, overeenkomsten en leveringen van {COMPANY.name}. Door het plaatsen van een bestelling of het aanvragen van een offerte aanvaardt de klant deze voorwaarden.</p>

          <h2>3. Offertes en prijzen</h2>
          <ul>
            <li>Alle offertes zijn vrijblijvend en geldig gedurende 30 dagen, tenzij anders vermeld.</li>
            <li>Prijzen zijn inclusief BTW, tenzij anders aangegeven.</li>
            <li>Richtprijzen op de website en in de 3D-simulator zijn indicatief en niet bindend.</li>
            <li>De definitieve prijs wordt vastgesteld na opmeting ter plaatse.</li>
          </ul>

          <h2>4. Opmeting en uitvoering</h2>
          <ul>
            <li>Een nauwkeurige opmeting door onze specialist is noodzakelijk voor de productie.</li>
            <li>De klant dient ervoor te zorgen dat de werkplek toegankelijk en klaar is voor installatie.</li>
            <li>Levertijden zijn indicatief. Vertragingen door overmacht geven geen recht op schadevergoeding.</li>
          </ul>

          <h2>5. Betaling</h2>
          <ul>
            <li>Bij bevestiging van de bestelling is een voorschot van 40% verschuldigd.</li>
            <li>Het resterende bedrag is verschuldigd bij oplevering.</li>
            <li>Facturen zijn betaalbaar binnen 14 dagen na factuurdatum.</li>
            <li>Bij laattijdige betaling is een verwijlinterest van 10% per jaar verschuldigd, plus een forfaitaire schadevergoeding van 10% van het factuurbedrag met een minimum van €50.</li>
          </ul>

          <h2>6. Garantie</h2>
          <ul>
            <li>Op alle producten geldt de wettelijke garantie van 2 jaar voor consumenten.</li>
            <li>Garantie op constructie en afwerking: 5 jaar, mits correct onderhoud.</li>
            <li>De garantie vervalt bij onjuist gebruik, wijziging door derden of gebrekkig onderhoud.</li>
          </ul>

          <h2>7. Klachten</h2>
          <p>Klachten dienen binnen 8 dagen na levering schriftelijk gemeld te worden aan {COMPANY.email}. Wij streven ernaar om elke klacht binnen 14 werkdagen af te handelen.</p>

          <h2>8. Aansprakelijkheid</h2>
          <p>De aansprakelijkheid van {COMPANY.name} is beperkt tot het factuurbedrag van de betreffende bestelling. Wij zijn niet aansprakelijk voor indirecte schade, gevolgschade of winstderving.</p>

          <h2>9. Intellectueel eigendom</h2>
          <p>Alle ontwerpen, tekeningen en technische documenten blijven eigendom van {COMPANY.name} en mogen niet zonder schriftelijke toestemming worden gereproduceerd of gedeeld met derden.</p>

          <h2>10. Toepasselijk recht en geschillen</h2>
          <p>Op alle overeenkomsten is het Belgisch recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechtbank van het arrondissement Antwerpen.</p>
        </div>
      </Container>
    </div>
  );
}
