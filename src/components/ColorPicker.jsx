// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.

/**
 * @param {{ valueHex: string, onChange: (hex: string) => void }} props
 */
export function ColorPicker({ valueHex, onChange }) {
  // TODO(onjamm-dev): replace with a proper color picker (MUI doesn't ship one -
  // a plain <input type="color"> or a small library is fine).
  return (
    <input
      type="color"
      value={`#${valueHex}`}
      onChange={(e) => onChange(e.target.value.replace('#', '').toUpperCase())}
    />
  );
}
