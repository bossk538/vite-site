import { useState } from 'react';
import { Button } from '../../components/Button';
import { ThemeProvider } from '../../theme/ThemeProvider';
import type { Brand, Mode } from '../tokens/themes.css';
import { vars } from '../../tokens/contract.css';
import * as s from './ButtonDemo.css';

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const sizes = ['small', 'medium', 'large'] as const;

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

function Showcase({ brand, mode }: { brand: Brand; mode: Mode }) {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <ThemeProvider brand={brand} mode={mode}>
      <section className={s.panel} aria-labelledby={`${brand}-${mode}`}>
        <h2 id={`${brand}-${mode}`} className={s.heading}>
          {brand === 'brandA' ? 'Brand A' : 'Brand B'} · {mode}
        </h2>

        {(['primary', 'secondary'] as const).map((intent) => (
          <div key={intent} className={s.swatches} aria-hidden="true">
            {steps.map((step) => (
              <div key={step} className={s.swatch} style={{ background: vars.color[intent][step] }} />
            ))}
          </div>
        ))}

        {(['primary', 'secondary'] as const).map((intent) => (
          <div key={intent} className={s.row}>
            {sizes.map((size) => (
              <Button key={size} intent={intent} size={size}>
                {intent} {size}
              </Button>
            ))}
          </div>
        ))}

        <div className={s.row}>
          <Button startIcon={<PlusIcon />}>Add item</Button>
          <Button intent="secondary" aria-label="Add item" startIcon={<PlusIcon />} />
          <Button disabled>Disabled</Button>
          <Button loading={saving} onClick={save}>
            {saving ? 'Saving' : 'Save'}
          </Button>
        </div>
      </section>
    </ThemeProvider>
  );
}

export default function ButtonDemo() {
  return (
    <main className={s.grid}>
      <Showcase brand="brandA" mode="light" />
      <Showcase brand="brandA" mode="dark" />
      <Showcase brand="brandB" mode="light" />
      <Showcase brand="brandB" mode="dark" />
    </main>
  );
}
