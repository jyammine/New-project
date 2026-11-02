/**
 * Flat SVG illustrations used as placeholder product photography for the demo shop.
 * Replace them with real photos in the admin panel.
 */

export type Garment =
  | 'bodysuit'
  | 'bodysuitLong'
  | 'romper'
  | 'dungarees'
  | 'sleepsuit'
  | 'sleepingBag'
  | 'cardigan'
  | 'bonnet'
  | 'beanie'
  | 'swaddle'
  | 'socks'
  | 'booties'

export type Pattern = 'none' | 'dots' | 'stars' | 'stripes' | 'leaves' | 'rib'

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))

export function shade(hex: string, amount: number): string {
  const value = hex.replace('#', '')
  const num = parseInt(value, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  const mix = (c: number) => (amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)
  return `#${[mix(r), mix(g), mix(b)].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`
}

/** Garment outlines drawn on a 600 × 750 canvas. */
const shapes: Record<Garment, { body: string; details: (stroke: string, fill: string) => string }> =
  {
    bodysuit: {
      body: 'M232 168 C255 205 345 205 368 168 L442 196 L505 282 L448 318 L420 292 L420 470 C420 540 382 590 338 612 L330 642 L270 642 L262 612 C218 590 180 540 180 470 L180 292 L152 318 L95 282 L158 196 Z',
      details: (stroke) => `
      <path d="M232 168 C250 230 300 236 330 214" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M368 168 C352 228 300 236 270 214" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round" opacity=".55"/>
      <circle cx="282" cy="628" r="6" fill="${stroke}"/><circle cx="300" cy="628" r="6" fill="${stroke}"/><circle cx="318" cy="628" r="6" fill="${stroke}"/>`,
    },
    bodysuitLong: {
      body: 'M232 168 C255 205 345 205 368 168 L442 196 L522 420 L478 438 L420 306 L420 470 C420 540 382 590 338 612 L330 642 L270 642 L262 612 C218 590 180 540 180 470 L180 306 L122 438 L78 420 L158 196 Z',
      details: (stroke) => `
      <path d="M232 168 C250 230 300 236 330 214" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M368 168 C352 228 300 236 270 214" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round" opacity=".55"/>
      <path d="M84 404 L128 422 M516 404 L472 422" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="282" cy="628" r="6" fill="${stroke}"/><circle cx="300" cy="628" r="6" fill="${stroke}"/><circle cx="318" cy="628" r="6" fill="${stroke}"/>`,
    },
    romper: {
      body: 'M236 176 C258 210 342 210 364 176 L420 196 L430 300 L430 520 L462 640 L330 650 L300 600 L270 650 L138 640 L170 520 L170 300 L180 196 Z',
      details: (stroke, fill) => `
      <path d="M180 196 C150 210 132 240 140 268 C160 262 170 250 176 236 C186 254 200 262 214 260 C214 236 204 210 180 196 Z" fill="${shade(fill, 0.25)}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M420 196 C450 210 468 240 460 268 C440 262 430 250 424 236 C414 254 400 262 386 260 C386 236 396 210 420 196 Z" fill="${shade(fill, 0.25)}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M236 176 C258 222 342 222 364 176" fill="none" stroke="${stroke}" stroke-width="5"/>
      <path d="M170 430 C230 450 370 450 430 430" fill="none" stroke="${stroke}" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round"/>
      <circle cx="300" cy="262" r="7" fill="${stroke}"/><circle cx="300" cy="312" r="7" fill="${stroke}"/>`,
    },
    dungarees: {
      body: 'M210 300 L390 300 L410 520 L448 650 L326 656 L300 590 L274 656 L152 650 L190 520 Z',
      details: (stroke, fill) => `
      <path d="M222 300 L202 130 M378 300 L398 130" stroke="${fill}" stroke-width="30" stroke-linecap="round"/>
      <path d="M222 300 L202 130 M378 300 L398 130" stroke="${stroke}" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 0" opacity=".25"/>
      <rect x="236" y="330" width="128" height="96" rx="18" fill="${shade(fill, -0.08)}" stroke="${stroke}" stroke-width="5"/>
      <circle cx="226" cy="316" r="11" fill="#f4d98a" stroke="${stroke}" stroke-width="4"/><circle cx="374" cy="316" r="11" fill="#f4d98a" stroke="${stroke}" stroke-width="4"/>
      <path d="M190 520 C240 534 360 534 410 520" fill="none" stroke="${stroke}" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round"/>`,
    },
    sleepsuit: {
      body: 'M236 128 C258 162 342 162 364 128 L436 150 L520 394 L478 412 L418 270 L418 420 L414 640 C414 690 388 712 352 712 C320 712 312 690 312 660 L306 470 L294 470 L288 660 C288 690 280 712 248 712 C212 712 186 690 186 640 L182 420 L182 270 L122 412 L80 394 L164 150 Z',
      details: (stroke) => `
      <path d="M300 160 L300 470" stroke="${stroke}" stroke-width="5" stroke-dasharray="6 7"/>
      <rect x="290" y="166" width="20" height="30" rx="6" fill="${stroke}"/>
      <path d="M236 128 C258 178 342 178 364 128" fill="none" stroke="${stroke}" stroke-width="5"/>
      <path d="M190 650 C220 668 270 668 288 650 M312 650 C330 668 380 668 410 650" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>`,
    },
    sleepingBag: {
      body: 'M226 140 C250 176 350 176 374 140 L420 156 L438 250 C470 320 482 420 470 520 C458 640 400 706 300 706 C200 706 142 640 130 520 C118 420 130 320 162 250 L180 156 Z',
      details: (stroke, fill) => `
      <path d="M226 140 C250 192 350 192 374 140" fill="none" stroke="${stroke}" stroke-width="5"/>
      <path d="M180 156 C150 190 150 230 170 252 M420 156 C450 190 450 230 430 252" fill="${shade(fill, -0.1)}" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M330 176 L330 640" stroke="${stroke}" stroke-width="5" stroke-dasharray="6 7"/>
      <rect x="320" y="184" width="20" height="30" rx="6" fill="${stroke}"/>
      <path d="M160 600 C220 640 380 640 440 600" fill="none" stroke="${stroke}" stroke-width="4" opacity=".5"/>`,
    },
    cardigan: {
      body: 'M236 150 L300 310 L364 150 L444 178 L526 430 L478 448 L422 296 L424 600 L176 600 L178 296 L122 448 L74 430 L156 178 Z',
      details: (stroke, fill) => `
      <path d="M236 150 L300 310 L364 150" fill="none" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M300 310 L300 600" stroke="${stroke}" stroke-width="5"/>
      <circle cx="318" cy="360" r="10" fill="${shade(fill, -0.25)}"/><circle cx="318" cy="430" r="10" fill="${shade(fill, -0.25)}"/><circle cx="318" cy="500" r="10" fill="${shade(fill, -0.25)}"/>
      <path d="M176 560 L424 560 M88 412 L132 430 M512 412 L468 430" stroke="${stroke}" stroke-width="5"/>
      <path d="M196 560 L196 600 M216 560 L216 600 M236 560 L236 600 M256 560 L256 600 M276 560 L276 600 M324 560 L324 600 M344 560 L344 600 M364 560 L364 600 M384 560 L384 600 M404 560 L404 600" stroke="${stroke}" stroke-width="3" opacity=".5"/>`,
    },
    bonnet: {
      body: 'M150 430 C130 300 200 200 300 200 C400 200 470 300 450 430 C420 470 380 480 300 480 C220 480 180 470 150 430 Z',
      details: (stroke, fill) => `
      <path d="M170 420 C200 300 400 300 430 420" fill="none" stroke="${stroke}" stroke-width="5"/>
      <path d="M180 440 C240 400 360 400 420 440" fill="${shade(fill, 0.3)}" stroke="${stroke}" stroke-width="5"/>
      <path d="M190 460 C170 540 150 600 120 650 M410 460 C430 540 450 600 480 650" fill="none" stroke="${shade(fill, -0.1)}" stroke-width="18" stroke-linecap="round"/>
      <path d="M190 220 C230 260 370 260 410 220" fill="none" stroke="${stroke}" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round"/>`,
    },
    beanie: {
      body: 'M160 470 C150 330 220 250 300 250 C380 250 450 330 440 470 Z',
      details: (stroke, fill) => `
      <rect x="140" y="440" width="320" height="96" rx="36" fill="${shade(fill, -0.06)}" stroke="${stroke}" stroke-width="5"/>
      <path d="M180 450 L180 528 M210 450 L210 528 M240 450 L240 528 M270 450 L270 528 M300 450 L300 528 M330 450 L330 528 M360 450 L360 528 M390 450 L390 528 M420 450 L420 528" stroke="${stroke}" stroke-width="3" opacity=".45"/>
      <circle cx="300" cy="226" r="56" fill="${shade(fill, 0.35)}" stroke="${stroke}" stroke-width="5"/>
      <path d="M270 210 Q300 190 330 210 M266 236 Q300 216 334 236" fill="none" stroke="${stroke}" stroke-width="3" opacity=".4"/>`,
    },
    swaddle: {
      body: 'M120 300 L480 300 L480 610 C480 626 468 638 452 638 L148 638 C132 638 120 626 120 610 Z',
      details: (stroke, fill) => `
      <path d="M150 220 L450 220 L470 300 L130 300 Z" fill="${shade(fill, 0.2)}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M180 150 L420 150 L440 220 L160 220 Z" fill="${shade(fill, 0.35)}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M120 360 L480 360" stroke="${stroke}" stroke-width="4" opacity=".4"/>
      <rect x="250" y="560" width="100" height="40" rx="10" fill="#ffffff" stroke="${stroke}" stroke-width="4"/>`,
    },
    socks: {
      body: 'M150 170 L250 170 L250 430 C250 470 300 500 330 520 C370 546 360 610 310 616 C250 624 200 600 170 560 C150 532 150 500 150 470 Z',
      details: (stroke, fill) => `
      <rect x="140" y="150" width="120" height="60" rx="16" fill="${shade(fill, -0.08)}" stroke="${stroke}" stroke-width="5"/>
      <path d="M350 230 L450 230 L450 490 C450 530 500 560 530 580 C570 606 560 670 510 676 C450 684 400 660 370 620 C350 592 350 560 350 530 Z" fill="${shade(fill, 0.18)}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <rect x="340" y="210" width="120" height="60" rx="16" fill="${shade(fill, 0.05)}" stroke="${stroke}" stroke-width="5"/>
      <path d="M300 520 C320 560 320 590 300 612 M500 580 C520 620 520 650 500 672" fill="none" stroke="${stroke}" stroke-width="4" opacity=".5"/>`,
    },
    booties: {
      body: 'M140 330 C140 290 170 270 210 270 L270 270 C300 270 310 300 310 330 L310 420 C380 430 420 470 420 520 C420 570 380 590 320 590 L190 590 C150 590 130 560 130 520 Z',
      details: (stroke, fill) => `
      <path d="M140 330 L310 330" stroke="${stroke}" stroke-width="5"/>
      <path d="M130 560 C200 576 340 580 420 540" fill="none" stroke="${shade(fill, -0.3)}" stroke-width="10" stroke-linecap="round"/>
      <path d="M330 250 C330 220 360 200 400 200 L450 200 C480 200 490 230 490 260 L490 350 C550 360 580 400 580 440 C580 486 548 506 494 506 L390 506 C350 506 330 480 330 440 Z" fill="${shade(fill, 0.15)}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round" transform="translate(-20 40) scale(1)"/>
      <path d="M310 290 L470 290" stroke="${stroke}" stroke-width="5"/>
      <circle cx="225" cy="300" r="8" fill="${stroke}"/><circle cx="395" cy="260" r="8" fill="${stroke}"/>`,
    },
  }

const patternDefs = (id: string, pattern: Pattern, color: string): string => {
  switch (pattern) {
    case 'dots':
      return `<pattern id="${id}" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="5" fill="${color}"/><circle cx="25" cy="25" r="5" fill="${color}"/></pattern>`
    case 'stars':
      return `<pattern id="${id}" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M18 8 l4 9 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1 z" fill="${color}"/><circle cx="52" cy="50" r="4" fill="${color}"/></pattern>`
    case 'stripes':
      return `<pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="14" fill="${color}"/></pattern>`
    case 'leaves':
      return `<pattern id="${id}" width="90" height="90" patternUnits="userSpaceOnUse"><path d="M20 50 C20 30 40 18 56 18 C56 38 40 50 20 50 Z" fill="${color}"/><path d="M58 82 C58 66 72 56 86 56 C86 72 72 82 58 82 Z" fill="${color}"/></pattern>`
    case 'rib':
      return `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="6" height="18" fill="${color}"/></pattern>`
    default:
      return ''
  }
}

type GarmentOptions = {
  garment: Garment
  color: string
  background: string
  pattern?: Pattern
  patternColor?: string
  /** Alternate composition for the second product image. */
  variant?: 'front' | 'detail'
}

export function garmentSvg({
  garment,
  color,
  background,
  pattern = 'none',
  patternColor,
  variant = 'front',
}: GarmentOptions): string {
  const shape = shapes[garment]
  const stroke = shade(color, -0.35)
  const pColor = patternColor ?? shade(color, -0.12)
  const patternId = `p-${garment}`
  const transform =
    variant === 'detail'
      ? 'translate(300 375) rotate(-8) scale(1.08) translate(-300 -375)'
      : 'translate(0 10)'
  const deco =
    variant === 'detail'
      ? `<circle cx="505" cy="120" r="46" fill="${shade(background, -0.06)}"/><circle cx="88" cy="660" r="70" fill="${shade(background, 0.35)}"/>`
      : `<circle cx="470" cy="150" r="120" fill="${shade(background, 0.3)}"/><circle cx="110" cy="640" r="90" fill="${shade(background, -0.04)}"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 600 750">
  <defs>
    ${patternDefs(patternId, pattern, pColor)}
    <clipPath id="clip-${garment}"><path d="${shape.body}"/></clipPath>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="600" height="750" fill="${background}"/>
  ${deco}
  <g transform="${transform}">
    <path d="${shape.body}" fill="${shade(background, -0.18)}" opacity=".55" transform="translate(10 18)" filter="url(#soft)"/>
    <path d="${shape.body}" fill="${color}"/>
    ${pattern !== 'none' ? `<rect width="600" height="750" fill="url(#${patternId})" clip-path="url(#clip-${garment})"/>` : ''}
    <path d="${shape.body}" fill="none" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
    ${shape.details(stroke, color)}
  </g>
</svg>`
}

/** A washing line of tiny clothes, used for the home page hero. */
export function heroSvg(): string {
  const item = (
    garment: Garment,
    color: string,
    x: number,
    y: number,
    scale: number,
    rotate: number,
    pattern: Pattern = 'none',
  ) => {
    const shape = shapes[garment]
    const stroke = shade(color, -0.35)
    const id = `h-${garment}-${x}`
    return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(-300 -150)">
      <defs>${patternDefs(id, pattern, shade(color, -0.12))}<clipPath id="c-${id}"><path d="${shape.body}"/></clipPath></defs>
      <path d="${shape.body}" fill="${color}"/>
      ${pattern !== 'none' ? `<rect width="600" height="750" fill="url(#${id})" clip-path="url(#c-${id})"/>` : ''}
      <path d="${shape.body}" fill="none" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      ${shape.details(stroke, color)}
    </g>`
  }
  const peg = (x: number, y: number) =>
    `<rect x="${x - 7}" y="${y - 22}" width="14" height="40" rx="5" fill="#d7a77a" stroke="#9b6c44" stroke-width="3"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1400" viewBox="0 0 800 700">
  <rect width="800" height="700" fill="#f6dad3"/>
  <circle cx="640" cy="130" r="80" fill="#f8edc9"/>
  <path d="M0 600 C200 560 360 640 800 580 L800 700 L0 700 Z" fill="#dde7d6"/>
  <path d="M0 640 C220 610 420 680 800 630 L800 700 L0 700 Z" fill="#cfdcc6"/>
  <path d="M-10 170 C200 240 600 240 810 170" fill="none" stroke="#8b7b70" stroke-width="4"/>
  ${item('bodysuit', '#fbf7f2', 150, 205, 0.42, -4, 'dots')}
  ${item('sleepsuit', '#d9e7f1', 330, 224, 0.42, 1, 'stars')}
  ${item('romper', '#e9b7aa', 510, 222, 0.42, 3)}
  ${item('socks', '#f8edc9', 660, 192, 0.3, -2, 'stripes')}
  ${peg(120, 196)}${peg(185, 204)}${peg(300, 214)}${peg(362, 216)}${peg(478, 214)}${peg(545, 212)}${peg(650, 196)}
  <g fill="#4f6f52" opacity=".9"><path d="M80 600 C70 560 90 520 120 500 C120 540 110 580 80 600 Z"/><path d="M90 610 C110 570 150 560 180 570 C160 600 120 615 90 610 Z"/><path d="M720 580 C730 540 760 520 790 520 C780 556 760 580 720 580 Z"/></g>
</svg>`
}

/** Folded stack of clothes and a little plant, for the “Our story” section. */
export function studioSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1400" viewBox="0 0 700 700">
  <rect width="700" height="700" fill="#dde7d6"/>
  <circle cx="540" cy="160" r="110" fill="#e9f0e4"/>
  <rect x="0" y="520" width="700" height="180" fill="#e8d6c0"/>
  <rect x="0" y="510" width="700" height="18" fill="#d7c0a4"/>
  <g stroke="#2f2a35" stroke-opacity=".25" stroke-width="4">
    <rect x="170" y="440" width="260" height="72" rx="18" fill="#f6dad3"/>
    <rect x="186" y="372" width="228" height="70" rx="18" fill="#fbf7f2"/>
    <rect x="200" y="306" width="200" height="68" rx="18" fill="#d9e7f1"/>
    <rect x="214" y="244" width="172" height="64" rx="18" fill="#f8edc9"/>
  </g>
  <path d="M186 400 L414 400 M200 334 L400 334" stroke="#2f2a35" stroke-opacity=".15" stroke-width="3" stroke-dasharray="4 10"/>
  <path d="M520 512 L500 420 L600 420 L580 512 Z" fill="#c9776a"/>
  <g fill="#4f6f52"><path d="M550 420 C520 360 520 300 556 260 C570 320 566 380 550 420 Z"/><path d="M552 420 C580 370 620 350 660 356 C640 396 600 420 552 420 Z"/><path d="M548 420 C510 390 480 390 450 400 C480 426 520 430 548 420 Z"/></g>
  <circle cx="110" cy="300" r="34" fill="#f8edc9" opacity=".8"/>
</svg>`
}

export function categorySvg(
  garment: Garment,
  color: string,
  background: string,
  pattern: Pattern = 'none',
): string {
  // Square crop of the garment illustration.
  return garmentSvg({ garment, color, background, pattern }).replace(
    'width="1200" height="1500" viewBox="0 0 600 750"',
    'width="1000" height="1000" viewBox="0 60 600 600"',
  )
}

export function shareImageSvg(siteName: string, tagline: string): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6dad3"/>
  <circle cx="1040" cy="120" r="200" fill="#f8edc9"/>
  <circle cx="120" cy="560" r="160" fill="#dde7d6"/>
  <text x="90" y="300" font-family="Georgia, serif" font-size="96" fill="#2f2a35">${escape(siteName)}</text>
  <text x="94" y="370" font-family="Helvetica, Arial, sans-serif" font-size="36" fill="#5c5462">${escape(tagline)}</text>
</svg>`
}
