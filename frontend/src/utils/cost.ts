export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

/** Цена в каталоге за одного человека → подпись для карточки. */
export function formatCatalogPerPersonCost(unitCost: number, passengers: number): string {
  const unit = roundMoney(unitCost)
  if (passengers <= 1) return `$${unit}/чел`
  const total = roundMoney(unit * passengers)
  return `$${unit}/чел · $${total} за ${passengers} чел.`
}

/** Подпись для строки калькулятора. */
export function formatCalculationMeta(item: {
  formula: string
  result: number
  is_per_person?: boolean
  per_person?: number | null
  passengers?: number | null
  node_type: string
}): string {
  if (item.is_per_person && item.per_person != null && item.passengers != null) {
    return `$${item.per_person}/чел × ${item.passengers} чел. = $${item.result}`
  }
  if (item.node_type === 'transport' && item.per_person != null && item.passengers != null) {
    return `$${item.per_person}/чел × ${item.passengers} чел. = $${item.result}`
  }
  if (item.node_type === 'accommodation') {
    return `${item.formula} = $${item.result}`
  }
  return `${item.formula} = $${item.result}`
}

export function appendCostToSubtitle(description: string, unitCost: number, passengers: number): string {
  const costPart = formatCatalogPerPersonCost(unitCost, passengers)
  return description ? `${description} · ${costPart}` : costPart
}
