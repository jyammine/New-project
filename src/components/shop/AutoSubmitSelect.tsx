'use client'

type Props = React.SelectHTMLAttributes<HTMLSelectElement>

/** A select that submits its form as soon as the value changes. */
export function AutoSubmitSelect(props: Props) {
  return <select {...props} onChange={(event) => event.currentTarget.form?.requestSubmit()} />
}
