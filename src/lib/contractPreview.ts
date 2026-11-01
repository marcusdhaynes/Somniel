/**
 * Contract preview export helpers.
 * Editable preview fields are deliberately rendered as static values for print / PDF.
 * A typed name is NOT cryptographic identity verification or an electronic signature audit trail.
 */
export function freezeContractFields(root: HTMLElement): HTMLElement {
  const clone = root.cloneNode(true) as HTMLElement;
  const live = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-contract-field]'));
  const frozen = Array.from(clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-contract-field]'));
  frozen.forEach((field, index) => {
    const source = live[index];
    if (!source) return;
    const value = document.createElement('span');
    value.className = 'legal-export-value';
    if (source instanceof HTMLInputElement && (source.type === 'checkbox' || source.type === 'radio')) {
      value.textContent = source.checked ? '☑' : '☐';
    } else {
      value.textContent = source.value.trim() || '________________________';
    }
    field.replaceWith(value);
  });
  return clone;
}

export function printContractPreview(root: HTMLElement, title: string): void {
  // Open synchronously within the click gesture to avoid blocked popups.
  const popup = window.open('', '_blank');
  if (!popup) {
    window.alert('Allow popups to print this document.');
    return;
  }
  const documentHtml = freezeContractFields(root).outerHTML;
  const styles = Array.from(document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"],style'))
    .map(el => el.outerHTML).join('\n');
  const safeTitle = title.replace(/[<>&"']/g, '');
  popup.document.open();
  popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title>
    ${styles}
    <style>
      html,body{margin:0!important;padding:0!important;background:#fff!important;color:#161616!important}
      .contract-preview-sheet{max-width:100%!important;box-shadow:none!important;border:0!important;padding:0!important}
      .contract-preview-sheet>div{padding:0!important;margin:0!important;max-width:none!important}
      @page{size:A4;margin:12mm}
      @media print{.legal-document{max-width:none!important}.legal-clause,.legal-annex,.legal-field{break-inside:avoid}}
    </style></head><body><main class="contract-preview-sheet">${documentHtml}</main></body></html>`);
  popup.document.close();
  popup.addEventListener('load', () => {
    popup.focus();
    popup.print();
  }, { once: true });
}

export async function saveContractPdf(root: HTMLElement, title: string): Promise<void> {
  const { default: html2pdf } = await import('html2pdf.js');
  const frozen = freezeContractFields(root);
  frozen.classList.add('contract-preview-sheet');
  frozen.style.width = '794px';
  frozen.style.maxWidth = '794px';
  frozen.style.background = '#ffffff';
  // Snapshot must be attached to resolve document styles and fonts.
  frozen.style.position = 'absolute';
  frozen.style.left = '-10000px';
  frozen.style.top = '0';
  document.body.appendChild(frozen);
  try {
    await html2pdf().set({
      margin: [12, 10, 12, 10],
      filename: `${title.replace(/[^a-z0-9-_ ]/gi, '').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.96 },
      html2canvas: { scale: 1.5, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.legal-field', '.legal-clause', '.legal-annex'] }
    }).from(frozen).save();
  } finally {
    frozen.remove();
  }
}
