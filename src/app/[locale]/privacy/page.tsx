import { setRequestLocale } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { COMPANY } from '@/lib/constants';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({ title: 'Privacybeleid | Tipto BV', description: 'Het privacybeleid van Tipto BV. Hoe wij uw persoonsgegevens beschermen en verwerken.', locale, path: '/privacy' });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-off-white">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-gray">
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-8">Privacybeleid</h1>
          <p className="text-sm text-gray-400 mb-8">Laatst bijgewerkt: april 2026</p>

          <h2>1. Wie zijn wij?</h2>
          <p>{COMPANY.name}, gevestigd te {COMPANY.address.full}, BTW-nummer {COMPANY.vat}, is verantwoordelijk voor de verwerking van uw persoonsgegevens zoals beschreven in dit privacybeleid.</p>
          <p>Contact: {COMPANY.email} | {COMPANY.phoneDisplay}</p>

          <h2>2. Welke gegevens verzamelen wij?</h2>
          <p>Wij verzamelen de volgende categorieën persoonsgegevens:</p>
          <ul>
            <li><strong>Contactgegevens:</strong> naam, e-mailadres, telefoonnummer, adres</li>
            <li><strong>Offertegegevens:</strong> productvoorkeuren, configuratie-instellingen, projectbeschrijving</li>
            <li><strong>Technische gegevens:</strong> IP-adres, browsertype, apparaatgegevens (via cookies)</li>
            <li><strong>Communicatiegegevens:</strong> berichten via het contactformulier</li>
          </ul>

          <h2>3. Waarvoor gebruiken wij uw gegevens?</h2>
          <ul>
            <li>Het beantwoorden van uw vragen en offerteaanvragen</li>
            <li>Het opstellen en opvolgen van offertes</li>
            <li>Het verbeteren van onze website en dienstverlening</li>
            <li>Het verzenden van relevante informatie over onze producten (alleen met uw toestemming)</li>
            <li>Het voldoen aan wettelijke verplichtingen</li>
          </ul>

          <h2>4. Rechtsgrond voor verwerking</h2>
          <p>Wij verwerken uw gegevens op basis van:</p>
          <ul>
            <li><strong>Toestemming:</strong> wanneer u ons contactformulier invult of cookies accepteert</li>
            <li><strong>Uitvoering van een overeenkomst:</strong> wanneer u een offerte aanvraagt of een bestelling plaatst</li>
            <li><strong>Gerechtvaardigd belang:</strong> voor het verbeteren van onze website en diensten</li>
            <li><strong>Wettelijke verplichting:</strong> voor boekhoudkundige en fiscale doeleinden</li>
          </ul>

          <h2>5. Hoe lang bewaren wij uw gegevens?</h2>
          <p>Wij bewaren uw persoonsgegevens niet langer dan strikt noodzakelijk:</p>
          <ul>
            <li>Contactgegevens: tot 2 jaar na laatste contact</li>
            <li>Offertegegevens: tot 5 jaar na offertedatum</li>
            <li>Factuurgegevens: 7 jaar (wettelijke bewaarplicht)</li>
          </ul>

          <h2>6. Delen met derden</h2>
          <p>Wij delen uw gegevens niet met derden, tenzij dit noodzakelijk is voor onze dienstverlening (bijv. onderaannemers voor installatie) of wij hiertoe wettelijk verplicht zijn. Wij verkopen uw gegevens nooit aan derden.</p>

          <h2>7. Uw rechten</h2>
          <p>Op grond van de AVG/GDPR heeft u de volgende rechten:</p>
          <ul>
            <li>Recht op inzage in uw persoonsgegevens</li>
            <li>Recht op rectificatie van onjuiste gegevens</li>
            <li>Recht op verwijdering van uw gegevens</li>
            <li>Recht op beperking van de verwerking</li>
            <li>Recht op overdraagbaarheid van gegevens</li>
            <li>Recht om bezwaar te maken tegen de verwerking</li>
          </ul>
          <p>U kunt uw rechten uitoefenen door contact op te nemen via {COMPANY.email}.</p>

          <h2>8. Beveiliging</h2>
          <p>Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen ongeoorloofde toegang, verlies of misbruik.</p>

          <h2>9. Klachten</h2>
          <p>Indien u een klacht heeft over de verwerking van uw persoonsgegevens, kunt u contact opnemen met de Gegevensbeschermingsautoriteit (GBA): <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener noreferrer">www.gegevensbeschermingsautoriteit.be</a></p>
        </div>
      </Container>
    </div>
  );
}
