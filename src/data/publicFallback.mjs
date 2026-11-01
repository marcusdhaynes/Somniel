// Canonical public fallback content, used for immediate client rendering and
// build-time HTML pre-rendering. Firestore live content replaces these defaults.
export const PUBLIC_DEFAULTS = {
  hero: {
    title: "Building the Future of Enterprise",
    subtitle: "Somniel Holdings LLC is a premier global investment firm managing a diverse portfolio of market-leading subsidiaries and experimental initiatives.",
    cta: "Explore Our Portfolio"
  },
  subsidiaries: [
    { 
      id: '1', 
      name: 'Somniel Tech', 
      description: 'Advanced software solutions for enterprise scale.', 
      logo: 'https://picsum.photos/seed/tech/200/200', 
      website: '#',
      longDescription: 'Somniel Tech is the core technology arm of Somniel Holdings, focusing on building scalable, high-performance software systems for the modern enterprise.'
    },
    { 
      id: '2', 
      name: 'Somniel Energy', 
      description: 'Sustainable energy infrastructure and research.', 
      logo: 'https://picsum.photos/seed/energy/200/200', 
      website: '#',
      longDescription: 'Somniel Energy is dedicated to pioneering sustainable energy solutions, from advanced solar infrastructure to next-generation battery storage.'
    }
  ],
  founders: [
    { 
      id: '1', 
      name: 'Marcus D. Haynes', 
      role: 'CEO & Founder', 
      bio: 'Visionary leader with a passion for scalable systems and enterprise architecture.', 
      photo: 'https://picsum.photos/seed/founder/200/200',
      vision: 'To build a global ecosystem of companies that redefine how enterprise technology serves humanity.'
    }
  ],
  projects: [
    { id: '1', name: 'Project X', description: 'Classified experimental initiative.', status: 'Active', isExperimental: true }
  ],
};
