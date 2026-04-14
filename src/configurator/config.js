/**
 * Static frontend config — replaces the WordPress PHP config.
 * This is the exact same structure the ConfiguratorApp expects.
 */
const config = {
  brand: {
    name: 'Tipto',
    tagline: 'Balustrades op maat met een strakke, architecturale uitstraling.',
    description: 'Configureer uw balustrade, bekijk de 3D-preview in realtime en vraag direct een offerte aan.',
    price_label: 'Prijs op aanvraag',
    cta_label: 'Offerte aanvragen',
    privacy_url: '',
  },
  contact: {
    successText: 'Bedankt. Uw aanvraag is ontvangen. We nemen spoedig contact met u op.',
    errorText: 'Er ging iets mis bij het versturen. Probeer het opnieuw of neem rechtstreeks contact op.',
  },
  product: {
    defaults: {
      length: 240,
      height: 105,
      material: 'aluminium',
      finish: 'zwart-structuur',
      infill: 'glas',
      mounting: 'vloer',
      depth: 6,
      price_strategy: 'on_request',
    },
    length_range: { min: 50, max: 600, step: 5, unit: 'cm' },
    height_range: { min: 80, max: 120, step: 1, unit: 'cm' },
    depth_range: { min: 4, max: 12, step: 1, unit: 'cm' },
    materials: [
      { value: 'aluminium', label: 'Aluminium', description: 'Licht, strak en onderhoudsvriendelijk.' },
      { value: 'rvs', label: 'Roestvrij staal', description: 'Duurzaam en tijdloos met een technische uitstraling.' },
      { value: 'gepoedercoat-staal', label: 'Gepoedercoat staal', description: 'Sterke basis met hoogwaardige afwerking.' },
    ],
    finishes: [
      { value: 'zwart-structuur', label: 'Zwart structuur', hex: '#22262B', material: 'aluminium' },
      { value: 'antraciet-mat', label: 'Antraciet mat', hex: '#454B55', material: 'aluminium' },
      { value: 'wit-zijde', label: 'Wit zijde', hex: '#EEECE6', material: 'aluminium' },
      { value: 'inox-geborsteld', label: 'Inox geborsteld', hex: '#A9B0B5', material: 'rvs' },
      { value: 'champagne-metallic', label: 'Champagne metallic', hex: '#B39C74', material: 'gepoedercoat-staal' },
    ],
    infills: [
      { value: 'glas', label: 'Glas', description: 'Open zichtlijnen en een luxe uitstraling.' },
      { value: 'verticale-spijlen', label: 'Verticale spijlen', description: 'Tijdloos ritme met veilige opbouw.' },
      { value: 'horizontale-profielen', label: 'Horizontale profielen', description: 'Strakke horizontale lijnen voor moderne gevels.' },
      { value: 'horizontale-staven', label: 'Horizontale staven', description: 'Ronde of rechthoekige staven — elegant en tijdloos.' },
      { value: 'lamellen', label: 'Moderne lamellen', description: 'Architecturale privacy met een krachtig profielbeeld.' },
    ],
    mountings: [
      { value: 'vloer', label: 'Op de vloer', description: 'Klassieke plaatsing met voetplaten of profielen.' },
      { value: 'zijmontage', label: 'Zijmontage', description: 'Maximale loopruimte met strakke gevelbevestiging.' },
    ],
    extra_options: [
      { value: 'handrail-glas', label: 'Handrail bij glas' },
      { value: 'zaokraglenia', label: 'Afrondingen' },
    ],
  },
  pricing: {
    show_prices: true,
    price_display_label: 'Richtprijs',
    vat_rate: 0.21,
    disclaimer: 'Indicatieprijs incl. btw, excl. definitieve opmeting, transport en montage.',
    base_per_meter_by_infill: {
      'glas': 285,
      'verticale-spijlen': 185,
      'horizontale-profielen': 215,
      'horizontale-staven': 225,
      'lamellen': 235,
    },
    stair_surcharge: 180,
    material_multipliers: {
      'aluminium': 1.00,
      'rvs': 1.45,
      'gepoedercoat-staal': 1.20,
    },
    finish_surcharges: {
      'zwart-structuur': 0,
      'antraciet-mat': 8,
      'wit-zijde': 8,
      'inox-geborsteld': 0,
      'champagne-metallic': 14,
    },
    mounting_surcharges: {
      'vloer': 0,
      'zijmontage': 120,
    },
    extra_option_prices: {
      'handrail-glas': 45,
      'zaokraglenia': 140,
    },
  },
  ui: {
    loader_text: '3D-preview wordt geladen...',
    fallback_title: 'Preview in lichte modus',
    fallback_text: 'Uw toestel of browser ondersteunt geen volledige 3D-rendering. De configuratie blijft wel volledig beschikbaar.',
    quote_button_text: 'Offerte aanvragen',
    submit_text: 'Aanvraag verzenden',
  },
  // No WordPress AJAX - use Next.js API route instead
  request: {
    ajaxUrl: '/api/contact',
    action: 'tipto_submit_quote',
    nonce: '',
    uploadAction: '',
    uploadNonce: '',
    aiAction: '',
    aiNonce: '',
  },
};

export default config;
