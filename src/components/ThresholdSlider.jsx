// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.

/**
 * @param {{ value: number, onChange: (value: number) => void }} props
 */
export function ThresholdSlider({ value, onChange }) {
  // TODO(onjamm-dev): replace with MUI <Slider>.
  return (
    <input
      type="range"
      min={0}
      max={255}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
