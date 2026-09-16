import type { TextareaHTMLAttributes } from 'react'

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  onChange?: (value: string) => void
}

export function TextArea({ className = '', rows = 4, onChange, ...props }: TextAreaProps) {
  return (
    <textarea
      className={`input-field textarea-code ${className}`}
      rows={rows}
      spellCheck={false}
      onChange={e => onChange?.(e.target.value)}
      {...props}
    />
  )
}
