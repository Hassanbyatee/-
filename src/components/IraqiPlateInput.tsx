import React from 'react';
import {
  IRAQI_PLATE_GOVERNORATES,
  formatIraqiPlate,
  getPlateGovLabel,
  sanitizePlateDigits,
  sanitizePlateLetter,
} from '../data/iraqReferenceData';
import { useI18n } from '../i18n/I18nContext';

interface IraqiPlateInputProps {
  govCode: string;
  letter: string;
  digits: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (next: { govCode: string; letter: string; digits: string }) => void;
}

export const IraqiPlateInput: React.FC<IraqiPlateInputProps> = ({
  govCode,
  letter,
  digits,
  disabled = false,
  required = false,
  onChange,
}) => {
  const { lang, t } = useI18n();
  const formattedPreview = formatIraqiPlate(govCode, letter, digits, lang);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2" dir="rtl">
        {/* Section 1: Governorate & Official Plate Code */}
        <div className="col-span-12 sm:col-span-5">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            {t.auth.plateSectionGov}
          </label>
          <select
            value={govCode}
            required={required}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                govCode: e.target.value,
                letter,
                digits,
              })
            }
            className="w-full h-11 px-3 text-sm font-semibold border border-[#CBD5E1] rounded-xl bg-white text-[#05203C] focus:outline-none focus:border-[#0770E3] disabled:opacity-50"
          >
            {IRAQI_PLATE_GOVERNORATES.map((g) => (
              <option key={g.code} value={g.code}>
                {getPlateGovLabel(g, lang)}
              </option>
            ))}
          </select>
        </div>

        {/* Section 2: Single Latin Plate Letter */}
        <div className="col-span-4 sm:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            {t.auth.plateSectionLetter}
          </label>
          <input
            type="text"
            dir="ltr"
            required={required}
            maxLength={1}
            disabled={disabled}
            placeholder="H"
            value={letter}
            onChange={(e) =>
              onChange({
                govCode,
                letter: sanitizePlateLetter(e.target.value),
                digits,
              })
            }
            className="w-full h-11 px-3 text-sm font-mono font-bold uppercase text-center border border-[#CBD5E1] rounded-xl bg-white text-[#05203C] focus:outline-none focus:border-[#0770E3] disabled:opacity-50"
          />
        </div>

        {/* Section 3: Numeric Plate Digits */}
        <div className="col-span-8 sm:col-span-4">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            {t.auth.plateSectionDigits}
          </label>
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            required={required}
            minLength={1}
            maxLength={8}
            disabled={disabled}
            placeholder="12345"
            value={digits}
            onChange={(e) =>
              onChange({
                govCode,
                letter,
                digits: sanitizePlateDigits(e.target.value),
              })
            }
            className="w-full h-11 px-3 text-sm font-mono font-bold tracking-wider text-center border border-[#CBD5E1] rounded-xl bg-white text-[#05203C] tabular-nums focus:outline-none focus:border-[#0770E3] disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-500">{t.auth.plateFormatHint}</span>
        {formattedPreview && (
          <span
            dir="ltr"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#05203C] font-mono font-bold tabular-nums"
          >
            <span>{formattedPreview}</span>
          </span>
        )}
      </div>
    </div>
  );
};
