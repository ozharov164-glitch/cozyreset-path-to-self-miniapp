/**
 * Dot-probe: богатая пастельная палитра по индексу мотива.
 * Нейтраль и «напряжённый» вариант всегда из ОДНОЙ строки WAYS — по оттенку карты
 * нельзя угадать роль; различие только в форме/штрихе (line vs ink).
 */
const WAYS = [
  { card1: '#f3eef8', card2: '#ebe4f2', card3: '#e4dce8', border: 'rgba(72,64,88,0.12)', line: '#5c5470', lineM: '#6a6280', lineL: '#7a728e', fill: '#c9bdd8', fillM: '#b4a8c4', fillD: '#9a8faa', cream: '#ebe2f2', cream2: '#e0d6ea', white: '#fffafd', ink: '#2d2838', inkM: '#3d3648' },
  { card1: '#eef5f2', card2: '#e6f0ec', card3: '#dfeae4', border: 'rgba(56,72,64,0.11)', line: '#4d6058', lineM: '#5c6f66', lineL: '#6c7e76', fill: '#a8bdb2', fillM: '#92ab9e', fillD: '#7e9488', cream: '#e2ebe6', cream2: '#d8e5de', white: '#f7fcfa', ink: '#26332e', inkM: '#364540' },
  { card1: '#f5f0ea', card2: '#efe8e0', card3: '#e9e0d6', border: 'rgba(88,72,56,0.1)', line: '#625648', lineM: '#70645a', lineL: '#80746a', fill: '#c4b4a4', fillM: '#afa090', fillD: '#988878', cream: '#ebe2d8', cream2: '#e2d8cc', white: '#fffaf6', ink: '#342e28', inkM: '#443c34' },
  { card1: '#eef1f8', card2: '#e6eaf4', card3: '#dfe4f0', border: 'rgba(56,64,96,0.11)', line: '#505a72', lineM: '#5e6880', lineL: '#6e768e', fill: '#a8b4d0', fillM: '#94a2be', fillD: '#7e8ca8', cream: '#e4e8f2', cream2: '#d8dff0', white: '#f8f9fe', ink: '#282c3a', inkM: '#383c4c' },
  { card1: '#f2f0f5', card2: '#ebe8f0', card3: '#e4e0ea', border: 'rgba(64,60,80,0.11)', line: '#585468', lineM: '#66627a', lineL: '#76728a', fill: '#bab4cc', fillM: '#a69ebc', fillD: '#9088a8', cream: '#e8e4f0', cream2: '#ded8ea', white: '#faf8ff', ink: '#2c2834', inkM: '#3c3848' },
  { card1: '#f3f4ec', card2: '#eceee4', card3: '#e5e8dc', border: 'rgba(72,76,56,0.1)', line: '#5a5e4c', lineM: '#686c5c', lineL: '#787c6c', fill: '#b8bc9c', fillM: '#a4a888', fillD: '#8e9274', cream: '#e8eadc', cream2: '#dee2d4', white: '#fafbf4', ink: '#2e3228', inkM: '#3e4234' },
  { card1: '#f0f2f6', card2: '#e8ecf2', card3: '#e0e6ee', border: 'rgba(56,64,80,0.1)', line: '#505868', lineM: '#5e6678', lineL: '#6e7688', fill: '#a8b0c0', fillM: '#949eac', fillD: '#808898', cream: '#e2e6ee', cream2: '#d8dce6', white: '#f6f8fc', ink: '#282c34', inkM: '#383c48' },
  { card1: '#f5eef2', card2: '#efe6ec', card3: '#eadfe6', border: 'rgba(80,64,72,0.1)', line: '#64525c', lineM: '#72606a', lineL: '#827078', fill: '#c8a8b4', fillM: '#b494a4', fillD: '#a08090', cream: '#eee0e8', cream2: '#e4d4de', white: '#fff8fc', ink: '#342830', inkM: '#443840' },
  { card1: '#eef4f6', card2: '#e6eef2', card3: '#dee8ee', border: 'rgba(56,72,80,0.1)', line: '#4c5c64', lineM: '#5a6a74', lineL: '#6a7a84', fill: '#a0b8c4', fillM: '#8ca4b0', fillD: '#78909c', cream: '#e0ecf0', cream2: '#d4e4ea', white: '#f6fbfd', ink: '#263038', inkM: '#364048' },
  { card1: '#f4f2ea', card2: '#edeae2', card3: '#e6e2d8', border: 'rgba(80,76,56,0.1)', line: '#605c48', lineM: '#6e6a56', lineL: '#7e7a66', fill: '#c4c0a0', fillM: '#b0ac8c', fillD: '#9c9878', cream: '#eae6d8', cream2: '#e0dcc8', white: '#fcfbf4', ink: '#302c24', inkM: '#403c34' },
  { card1: '#f0f2f8', card2: '#e8ecf4', card3: '#e0e6f0', border: 'rgba(64,68,96,0.1)', line: '#505468', lineM: '#5e6278', lineL: '#6e7288', fill: '#a8b0d0', fillM: '#949cc0', fillD: '#8088ac', cream: '#e4e8f4', cream2: '#d8dcf0', white: '#f8faff', ink: '#282c3c', inkM: '#383c4c' },
  { card1: '#f2eef4', card2: '#ebe6ee', card3: '#e4dce6', border: 'rgba(72,64,80,0.1)', line: '#584c64', lineM: '#665a72', lineL: '#766a82', fill: '#b8a8c4', fillM: '#a494b4', fillD: '#9080a0', cream: '#eae2ee', cream2: '#ded6e4', white: '#fcf8fe', ink: '#2c2834', inkM: '#3c3848' },
  /* 13–48: доп. гаммы — нейтраль и threat в одной паре всегда с одной строки WAYS */
  { card1: '#fceee8', card2: '#f5e0d8', card3: '#ecd4cc', border: 'rgba(120,72,56,0.1)', line: '#6e5048', lineM: '#7c6058', lineL: '#8a7068', fill: '#dcb8b0', fillM: '#c8a49c', fillD: '#b49088', cream: '#f2e2dc', cream2: '#e8d4cc', white: '#fff8f6', ink: '#3a2820', inkM: '#4a3830' },
  { card1: '#fff0e4', card2: '#ffe8d4', card3: '#ffdcc0', border: 'rgba(140,96,48,0.1)', line: '#705840', lineM: '#806850', lineL: '#907860', fill: '#e0c8a8', fillM: '#ccb490', fillD: '#b8a078', cream: '#fce8d8', cream2: '#f2dcc8', white: '#fffaf4', ink: '#3a3020', inkM: '#4a4030' },
  { card1: '#f4f8e8', card2: '#eaf2dc', card3: '#e0ecd0', border: 'rgba(72,96,48,0.1)', line: '#546848', lineM: '#627856', lineL: '#708864', fill: '#b8c8a4', fillM: '#a4b490', fillD: '#90a07c', cream: '#e8f0dc', cream2: '#dce4d0', white: '#fafcf4', ink: '#283420', inkM: '#384430' },
  { card1: '#e4f8f4', card2: '#d8f0ec', card3: '#cce8e4', border: 'rgba(48,112,104,0.1)', line: '#406860', lineM: '#507870', lineL: '#608880', fill: '#90c8bc', fillM: '#7cb4a8', fillD: '#68a094', cream: '#d8f0ec', cream2: '#cce4e0', white: '#f4fcfa', ink: '#1c3834', inkM: '#2c4844' },
  { card1: '#e8f4fc', card2: '#dceafc', card3: '#d0e0f8', border: 'rgba(56,88,140,0.1)', line: '#486080', lineM: '#567090', lineL: '#6480a0', fill: '#98b8dc', fillM: '#84a4c8', fillD: '#7090b4', cream: '#e4eef8', cream2: '#d8e4f4', white: '#f8fbff', ink: '#243444', inkM: '#344454' },
  { card1: '#f0e8fc', card2: '#e6dcf8', card3: '#dcd0f4', border: 'rgba(88,64,140,0.1)', line: '#584878', lineM: '#665888', lineL: '#746898', fill: '#b8a8dc', fillM: '#a494c8', fillD: '#9080b4', cream: '#eae4f4', cream2: '#ded8ec', white: '#faf8ff', ink: '#2c2440', inkM: '#3c3450' },
  { card1: '#fce8f4', card2: '#f8dcf0', card3: '#f2d0e8', border: 'rgba(120,64,100,0.1)', line: '#784868', lineM: '#885878', lineL: '#986888', fill: '#e0a8c8', fillM: '#cc94b4', fillD: '#b880a0', cream: '#f8e4f0', cream2: '#ecd8e8', white: '#fff8fc', ink: '#382030', inkM: '#483040' },
  { card1: '#ecf4e8', card2: '#e0ecd8', card3: '#d4e4cc', border: 'rgba(64,112,72,0.1)', line: '#486850', lineM: '#567860', lineL: '#648870', fill: '#a0c4a4', fillM: '#8cb090', fillD: '#789c7c', cream: '#e4f0e4', cream2: '#d8e8d8', white: '#f6fcf6', ink: '#243828', inkM: '#344838' },
  { card1: '#fff4e0', card2: '#fcecd0', card3: '#f8e4c0', border: 'rgba(140,112,48,0.1)', line: '#706040', lineM: '#807050', lineL: '#908060', fill: '#dcc898', fillM: '#c8b484', fillD: '#b4a070', cream: '#f8ecd8', cream2: '#eee0c8', white: '#fffbf4', ink: '#383020', inkM: '#484030' },
  { card1: '#e8ecf8', card2: '#dce0f0', card3: '#d0d4e8', border: 'rgba(72,72,120,0.1)', line: '#505878', lineM: '#5e6888', lineL: '#6c7898', fill: '#a8b0d4', fillM: '#949cc0', fillD: '#8088ac', cream: '#e4e8f4', cream2: '#d8dcf0', white: '#f8f8ff', ink: '#282c40', inkM: '#383c50' },
  { card1: '#f8ece8', card2: '#f0e0dc', card3: '#e8d4d0', border: 'rgba(112,72,64,0.1)', line: '#685048', lineM: '#786058', lineL: '#887068', fill: '#d0b4ac', fillM: '#bca098', fillD: '#a88c84', cream: '#f0e4e0', cream2: '#e6d8d4', white: '#fffaf8', ink: '#342824', inkM: '#443834' },
  { card1: '#e4f2fc', card2: '#d8e8f8', card3: '#ccdff4', border: 'rgba(48,96,140,0.1)', line: '#406890', lineM: '#5078a0', lineL: '#6088b0', fill: '#88b8e0', fillM: '#74a4cc', fillD: '#6090b8', cream: '#dceaf8', cream2: '#d0e0f4', white: '#f4faff', ink: '#1c3448', inkM: '#2c4458' },
  { card1: '#f4ecf8', card2: '#ece0f4', card3: '#e4d4f0', border: 'rgba(100,64,120,0.1)', line: '#604878', lineM: '#705888', lineL: '#806898', fill: '#c4a8d4', fillM: '#b094c0', fillD: '#9c80ac', cream: '#eee4f4', cream2: '#e2d8ec', white: '#fcf8ff', ink: '#302440', inkM: '#403450' },
  { card1: '#e8fcf4', card2: '#dcf8ec', card3: '#d0f0e4', border: 'rgba(48,120,96,0.1)', line: '#407868', lineM: '#508878', lineL: '#609888', fill: '#88d4bc', fillM: '#74c0a8', fillD: '#60ac94', cream: '#dcf8f0', cream2: '#d0f0e8', white: '#f4fffc', ink: '#1c4038', inkM: '#2c5048' },
  { card1: '#fcf0e4', card2: '#f8e4d4', card3: '#f2d8c4', border: 'rgba(128,88,56,0.1)', line: '#705840', lineM: '#806850', lineL: '#907860', fill: '#dcc0a0', fillM: '#c8ac8c', fillD: '#b49878', cream: '#f8e8d8', cream2: '#ecdccc', white: '#fffaf4', ink: '#382c20', inkM: '#483c30' },
  { card1: '#ece8f8', card2: '#e2dcf4', card3: '#d8d0f0', border: 'rgba(80,64,128,0.1)', line: '#504878', lineM: '#605888', lineL: '#706898', fill: '#b0a0d8', fillM: '#9c8cc4', fillD: '#8878b0', cream: '#e6e2f4', cream2: '#dad6ec', white: '#f8f6ff', ink: '#282040', inkM: '#383050' },
  { card1: '#f8f4e8', card2: '#f0ecd8', card3: '#e8e4c8', border: 'rgba(112,100,64,0.1)', line: '#686048', lineM: '#787058', lineL: '#888068', fill: '#d4c8a4', fillM: '#c0b490', fillD: '#aca07c', cream: '#f2ecd8', cream2: '#e6e0cc', white: '#fffef8', ink: '#343020', inkM: '#444030' },
  { card1: '#e0f4f8', card2: '#d4ecf4', card3: '#c8e4f0', border: 'rgba(48,112,128,0.1)', line: '#407080', lineM: '#508090', lineL: '#6090a0', fill: '#88c8d8', fillM: '#74b4c4', fillD: '#60a0b0', cream: '#d8f0f4', cream2: '#cce8f0', white: '#f4fcff', ink: '#1c3840', inkM: '#2c4850' },
  { card1: '#eef6e4', card2: '#e4eed8', card3: '#dae6cc', border: 'rgba(80,104,56,0.1)', line: '#506848', lineM: '#5e7858', lineL: '#6c8868', fill: '#b4c8a0', fillM: '#a0b48c', fillD: '#8ca078', cream: '#e8f0dc', cream2: '#dce8d0', white: '#f8fcf4', ink: '#2c3824', inkM: '#3c4834' },
  { card1: '#fce4ec', card2: '#f8d8e4', card3: '#f2ccdc', border: 'rgba(128,64,88,0.1)', line: '#784858', lineM: '#885868', lineL: '#986878', fill: '#e8a0b8', fillM: '#d48ca4', fillD: '#c07890', cream: '#fce8f0', cream2: '#f0dce8', white: '#fff8fc', ink: '#382028', inkM: '#483038' },
  { card1: '#e4ecf0', card2: '#d8e4ea', card3: '#ccdce4', border: 'rgba(56,80,96,0.1)', line: '#485868', lineM: '#566878', lineL: '#647888', fill: '#98b0c0', fillM: '#849cac', fillD: '#708898', cream: '#dce6ee', cream2: '#d0dae6', white: '#f4f8fc', ink: '#243038', inkM: '#344048' },
  { card1: '#fff8e8', card2: '#fff0d8', card3: '#ffe8c8', border: 'rgba(140,120,48,0.1)', line: '#706840', lineM: '#807850', lineL: '#908860', fill: '#e8d898', fillM: '#d4c484', fillD: '#c0b070', cream: '#fff0d8', cream2: '#f2e4c8', white: '#fffef8', ink: '#383420', inkM: '#484430' },
  { card1: '#e8e8fc', card2: '#dcdcf4', card3: '#d0d0ec', border: 'rgba(72,72,128,0.1)', line: '#484878', lineM: '#565888', lineL: '#646898', fill: '#a8a8dc', fillM: '#9494c8', fillD: '#8080b4', cream: '#e4e4f8', cream2: '#d8d8f0', white: '#f8f8ff', ink: '#282040', inkM: '#383050' },
  { card1: '#f0ecf4', card2: '#e6e4ec', card3: '#dcdce4', border: 'rgba(88,80,104,0.1)', line: '#585068', lineM: '#666078', lineL: '#747088', fill: '#b8b0c8', fillM: '#a49cb4', fillD: '#9088a0', cream: '#eae8f0', cream2: '#dedce8', white: '#faf8fc', ink: '#2c2838', inkM: '#3c3848' },
  { card1: '#e4f8f0', card2: '#d8f0e8', card3: '#cce8e0', border: 'rgba(48,120,104,0.1)', line: '#407868', lineM: '#508878', lineL: '#609888', fill: '#88d4c4', fillM: '#74c0b0', fillD: '#60ac9c', cream: '#d8f4ec', cream2: '#cce8e4', white: '#f4fffc', ink: '#1c4038', inkM: '#2c5048' },
  { card1: '#fceee8', card2: '#f4e4dc', card3: '#ecdad4', border: 'rgba(120,80,64,0.1)', line: '#6e5848', lineM: '#7c6858', lineL: '#8a7868', fill: '#dcb8a8', fillM: '#c8a494', fillD: '#b49080', cream: '#f4e8e0', cream2: '#eadcd4', white: '#fffaf8', ink: '#3a3028', inkM: '#4a4038' },
  { card1: '#e8f0fc', card2: '#dce6f8', card3: '#d0dcf4', border: 'rgba(64,88,140,0.1)', line: '#485878', lineM: '#566888', lineL: '#647898', fill: '#a0b4dc', fillM: '#8ca0c8', fillD: '#788cb4', cream: '#e4eaf8', cream2: '#d8e0f4', white: '#f8faff', ink: '#243044', inkM: '#344054' },
  { card1: '#f4f0e8', card2: '#ece6dc', card3: '#e4dcd0', border: 'rgba(96,88,72,0.1)', line: '#605848', lineM: '#6e6858', lineL: '#7c7868', fill: '#ccc0a8', fillM: '#b8ac94', fillD: '#a49880', cream: '#eee8dc', cream2: '#e2dcd0', white: '#faf8f4', ink: '#302c24', inkM: '#403c34' },
  { card1: '#ecf2fc', card2: '#e0e8f8', card3: '#d4e0f4', border: 'rgba(72,88,128,0.1)', line: '#506088', lineM: '#5e7098', lineL: '#6c80a8', fill: '#a8bce0', fillM: '#94a8cc', fillD: '#8094b8', cream: '#e6eefc', cream2: '#dae4f8', white: '#f8fbff', ink: '#283444', inkM: '#384454' },
  { card1: '#f8ece4', card2: '#f0e4d8', card3: '#e8dccc', border: 'rgba(112,80,56,0.1)', line: '#685040', lineM: '#786050', lineL: '#887060', fill: '#d4b89c', fillM: '#c0a488', fillD: '#ac9074', cream: '#f2e8dc', cream2: '#e6dcd0', white: '#fffaf6', ink: '#342820', inkM: '#443830' },
  { card1: '#e4f4ec', card2: '#d8ece4', card3: '#cce4dc', border: 'rgba(56,112,88,0.1)', line: '#486860', lineM: '#567870', lineL: '#648880', fill: '#90c8b4', fillM: '#7cb4a0', fillD: '#68a08c', cream: '#dcf4ec', cream2: '#d0e8e4', white: '#f4fcf8', ink: '#243834', inkM: '#344844' },
  { card1: '#f0e8f8', card2: '#e6dcf4', card3: '#dcd0ec', border: 'rgba(96,64,128,0.1)', line: '#584878', lineM: '#665888', lineL: '#746898', fill: '#bca8d4', fillM: '#a894c0', fillD: '#9480ac', cream: '#eae4f4', cream2: '#ded8ec', white: '#faf6ff', ink: '#2c2440', inkM: '#3c3450' },
  { card1: '#fff4f0', card2: '#fce8e4', card3: '#f8dcd8', border: 'rgba(140,80,72,0.1)', line: '#705048', lineM: '#806058', lineL: '#907068', fill: '#e8b8b0', fillM: '#d4a49c', fillD: '#c09088', cream: '#fce8e4', cream2: '#f0dcd8', white: '#fffaf8', ink: '#382828', inkM: '#483838' },
  { card1: '#e0f8fc', card2: '#d4f0f8', card3: '#c8e8f4', border: 'rgba(48,120,132,0.1)', line: '#387888', lineM: '#488898', lineL: '#5898a8', fill: '#7cd4e8', fillM: '#68c0d4', fillD: '#54acc0', cream: '#d4f4fc', cream2: '#c8ecf8', white: '#f0feff', ink: '#184048', inkM: '#285058' },
  { card1: '#f4ecf0', card2: '#ece0e8', card3: '#e4d4e0', border: 'rgba(104,72,88,0.1)', line: '#604858', lineM: '#705868', lineL: '#806878', fill: '#cca8bc', fillM: '#b894a8', fillD: '#a48094', cream: '#f0e4ec', cream2: '#e4d8e0', white: '#fcf8fa', ink: '#302028', inkM: '#403038' },
  { card1: '#ecf8f4', card2: '#e0f0ec', card3: '#d4e8e4', border: 'rgba(64,120,104,0.1)', line: '#487868', lineM: '#568878', lineL: '#649888', fill: '#a0dcc8', fillM: '#8cc8b4', fillD: '#78b4a0', cream: '#e4f8f0', cream2: '#d8ece8', white: '#f6fffc', ink: '#204038', inkM: '#305048' },
]

/**
 * Палитра для мотива с индексом motifIndex (стабильна для пары картинок n/t).
 */
export function makePalette(motifIndex) {
  return WAYS[motifIndex % WAYS.length]
}

/**
 * Фон карточки: только линейный градиент + тонкая рамка (без нижнего «блика» — меньше шума и байт).
 */
export function cardBgColored(uid, P) {
  return `<defs>
    <linearGradient id="bg-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${P.card1}"/>
      <stop offset="50%" stop-color="${P.card2}"/>
      <stop offset="100%" stop-color="${P.card3}"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg-${uid})"/>
  <rect x="1" y="1" width="118" height="118" rx="23" fill="none" stroke="${P.border}" stroke-width="1"/>`
}
