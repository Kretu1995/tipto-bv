// Real Tipto project photos + Unsplash stock for categories without own photos

export const IMAGES = {
  hero: '/images/8.jpg',
  heroAlt: 'Tipto glazen balustrade op modern terras',

  products: {
    balustrades: {
      src: '/images/1b.jpg',
      alt: 'Tipto frameless glazen balustrade',
    },
    ramen: {
      src: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80&auto=format',
      alt: 'Moderne aluminium ramen met natuurlijk licht',
    },
    deuren: {
      src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format',
      alt: 'Premium houten voordeur',
    },
    garagepoorten: {
      src: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80&auto=format',
      alt: 'Moderne garagepoort',
    },
    trappen: {
      src: '/images/11b.jpg',
      alt: 'Tipto glazen trapbalustrade interieur',
    },
    balkons: {
      src: '/images/9.jpg',
      alt: 'Tipto glazen balkon zijmontage',
    },
  },

  materials: {
    inox: '/images/18.jpg',
    glass: '/images/3.jpg',
    aluminum: '/images/15.jpg',
    wood: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=600&q=80&auto=format',
    pvc: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80&auto=format',
    composite: 'https://images.unsplash.com/photo-1600566753086-00f18f6b87ac?w=600&q=80&auto=format',
  },

  about: {
    workshop: '/images/14.jpg',
    team: '/images/11b.jpg',
  },

  simulator: {
    preview: '/images/1b.jpg',
  },

  // Real Tipto project gallery — categorized by what the photo shows
  projects: [
    { src: '/images/1b.jpg', category: 'balustrades', title: 'Frameless glazen balustrade — Commercieel pand' },
    { src: '/images/3.jpg', category: 'balustrades', title: 'Glazen balustrade op dakterras — Moderne woning' },
    { src: '/images/8.jpg', category: 'balustrades', title: 'Zwarte glazen balustrade — Nieuwbouw terras' },
    { src: '/images/15.jpg', category: 'balustrades', title: 'Glazen balustrade met hoekoplossing — Tuin' },
    { src: '/images/20.jpg', category: 'balustrades', title: 'Glazen balustrade buitentrap — Renovatie' },
    { src: '/images/1.jpg', category: 'balkons', title: 'Zwarte spijlen balustrade — Terras' },
    { src: '/images/9.jpg', category: 'balkons', title: 'Glazen balkon zijmontage — Appartement' },
    { src: '/images/10.jpg', category: 'balkons', title: 'Verticale spijlen balkon — Renovatie' },
    { src: '/images/11.jpg', category: 'balkons', title: 'RVS balustrade dakterras — Stadswoning' },
    { src: '/images/11b.jpg', category: 'trappen', title: 'Zwarte glazen trapbalustrade — Interieur' },
    { src: '/images/13.jpg', category: 'trappen', title: 'Design kruispatroon trapleuning — Moderne woning' },
    { src: '/images/14.jpg', category: 'trappen', title: 'Glazen trapbalustrade — Duplex appartement' },
    { src: '/images/18.jpg', category: 'trappen', title: 'RVS horizontale staven — Trapleuning' },
  ],
} as const;
