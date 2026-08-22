import { marked } from 'marked';
import { readFileSync, writeFileSync } from 'fs';

const CSS = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 860px; margin: 40px auto; padding: 0 24px 80px; color: #1a1a1a; line-height: 1.7; }
  h1 { font-size: 2rem; margin-bottom: 0.3em; } h2 { font-size: 1.4rem; margin-top: 2em; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.3em; }
  h3 { font-size: 1.1rem; margin-top: 1.5em; } pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
  code { background: #f0f0f0; padding: 2px 5px; border-radius: 4px; font-size: 0.9em; }
  pre code { background: none; padding: 0; } blockquote { border-left: 3px solid #d0d0d0; margin-left: 0; padding-left: 16px; color: #555; }
  table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #f5f5f5; } a { color: #6B3FA0; }
`;

const files = [
  ['2. Primitives_Primer.md',                                        'AD-Primitives-Primer-md.html',           'Primitives Primer'],
  ['2025_11 - Bachatt Discussion Document.md',                       'AD-Bachatt-Discussion.html',              'Bachatt Discussion Document'],
  ['8. FundsIndia_Strategy_Deck Biz Leadership.md',                  'AD-FI-Strategy-Deck-Biz.html',           'FundsIndia Strategy Deck — Biz Leadership'],
  ['F-fundsindia_strategy_report_1.md',                              'AD-FI-Strategy-Report.html',             'FundsIndia Strategy Report'],
  ['FundsIndia_V1_App_Release_and_Migration_Options_v0_4.md',        'AD-V1-App-Release-Migration.html',       'V1 App Release & Migration Options'],
  ['Indian FinTech Coming of Age.md',                                'AD-Indian-FinTech-Coming-of-Age.html',   'Indian FinTech Coming of Age'],
  ['Investor Playbook __ FundsIndia _ Product View of Investor Lifecycle(1).md', 'AD-Investor-Playbook-FI.html', 'Investor Playbook — FundsIndia Product View'],
  ['Spec 1 Domain_Entity_Model_and_Event_Spine.md',                  'AD-Spec1-Domain-Entity-Model.html',      'Spec 1 — Domain Entity Model & Event Spine'],
  ['Spec 2 The_Canonical_Ledger.md',                                 'AD-Spec2-Canonical-Ledger.html',         'Spec 2 — The Canonical Ledger'],
];

const SRC  = '/Users/adarshattavar/Desktop/additionalfiktdocs';
const DEST = '/Users/adarshattavar/projects/fundsindia-onboarding/public/reading-material';

for (const [src, dest, title] of files) {
  const md = readFileSync(`${SRC}/${src}`, 'utf8');
  const body = marked.parse(md);
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${CSS}</style></head><body>${body}</body></html>`;
  writeFileSync(`${DEST}/${dest}`, html);
  console.log(`✓ ${dest}`);
}
