'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';

const categories = ['all', 'balustrades', 'ramen', 'deuren', 'garagepoorten', 'trappen', 'balkons'] as const;

const projects = [
  { category: 'balustrades', title: 'Glazen balustrade — Villa Antwerpen' },
  { category: 'balustrades', title: 'Inox balustrade — Appartement Brussel' },
  { category: 'ramen', title: 'PVC ramen — Renovatie Mechelen' },
  { category: 'ramen', title: 'Aluminium ramen — Nieuwbouw Lier' },
  { category: 'deuren', title: 'Aluminium voordeur — Woning Aartselaar' },
  { category: 'garagepoorten', title: 'Sectionaalpoort — Garage Kontich' },
  { category: 'trappen', title: 'Stalen trap — Loft Antwerpen' },
  { category: 'balkons', title: 'Aluminium balkon — Appartement Gent' },
  { category: 'balustrades', title: 'Poedercoating balustrade — Terras Hasselt' },
];

export default function RealisatiesContent() {
  const t = useTranslations('RealisatiesPage.filter');
  const [filter, setFilter] = useState<typeof categories[number]>('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  return (
    <section className="py-20 lg:py-28 bg-off-white">
      <Container>
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-sm border transition-all cursor-pointer',
                filter === cat
                  ? 'bg-gold text-white border-gold'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gold/50'
              )}
            >
              {t(cat)}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <motion.div
              key={`${project.title}-${filter}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="group relative aspect-[4/3] bg-charcoal rounded-sm overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                <span className="inline-block px-2 py-0.5 bg-gold/20 text-gold text-xs font-medium rounded mb-2 capitalize">
                  {project.category}
                </span>
                <h3 className="text-white font-medium text-sm">{project.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
