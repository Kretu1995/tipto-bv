// Curated Unsplash images for each section
// All images are free to use via Unsplash license

export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&auto=format',
  heroAlt: 'Modern luxury home with glass balustrade',

  products: {
    balustrades: {
      src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format',
      alt: 'Glass balustrade on modern terrace',
    },
    ramen: {
      src: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80&auto=format',
      alt: 'Modern aluminium windows with natural light',
    },
    deuren: {
      src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format',
      alt: 'Premium wooden entrance door',
    },
    garagepoorten: {
      src: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80&auto=format',
      alt: 'Modern garage door on residential home',
    },
    trappen: {
      src: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=800&q=80&auto=format',
      alt: 'Modern floating staircase design',
    },
    balkons: {
      src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format',
      alt: 'Modern balcony with glass railing',
    },
  },

  materials: {
    inox: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=600&q=80&auto=format',
    glass: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80&auto=format',
    aluminum: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80&auto=format',
    wood: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=600&q=80&auto=format',
    pvc: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80&auto=format',
    composite: 'https://images.unsplash.com/photo-1600566753086-00f18f6b87ac?w=600&q=80&auto=format',
  },

  about: {
    workshop: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80&auto=format',
    team: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80&auto=format',
  },

  simulator: {
    preview: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80&auto=format',
  },

  projects: [
    { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format', category: 'balustrades', title: 'Glazen balustrade — Villa Antwerpen' },
    { src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80&auto=format', category: 'balustrades', title: 'Inox balustrade — Appartement Brussel' },
    { src: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80&auto=format', category: 'ramen', title: 'PVC ramen — Renovatie Mechelen' },
    { src: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80&auto=format', category: 'ramen', title: 'Aluminium ramen — Nieuwbouw Lier' },
    { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format', category: 'deuren', title: 'Aluminium voordeur — Woning Aartselaar' },
    { src: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80&auto=format', category: 'garagepoorten', title: 'Sectionaalpoort — Garage Kontich' },
    { src: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=800&q=80&auto=format', category: 'trappen', title: 'Stalen trap — Loft Antwerpen' },
    { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format', category: 'balkons', title: 'Aluminium balkon — Appartement Gent' },
    { src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80&auto=format', category: 'balustrades', title: 'Poedercoating balustrade — Terras Hasselt' },
  ],
} as const;
