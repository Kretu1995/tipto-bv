import { setRequestLocale } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { COMPANY } from '@/lib/constants';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({ title: 'Cookiebeleid | Tipto BV', description: 'Het cookiebeleid van Tipto BV. Welke cookies wij gebruiken en waarom.', locale, path: '/cookies' });
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-off-white">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-gray">
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-8">Cookiebeleid</h1>
          <p className="text-sm text-gray-400 mb-8">Laatst bijgewerkt: april 2026</p>

          <h2>1. Wat zijn cookies?</h2>
          <p>Cookies zijn kleine tekstbestanden die op uw computer of mobiel apparaat worden opgeslagen wanneer u onze website bezoekt. Ze helpen ons om de website goed te laten functioneren en uw ervaring te verbeteren.</p>

          <h2>2. Welke cookies gebruiken wij?</h2>

          <h3>Strikt noodzakelijke cookies</h3>
          <p>Deze cookies zijn essentieel voor het functioneren van de website. Zonder deze cookies kunnen bepaalde functies niet werken.</p>
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-2 border-b">Cookie</th><th className="text-left p-2 border-b">Doel</th><th className="text-left p-2 border-b">Duur</th></tr></thead>
            <tbody>
              <tr><td className="p-2 border-b">tipto-cookie-consent</td><td className="p-2 border-b">Onthoudt uw cookievoorkeuren</td><td className="p-2 border-b">1 jaar</td></tr>
              <tr><td className="p-2 border-b">NEXT_LOCALE</td><td className="p-2 border-b">Onthoudt uw taalvoorkeur</td><td className="p-2 border-b">Sessie</td></tr>
            </tbody>
          </table>

          <h3>Analytische cookies</h3>
          <p>Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken. De gegevens worden geanonimiseerd verzameld.</p>
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-2 border-b">Cookie</th><th className="text-left p-2 border-b">Doel</th><th className="text-left p-2 border-b">Duur</th></tr></thead>
            <tbody>
              <tr><td className="p-2 border-b">Vercel Analytics</td><td className="p-2 border-b">Bezoekersstatistieken</td><td className="p-2 border-b">Sessie</td></tr>
            </tbody>
          </table>

          <h2>3. Hoe kunt u cookies beheren?</h2>
          <p>Bij uw eerste bezoek aan onze website kunt u via de cookiebanner aangeven of u cookies accepteert of weigert. U kunt uw voorkeuren op elk moment wijzigen door uw browsercookies te verwijderen.</p>
          <p>De meeste browsers bieden de mogelijkheid om cookies te blokkeren of te verwijderen via de instellingen. Raadpleeg de helpfunctie van uw browser voor meer informatie.</p>

          <h2>4. Contact</h2>
          <p>Heeft u vragen over ons cookiebeleid? Neem contact op via {COMPANY.email}.</p>
        </div>
      </Container>
    </div>
  );
}
