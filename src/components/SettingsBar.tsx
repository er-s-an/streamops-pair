import { TUTORIALS } from "../engine/propose";
import type { Kind, Settings, Sensitivity } from "../types";

const LEVELS: { id: Sensitivity; name: string; line: string }[] = [
  { id: "low", name: "Low", line: "76" },
  { id: "medium", name: "Medium", line: "54" },
  { id: "high", name: "High", line: "38" },
];

const TYPES: { id: Kind; name: string }[] = [
  { id: "mod", name: "Mod drafts" },
  { id: "highlight", name: "Highlight markers" },
  { id: "scene", name: "Scene cues" },
];

interface SettingsBarProps {
  settings: Settings;
  dirty: boolean;
  onChange: (settings: Settings) => void;
  onTutorial: (settings: Settings) => void;
}

export function SettingsBar({ settings, dirty, onChange, onTutorial }: SettingsBarProps) {
  return (
    <div className={dirty ? "settings is-dirty" : "settings"}>
      <fieldset data-reveal="" data-d="1">
        <legend>Sensitivity</legend>
        <div className="seg" role="radiogroup" aria-label="Sensitivity">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={settings.sensitivity === level.id}
              data-testid={`sensitivity-${level.id}`}
              onClick={() => onChange({ ...settings, sensitivity: level.id })}
            >
              {level.name}, line {level.line}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset data-reveal="" data-d="2">
        <legend>Action types</legend>
        <div className="seg">
          {TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              aria-pressed={settings.enabled[type.id]}
              data-testid={`type-${type.id}`}
              onClick={() =>
                onChange({
                  ...settings,
                  enabled: { ...settings.enabled, [type.id]: !settings.enabled[type.id] },
                })
              }
            >
              {type.name}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset data-reveal="" data-d="3">
        <legend>Confirm</legend>
        <div className="seg" role="radiogroup" aria-label="Confirm">
          <button
            type="button"
            role="radio"
            aria-checked={settings.confirmRequired}
            data-testid="confirm-required"
            onClick={() => onChange({ ...settings, confirmRequired: true })}
          >
            Required
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!settings.confirmRequired}
            data-testid="confirm-open"
            onClick={() => onChange({ ...settings, confirmRequired: false })}
          >
            Open
          </button>
        </div>
      </fieldset>
      <div className="tutorials" data-reveal="" data-d="3">
        <p>Setups run a pass from the same window.</p>
        <div className="seg">
          {TUTORIALS.map((tutorial) => (
            <button key={tutorial.id} type="button" data-testid={`tutorial-${tutorial.id}`} onClick={() => onTutorial(tutorial.settings)}>
              {tutorial.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
