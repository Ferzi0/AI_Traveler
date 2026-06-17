import { formatPrice } from './flightDisplay'

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function moneyLabel(value: number, currency = 'rub', approximate = true): string {
  return formatPrice(value, currency, approximate)
}

/** Цена в каталоге за одного человека → подпись для карточки. */
export function formatCatalogPerPersonCost(
  unitCost: number,
  passengers: number,
  currency = 'rub'
): string {
  const unit = roundMoney(unitCost)
  if (passengers <= 1) return `${moneyLabel(unit, currency)}/чел`
  const total = roundMoney(unit * passengers)
  return `${moneyLabel(unit, currency)}/чел · ${moneyLabel(total, currency)} за ${passengers} чел.`
}

/** Подпись для строки калькулятора. */
export function formatCalculationMeta(
  item: {
    formula: string
    result: number
    is_per_person?: boolean
    per_person?: number | null
    passengers?: number | null
    node_type: string
    values?: Record<string, number>
  },
  currency = 'rub'
): string {
  const money = (value: number) => moneyLabel(value, currency)

  if (item.per_person != null && item.passengers != null) {
    return `${money(item.per_person)}/чел × ${item.passengers} чел.`
  }

  if (
    item.node_type === 'accommodation' &&
    item.values?.price_per_night != null &&
    item.values?.nights != null
  ) {
    return `${money(item.values.price_per_night)}/ночь × ${item.values.nights} ноч.`
  }

  if (item.values?.per_person != null && item.values?.passengers != null) {
    return `${money(item.values.per_person)}/чел × ${item.values.passengers} чел.`
  }

  return 'Расчет по выбранной опции'
}

export function appendCostToSubtitle(
  description: string,
  unitCost: number,
  passengers: number,
  currency = 'rub'
): string {
  const costPart = formatCatalogPerPersonCost(unitCost, passengers, currency)
  return description ? `${description} · ${costPart}` : costPart
}

export function formatSummaryTotal(value: number, currency = 'rub'): string {
  return formatPrice(Math.round(value), currency, true)
}
