'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';

type MaterialItem = {
  title: string;
  description: string;
  image?: string;
};

type MaterialShowcaseProps = {
  sectionTitle: string;
  items: MaterialItem[];
};

export default function MaterialShowcase({ sectionTitle, items }: MaterialShowcaseProps) {
  return (
    <section className="py-12 sm:py-16 lg:py-28 bg-off-white">
      <Container>
        <SectionHeader title={sectionTitle} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow"
            >
              {/* Material image */}
              <div className="relative h-44 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
