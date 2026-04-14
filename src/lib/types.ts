export type Product = {
  key: string;
  slug: string;
  icon: string;
};

export type Material = {
  key: string;
  label: string;
  color: string;
};

export type ConfiguratorState = {
  material: 'glass' | 'steel' | 'aluminum';
  color: string;
  railStyle: 'glass-panel' | 'horizontal-bars' | 'vertical-bars' | 'cable';
  postStyle: 'round' | 'square';
  height: number;
  panelCount: number;
};

export type Testimonial = {
  name: string;
  role: string;
  content: string;
  rating: number;
};

export type ProcessStep = {
  number: number;
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  product: string;
  message: string;
};
