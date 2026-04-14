'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/ui/Container';
import Lightbox from '@/components/ui/Lightbox';
import { cn } from '@/lib/utils';
import { IMAGES } from '@/lib/images';

const categories = ['all', 'balustrades', 'ramen', 'deuren', 'garagepoorten', 'trappen', 'balkons'] as const;

export default function RealisatiesContent() {
  const t = useTranslations('RealisatiesPage.filter');
  const [filter, setFilter] = useState<typeof categories[number]>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const projects = IMAGES.projects;
  const filtered = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  return (
    <section className="py-20 lg:py-28 bg-off-white">
      <Container>
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setLightboxIndex(null); }}
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
              className="group relative aspect-[4/3] rounded-sm overflow-hidden cursor-pointer"
              onClick={() => setLightboxIndex(i)}
            >
              <Image
                src={project.src}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent z-10 transition-colors group-hover:from-charcoal/50" />

              {/* Zoom icon on hover */}
              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                <span className="inline-block px-2 py-0.5 bg-gold/20 text-gold text-xs font-medium rounded mb-2 capitalize backdrop-blur-sm">
                  {project.category}
                </span>
                <h3 className="text-white font-medium text-sm">{project.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={filtered.map((p) => ({ src: p.src, title: p.title }))}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
