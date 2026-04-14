/**
 * Цветные премиум-стили для dot-probe: насыщенные пастели, без «зелёный=хорошо / красный=плохо».
 * Оттенок варьируется по индексу мотива; нейтраль и угроза в одной паре — из ОДНОЙ гаммы:
 * отличие в форме и толщине линий (ink), а не в противоположных цветах спектра.
 */
const WAYS = [
  { card1: '#f3eef8', card2: '#ebe4f2', card3: '#e4dce8', vin: 'rgba(255,255,255,0.48)', border: 'rgba(72,64,88,0.12)', volTop: '#f8f4fc', volBot: '#ddd4ec', line: '#5c5470', lineM: '#6a6280', lineL: '#7a728e', fill: '#c9bdd8', fillM: '#b4a8c4', fillD: '#9a8faa', cream: '#ebe2f2', cream2: '#e0d6ea', white: '#fffafd', ink: '#2d2838', inkM: '#3d3648' },
  { card1: '#eef5f2', card2: '#e6f0ec', card3: '#dfeae4', vin: 'rgba(255,255,255,0.5)', border: 'rgba(56,72,64,0.11)', volTop: '#f2faf6', volBot: '#d4e8de', line: '#4d6058', lineM: '#5c6f66', lineL: '#6c7e76', fill: '#a8bdb2', fillM: '#92ab9e', fillD: '#7e9488', cream: '#e2ebe6', cream2: '#d8e5de', white: '#f7fcfa', ink: '#26332e', inkM: '#364540' },
  { card1: '#f5f0ea', card2: '#efe8e0', card3: '#e9e0d6', vin: 'rgba(255,255,255,0.46)', border: 'rgba(88,72,56,0.1)', volTop: '#faf6f0', volBot: '#e8ddd2', line: '#625648', lineM: '#70645a', lineL: '#80746a', fill: '#c4b4a4', fillM: '#afa090', fillD: '#988878', cream: '#ebe2d8', cream2: '#e2d8cc', white: '#fffaf6', ink: '#342e28', inkM: '#443c34' },
  { card1: '#eef1f8', card2: '#e6eaf4', card3: '#dfe4f0', vin: 'rgba(255,255,255,0.47)', border: 'rgba(56,64,96,0.11)', volTop: '#f4f6fc', volBot: '#d8dff0', line: '#505a72', lineM: '#5e6880', lineL: '#6e768e', fill: '#a8b4d0', fillM: '#94a2be', fillD: '#7e8ca8', cream: '#e4e8f2', cream2: '#d8dff0', white: '#f8f9fe', ink: '#282c3a', inkM: '#383c4c' },
  { card1: '#f2f0f5', card2: '#ebe8f0', card3: '#e4e0ea', vin: 'rgba(255,255,255,0.45)', border: 'rgba(64,60,80,0.11)', volTop: '#f7f5fa', volBot: '#ddd8e8', line: '#585468', lineM: '#66627a', lineL: '#76728a', fill: '#bab4cc', fillM: '#a69ebc', fillD: '#9088a8', cream: '#e8e4f0', cream2: '#ded8ea', white: '#faf8ff', ink: '#2c2834', inkM: '#3c3848' },
  { card1: '#f3f4ec', card2: '#eceee4', card3: '#e5e8dc', vin: 'rgba(255,255,255,0.48)', border: 'rgba(72,76,56,0.1)', volTop: '#f8f9f2', volBot: '#e2e6d4', line: '#5a5e4c', lineM: '#686c5c', lineL: '#787c6c', fill: '#b8bc9c', fillM: '#a4a888', fillD: '#8e9274', cream: '#e8eadc', cream2: '#dee2d4', white: '#fafbf4', ink: '#2e3228', inkM: '#3e4234' },
  { card1: '#f0f2f6', card2: '#e8ecf2', card3: '#e0e6ee', vin: 'rgba(255,255,255,0.46)', border: 'rgba(56,64,80,0.1)', volTop: '#f6f8fc', volBot: '#d8e0ec', line: '#505868', lineM: '#5e6678', lineL: '#6e7688', fill: '#a8b0c0', fillM: '#949eac', fillD: '#808898', cream: '#e2e6ee', cream2: '#d8dce6', white: '#f6f8fc', ink: '#282c34', inkM: '#383c48' },
  { card1: '#f5eef2', card2: '#efe6ec', card3: '#eadfe6', vin: 'rgba(255,255,255,0.47)', border: 'rgba(80,64,72,0.1)', volTop: '#faf4f8', volBot: '#e8d8e2', line: '#64525c', lineM: '#72606a', lineL: '#827078', fill: '#c8a8b4', fillM: '#b494a4', fillD: '#a08090', cream: '#eee0e8', cream2: '#e4d4de', white: '#fff8fc', ink: '#342830', inkM: '#443840' },
  { card1: '#eef4f6', card2: '#e6eef2', card3: '#dee8ee', vin: 'rgba(255,255,255,0.49)', border: 'rgba(56,72,80,0.1)', volTop: '#f4fafc', volBot: '#d4e4ec', line: '#4c5c64', lineM: '#5a6a74', lineL: '#6a7a84', fill: '#a0b8c4', fillM: '#8ca4b0', fillD: '#78909c', cream: '#e0ecf0', cream2: '#d4e4ea', white: '#f6fbfd', ink: '#263038', inkM: '#364048' },
  { card1: '#f4f2ea', card2: '#edeae2', card3: '#e6e2d8', vin: 'rgba(255,255,255,0.45)', border: 'rgba(80,76,56,0.1)', volTop: '#faf8f0', volBot: '#e4ddd0', line: '#605c48', lineM: '#6e6a56', lineL: '#7e7a66', fill: '#c4c0a0', fillM: '#b0ac8c', fillD: '#9c9878', cream: '#eae6d8', cream2: '#e0dcc8', white: '#fcfbf4', ink: '#302c24', inkM: '#403c34' },
  { card1: '#f0f2f8', card2: '#e8ecf4', card3: '#e0e6f0', vin: 'rgba(255,255,255,0.46)', border: 'rgba(64,68,96,0.1)', volTop: '#f6f8fc', volBot: '#d8e0f0', line: '#505468', lineM: '#5e6278', lineL: '#6e7288', fill: '#a8b0d0', fillM: '#949cc0', fillD: '#8088ac', cream: '#e4e8f4', cream2: '#d8dcf0', white: '#f8faff', ink: '#282c3c', inkM: '#383c4c' },
  { card1: '#f2eef4', card2: '#ebe6ee', card3: '#e4dce6', vin: 'rgba(255,255,255,0.47)', border: 'rgba(72,64,80,0.1)', volTop: '#f8f4fa', volBot: '#e0d8e8', line: '#584c64', lineM: '#665a72', lineL: '#766a82', fill: '#b8a8c4', fillM: '#a494b4', fillD: '#9080a0', cream: '#eae2ee', cream2: '#ded6e4', white: '#fcf8fe', ink: '#2c2834', inkM: '#3c3848' },
]

/**
 * Палитра для мотива с индексом motifIndex (стабильна для пары картинок n/t).
 */
export function makePalette(motifIndex) {
  return WAYS[motifIndex % WAYS.length]
}

/**
 * Фон карточки; P = makePalette(idx). Один стиль фона на оба файла пары (uid совпадает).
 */
export function cardBgColored(uid, P) {
  return `<defs>
    <linearGradient id="bg-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${P.card1}"/>
      <stop offset="45%" stop-color="${P.card2}"/>
      <stop offset="100%" stop-color="${P.card3}"/>
    </linearGradient>
    <radialGradient id="vin-${uid}" cx="50%" cy="92%" r="55%">
      <stop offset="0%" stop-color="${P.vin}"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg-${uid})"/>
  <ellipse cx="60" cy="108" rx="52" ry="14" fill="url(#vin-${uid})" opacity="0.42"/>
  <rect x="1" y="1" width="118" height="118" rx="23" fill="none" stroke="${P.border}" stroke-width="1"/>`
}
