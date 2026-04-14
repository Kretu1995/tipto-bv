import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Tipto BV',
    default: 'Tipto BV — Vakmanschap in Aluminium, Glas & Staal',
  },
  description: 'Tipto BV is uw specialist in op maat gemaakte balustrades, ramen, deuren, garagepoorten, trappen en balkons. Al meer dan 17 jaar vakmanschap in België.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
