interface InputFieldProps {
  id: string
  name?: string
  label: string
  type?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  error?: string
  required?: boolean
  placeholder?: string
  autoComplete?: string
}

export function InputField({
  id,
  name = id,
  label,
  type = 'text',
  value,
  defaultValue,
  onChange,
  disabled,
  error,
  required,
  placeholder,
  autoComplete,
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-3 py-2 rounded-md border bg-white text-text-primary placeholder-text-tertiary
          focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary disabled:opacity-50 disabled:bg-bg-secondary
          ${error ? 'border-danger' : 'border-border'}`}
      />
      {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
    </div>
  )
}