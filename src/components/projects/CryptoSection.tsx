import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Coins, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { useCMS, type CryptoAsset } from '../../context/CMSContext';

const shortAddress = (address: string) =>
  address.length > 20 ? `${address.slice(0, 8)}…${address.slice(-8)}` : address;

const CopyButton: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
};

const AuthorityBadge: React.FC<{ label: string; revoked: boolean; revokedText: string }> = ({ label, revoked, revokedText }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-fg">
    <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
    {label}: {revoked ? revokedText : 'Active'}
  </span>
);

const Spec: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="rounded-xl border border-border bg-bg/50 px-3 py-2.5">
    <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">{label}</p>
    <div className="mt-1 text-xs font-medium leading-relaxed text-fg break-words">{children}</div>
  </div>
);

const CryptoCard: React.FC<{ crypto: CryptoAsset; index: number }> = ({ crypto, index }) => {
  const logoSrc = crypto.logo
    ? crypto.logo.startsWith('http')
      ? crypto.logo
      : `${import.meta.env.BASE_URL}${crypto.logo}`
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay: index * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-2xl sm:p-8"
    >
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/5 blur-[60px]" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-start gap-4">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${crypto.name} logo`}
              className="h-16 w-16 shrink-0 rounded-2xl border border-border object-cover"
              width="64"
              height="64"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 font-serif text-xl font-bold text-accent">
              {crypto.symbol.slice(0, 2)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-2xl font-bold tracking-tight text-fg">{crypto.name}</h3>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-accent">
                {crypto.symbol}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                {crypto.status}
              </span>
            </div>
            <p className="mt-1 font-serif text-sm italic text-muted">{crypto.tagline}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">{crypto.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <AuthorityBadge label="Mint authority" revoked={crypto.mintRevoked} revokedText="Revoked — supply is fixed forever" />
          <AuthorityBadge label="Freeze authority" revoked={crypto.freezeRevoked} revokedText="Revoked — balances can't be frozen" />
          <AuthorityBadge label="Metadata" revoked={crypto.metadataRevoked} revokedText="Immutable" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Spec label="Network">{crypto.network}</Spec>
          <Spec label="Token standard">{crypto.standard}</Spec>
          <Spec label="Decimals">{crypto.decimals}</Spec>
          <Spec label="Total supply">{crypto.totalSupply}</Spec>
          <Spec label="Launched">{crypto.launched}</Spec>
          <Spec label="Holder">
            {crypto.holderLabel}
            <span className="mt-1 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span className="break-all">{shortAddress(crypto.holderWallet)}</span>
              <CopyButton value={crypto.holderWallet} label={`${crypto.name} holder wallet`} />
            </span>
            {crypto.holderAta ? (
              <span className="mt-1 flex items-center gap-2 font-mono text-[11px] text-muted">
                <span className="break-all">ATA {shortAddress(crypto.holderAta)}</span>
                <CopyButton value={crypto.holderAta} label={`${crypto.name} holder token account`} />
              </span>
            ) : null}
          </Spec>
        </div>

        <div className="mt-3 rounded-xl border border-border bg-bg/50 px-3 py-2.5">
          <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Mint address</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all font-mono text-xs text-fg">{crypto.mintAddress}</code>
            <CopyButton value={crypto.mintAddress} label={`${crypto.name} mint address`} />
            <a
              href={crypto.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`View ${crypto.symbol} on Solana Explorer`}
              aria-label={`View ${crypto.symbol} on Solana Explorer`}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <a
            href={crypto.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-accent hover:underline"
          >
            Verify on Solana Explorer <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
          {crypto.metadataUri ? (
            <p className="mt-1 break-all text-[11px] leading-relaxed text-muted">
              On-chain metadata: <a href={crypto.metadataUri} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{crypto.metadataUri}</a>
            </p>
          ) : null}
        </div>

        {crypto.rescueShare ? (
          <div className="mt-4 rounded-2xl border border-accent/25 bg-accent/5 px-4 py-3">
            <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-accent">{crypto.shareLabel || 'Rescue Share'}</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-fg">{crypto.rescueShare}</p>
          </div>
        ) : null}

        {crypto.utility.length > 0 ? (
          <div className="mt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">Token utility</h4>
            <ul className="mt-2 space-y-1.5">
              {crypto.utility.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                  <Coins className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {crypto.products.length > 0 ? (
          <div className="mt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">Ecosystem products</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {crypto.products.map((product) => (
                <span key={product} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg">
                  {product}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {crypto.allocations.length > 0 ? (
          <div className="mt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">Genesis allocation — blueprint plan</h4>
            <div className="mt-2 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface/60 text-[9px] uppercase tracking-widest text-muted">
                    <th className="px-3 py-2 font-bold">Pool</th>
                    <th className="px-3 py-2 font-bold">Share</th>
                    <th className="px-3 py-2 font-bold">Tokens</th>
                    <th className="px-3 py-2 font-bold">Release</th>
                  </tr>
                </thead>
                <tbody>
                  {crypto.allocations.map((row) => {
                    const parts = row.split(' — ');
                    return (
                      <tr key={row} className="border-b border-border/50 last:border-0">
                        {parts.map((part, i) => (
                          <td key={`${row}-${i}`} className="px-3 py-2 leading-relaxed text-muted first:font-semibold first:text-fg">
                            {part}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {crypto.transactions.length > 0 ? (
          <details className="mt-6 rounded-xl border border-border bg-bg/50 px-4 py-3">
            <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
              Devnet transactions — {crypto.transactions.length} on-chain records
            </summary>
            <ul className="mt-3 space-y-2">
              {crypto.transactions.map((line) => {
                const idx = line.indexOf(': ');
                const label = idx >= 0 ? line.slice(0, idx) : 'Transaction';
                const sig = idx >= 0 ? line.slice(idx + 2) : line;
                return (
                  <li key={sig} className="text-xs leading-relaxed text-muted">
                    <span className="font-semibold text-fg">{label}: </span>
                    <a
                      href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-mono text-[11px] text-accent hover:underline"
                    >
                      {sig}
                    </a>
                  </li>
                );
              })}
            </ul>
          </details>
        ) : null}

        {crypto.blueprint ? (
          <p className="mt-6 text-xs leading-relaxed text-muted">
            <span className="font-bold text-fg">Blueprint: </span>
            {crypto.blueprint}
          </p>
        ) : null}

        {crypto.mainnetNotes ? (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            <span className="font-bold text-fg">Mainnet: </span>
            {crypto.mainnetNotes}
          </p>
        ) : null}
      </div>
    </motion.article>
  );
};

const CryptoSection: React.FC = () => {
  const { content } = useCMS();
  const cryptos = content?.cryptos ?? [];

  if (cryptos.length === 0) return null;

  return (
    <section aria-labelledby="crypto-heading" className="relative mx-auto max-w-7xl px-6 pb-12 pt-8 lg:px-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Digital Assets</p>
          <h2 id="crypto-heading" className="mt-2 font-serif text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Crypto
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">
            Tokens built by Somniel on Solana devnet. All three are test-network scaffolds with fixed supply and revoked
            authorities — they have no monetary value, are not for sale, and cannot be minted further.
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted">
          {cryptos.length} tokens · Solana devnet
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {cryptos.map((crypto, i) => (
          <CryptoCard key={crypto.id} crypto={crypto} index={i} />
        ))}
      </div>
    </section>
  );
};

export default CryptoSection;
