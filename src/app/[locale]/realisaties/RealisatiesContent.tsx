'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';
import { IMAGES } from '@/lib/images';

const categories = ['all', 'balustrades', 'ramen', 'deuren', 'garagepoorten', 'trappen', 'balkons'] as const;

export default function RealisatiesContent() {
  const t = useTranslations('RealisatiesPage.filter');
  const [filter, setFilter] = useState<typeof categories[number]>('all');

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
              className="group relative aspect-[4/3] rounded-sm overflow-hidden cursor-pointer"
            >
              <Image
                src={project.src}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent z-10" />
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
    </section>
  );
}
