import type { TableBlock } from '@/payload-types'

export function Table({ block }: { block: TableBlock }) {
  const columns = block.columns ?? []
  return (
    <section className="container-page">
      <div className="mx-auto max-w-4xl">
        {block.heading && <h2 className="mb-3 text-3xl">{block.heading}</h2>}
        {block.caption && <p className="mb-6 text-ink-soft">{block.caption}</p>}
        <div className="overflow-x-auto rounded-3xl bg-white shadow-[var(--shadow-soft)]">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-sage/60">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id ?? column.label}
                    scope="col"
                    className="px-5 py-3.5 font-extrabold"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(block.rows ?? []).map((row, rowIndex) => (
                <tr key={row.id ?? rowIndex}>
                  {columns.map((column, cellIndex) => {
                    const value = row.cells?.[cellIndex]?.value ?? ''
                    return cellIndex === 0 ? (
                      <th key={column.id ?? cellIndex} scope="row" className="px-5 py-3 font-bold">
                        {value}
                      </th>
                    ) : (
                      <td key={column.id ?? cellIndex} className="px-5 py-3 text-ink-soft">
                        {value}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
