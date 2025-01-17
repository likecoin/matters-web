import classNames from 'classnames'

import Field, { FieldProps } from '../Field'
import styles from './styles.module.css'

/**
 * Pure UI component for <input> element
 *
 * Usage:
 *
 * ```jsx
 *   <Form.Input
 *     type="email"
 *     error="xxx"
 *     hint="xxx"
 *     ...other <input> props...
 *   />
 * ```
 *
 */

type InputProps = {
  type: 'text' | 'password' | 'email' | 'number'
  name: string
} & Omit<FieldProps, 'fieldMsgId'> &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >

const Input: React.FC<InputProps> = ({
  type,

  name,
  label,
  extraButton,
  hasLabel,

  hint,
  error,
  hintAlign,

  spacingTop,
  spacingBottom,

  ...inputProps
}) => {
  const fieldId = `field-${name}`
  const fieldMsgId = `field-msg-${name}`
  const inputClasses = classNames({
    [styles.input]: true,
    [styles.error]: error,
  })

  return (
    <Field spacingTop={spacingTop} spacingBottom={spacingBottom}>
      <Field.Header
        htmlFor={fieldId}
        label={label}
        extraButton={extraButton}
        hasLabel={hasLabel}
      />

      <Field.Content>
        <input
          {...inputProps}
          id={fieldId}
          name={name}
          type={type}
          aria-describedby={fieldMsgId}
          autoComplete="nope"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={inputClasses}
        />
      </Field.Content>

      <Field.Footer
        fieldMsgId={fieldMsgId}
        hint={hint}
        error={error}
        hintAlign={hintAlign}
      />
    </Field>
  )
}

export default Input
