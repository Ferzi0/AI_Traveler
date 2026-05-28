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
  values?: Record<string, number>
}): string {
  const money = (value: number) => {
    const rounded = roundMoney(value)
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, '')
  }

  if (item.per_person != null && item.passengers != null) {
    return `$${money(item.per_person)}/чел × ${item.passengers} чел.`
  }

  if (
    item.node_type === 'accommodation' &&
    item.values?.price_per_night != null &&
    item.values?.nights != null
  ) {
    return `$${money(item.values.price_per_night)}/ночь × ${item.values.nights} ноч.`
  }

  if (item.values?.per_person != null && item.values?.passengers != null) {
    return `$${money(item.values.per_person)}/чел × ${item.values.passengers} чел.`
  }

  return 'Расчет по выбранной опции'
}

export function appendCostToSubtitle(description: string, unitCost: number, passengers: number): string {
  const costPart = formatCatalogPerPersonCost(unitCost, passengers)
  return description ? `${description} · ${costPart}` : costPart
}
