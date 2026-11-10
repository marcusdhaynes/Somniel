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
  // Solana devnet tokens built for Somniel. Both are test-network scaffolds
  // with fixed supply and revoked authorities — no monetary value, not for sale.
  // Verified on-chain (Nov 9, 2026): 1,000,000,000 supply, 6 decimals each,
  // mint / freeze / metadata-update authorities all null (revoked), Token-2022.
  cryptos: [
    {
      id: 'crypto-somn',
      name: 'Somniel',
      symbol: 'SOMN',
      tagline: 'The token of the Somniel holding-company ecosystem.',
      description: 'Somniel (SOMN) is the token of the Somniel holding-company ecosystem — Somniel Holdings LLC, a Wyoming LLC, with multiple operating companies planned beneath it. Minted on Solana devnet on October 11, 2026, as a fixed-supply Token-2022 asset with all authorities revoked.',
      network: 'Solana Devnet',
      standard: 'Token-2022',
      mintAddress: 'HvvwXLSvAz97PVoJcodFNnb9GSFPSKNLUG3kZFiesnmo',
      decimals: 6,
      totalSupply: '1,000,000,000 SOMN',
      status: 'Live on Devnet',
      explorerUrl: 'https://explorer.solana.com/address/HvvwXLSvAz97PVoJcodFNnb9GSFPSKNLUG3kZFiesnmo?cluster=devnet',
      holderWallet: 'FDsKHfBWPPepJsBF8soVi9NiiHHja3CAkNMk3uwQVGUZ',
      holderLabel: 'Deployer wallet',
      logo: '',
      metadataUri: 'https://muse.ai/files/1376310518896029/1096555332960295/mod9m9tax0msktqn1p1r4eel/somniel-metadata.json',
      launched: 'October 11, 2026',
      mintRevoked: true,
      freezeRevoked: true,
      metadataRevoked: true,
      utility: [
        'Ecosystem token for Somniel Holdings LLC and its future operating companies',
      ],
      allocations: [],
      products: [],
      transactions: [],
      mainnetNotes: 'Devnet scaffold only — no monetary value, no public sale. A mainnet mint would need a fresh wallet, real SOL for fees, permanent metadata hosting, and legal review first.',
    },
    {
      id: 'crypto-cern',
      name: 'Cernunnos',
      symbol: 'CERN',
      tagline: 'The accountable rescue economy.',
      description: 'Cernunnos (CERN) is the utility token of the Cernunnos animal-rescue fintech ecosystem — a for-profit software, payments and membership company where every transaction can become verified protection. The token is a utility and coordination layer, never the business model. Used for Rescue Pay, memberships, rewards, governance votes on rescue grants, and Rescue Card benefits.',
      network: 'Solana Devnet',
      standard: 'Token-2022',
      mintAddress: 'JC5P6U24CEQSJEAepW5CeShCu6iHMwLi3e95a2tbR9Lz',
      decimals: 6,
      totalSupply: '1,000,000,000 CERN',
      status: 'Live on Devnet',
      explorerUrl: 'https://explorer.solana.com/address/JC5P6U24CEQSJEAepW5CeShCu6iHMwLi3e95a2tbR9Lz?cluster=devnet',
      holderWallet: 'FDsKHfBWPPepJsBF8soVi9NiiHHja3CAkNMk3uwQVGUZ',
      holderLabel: 'Deployer wallet — holds all 1,000,000,000 CERN',
      holderAta: '8QeRB1JFpAVgyPL9UV14CFQ8JPnosxxiwG7iky7fsDZS',
      logo: 'crypto/cern-logo.jpg',
      metadataUri: 'https://muse.ai/files/1376310518896029/1462046949470052/dxav81vjsszenj8vmb7shbuk/cernunnos-metadata.json',
      launched: 'October 11, 2026',
      mintRevoked: true,
      freezeRevoked: true,
      metadataRevoked: true,
      utility: [
        'Rescue Pay — QR/NFC payments to verified cases and merchants (USDC settles value)',
        'Memberships and Rescue Passport benefits',
        'Rewards for verified rescue participation',
        'Governance votes on rescue grants',
        'Rescue Card benefits',
      ],
      allocations: [
        'Ecosystem rewards — 28% — 280M CERN — 10-year emission; usage milestones',
        'Community treasury — 20% — 200M CERN — Multisig; published proposals',
        'Company treasury — 18% — 180M CERN — 6-month cliff; 48-month linear',
        'Founder — 12% — 120M CERN — 12-month cliff; 48-month linear',
        'Rescue incentives — 10% — 100M CERN — 10-year grants/rewards; not rescue cash',
        'Liquidity — 7% — 70M CERN — Locked positions; staged deployment',
        'Team / advisors — 3% — 30M CERN — 12-month cliff; 36-month linear',
        'Early users — 2% — 20M CERN — Sybil-screened claims over 24 months',
      ],
      products: [
        'Verified animal pages',
        'Public Rescue Ledger',
        'Self-custodial wallet (external connection first)',
        'Rescue Pay (USDC settlement)',
        'NFC Rescue Card',
        'Shelter portal',
        'Memberships & Rescue Passport',
      ],
      transactions: [
        'Mint creation: 2tinQ9W84aKhzRdLWxcnHMywZQnaVao64JwbJbUz22fugFvLQjh9DajkhS1wfgtimTAxMgw1ePvAJf2QebW7bRDW',
        'Deployer ATA creation: 5HfYWQGZ3LQGiRuLzFtDP51ufu3323yY4ogjyLBKXkvhX26ihaNhZKuaFeCQ9HhYQdMrAhbq4FRMkSGo5XQs9c4p',
        'Supply mint: 4pzc2scxaW3sFvTUMDPVmwCuvTbCaro7ykUFbESRTK6fqCkoELGDaHgZaHx4pdvczqsF1pBmRvZEDM13QoXv4XB9',
        'Revoke mint authority: 3jB8D7e2cTZ2fPgNCZPf5ppMYV1MrBbyf6mXd1LHGHVDswamP3LDpkc6Q9m4hBoCJrn8nU9oVbidSpFcyBTbkuYZ',
        'Revoke freeze authority: 3DAQQ5uK1nud4fQkv8WTd6GQcjsjxGYRERGy65wmBxsnv2daRDonDVrKvaBPb2qpnFKAQmmcH81RhqF3A6qfWzdp',
        'Revoke metadata authority: 3x4ECPUriE3CJWNZGnMhVGxwJ9E5t2SJUW54i9k2v5Df2sBdKWiMo4JDXU8Papcu4Jd1r4gSYPg2uKmaM8qjzQed',
      ],
      rescueShare: '12% of recognized net platform revenue, permanently assigned to the Rescue Share.',
      blueprint: 'Cernunnos Blueprint v1.0 — 40-page implementation-ready blueprint, October 10, 2026. Covers tokenomics, revenue and rescue-allocation model, legal structure, trust architecture, product specs, tech stack, and a 30-day launch plan.',
      mainnetNotes: 'Mainnet gate (per blueprint): legal review before any mainnet token, permanent metadata hosting (Arweave/IPFS) instead of the expiring file link, fresh mainnet wallet + real SOL, and a re-run of the mint script against mainnet. The blueprint recommends plain SPL at 9 decimals on mainnet; the devnet scaffold as built is Token-2022 at 6 decimals. No public token sale at start; USDC settles value and CERN coordinates access.',
    },
  ],
};
