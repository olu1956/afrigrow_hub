import {
  africanCountryOptions,
  internationalCountryOptions,
} from "@/lib/countries";

type CountrySelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
};

export function CountrySelect({
  id,
  name,
  value,
  onChange,
  className,
  disabled = false,
  required = false,
}: CountrySelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      required={required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="" disabled>
        Select country
      </option>
      <optgroup label="Africa">
        {africanCountryOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </optgroup>
      <optgroup label="Diaspora & international">
        {internationalCountryOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
