export function BrandLogo() {
  return (
    <svg
      className="brandLogo"
      viewBox="0 0 620 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AI Traveler"
    >
      <defs>
        <linearGradient id="travelGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D08A64" />
          <stop offset="100%" stopColor="#7A2E1C" />
        </linearGradient>
      </defs>

      <g transform="translate(20,20)">
        <circle cx="50" cy="50" r="46" stroke="url(#travelGradient)" strokeWidth="4" fill="none" />

        <path d="M28 24C22 34 22 66 28 78" stroke="#C87954" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M72 24C78 34 78 66 72 78" stroke="#C87954" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M18 40H82" stroke="#C87954" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M18 60H82" stroke="#C87954" strokeWidth="2.5" strokeLinecap="round" />

        <path
          d="M30 68C40 48 58 38 72 44"
          stroke="url(#travelGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 6"
          fill="none"
        />

        <path d="M71 34L78 38L72 40L68 47L66 45L68 39L62 36L63 34L69 35L71 29L73 30L73 35L78 38" fill="url(#travelGradient)" />

        <path
          d="M50 68C56 68 60 72 60 78C60 86 50 94 50 94C50 94 40 86 40 78C40 72 44 68 50 68Z"
          fill="url(#travelGradient)"
        />
        <circle cx="50" cy="78" r="3" fill="white" />
      </g>

      <g transform="translate(140,44)">
        <text
          x="0"
          y="20"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="44"
          fontWeight="700"
          fill="#111111"
          letterSpacing="0.5"
        >
          AI Traveler
        </text>

        <text
          x="2"
          y="56"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="13"
          letterSpacing="6"
          fill="#777777"
        >
          SMART TRAVEL PLANNER
        </text>
      </g>
    </svg>
  )
}
