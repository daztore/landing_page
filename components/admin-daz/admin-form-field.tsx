export function AdminFormField({
  label,
  htmlFor,
  required,
  helpText,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  helpText?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-stone-800" htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
      {helpText && <p className="text-xs leading-5 text-stone-500">{helpText}</p>}
    </div>
  )
}
