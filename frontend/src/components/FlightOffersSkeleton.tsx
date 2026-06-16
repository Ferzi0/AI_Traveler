type Props = {
  rows?: number
}

export function FlightOffersSkeleton({ rows = 6 }: Props) {
  return (
    <ul className="flightOffers__list flightOffers__list--skeleton" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flightOfferSkeleton">
          <span className="flightOfferSkeleton__block flightOfferSkeleton__block--route" />
          <span className="flightOfferSkeleton__block flightOfferSkeleton__block--schedule" />
          <span className="flightOfferSkeleton__block flightOfferSkeleton__block--details" />
          <span className="flightOfferSkeleton__block flightOfferSkeleton__block--price" />
        </li>
      ))}
    </ul>
  )
}
