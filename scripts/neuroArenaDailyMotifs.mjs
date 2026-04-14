import { makePalette, cardBgColored } from './neuroArenaPremiumPalette.mjs'
import { MOTIF_RENDERERS } from './dailyMotifRenderers.mjs'

/**
 * Пары dot-probe: узнаваемые бытовые силуэты; нейтраль vs «напряжённая» версия одной темы.
 * Цвет из одной палитры на пару — без «хороший/плохой оттенок».
 */
export function buildDailyMotifs({ motifIndexStart = 0 }) {
  let ix = motifIndexStart
  const bind = (neutral, threat) => {
    const idx = ix++
    return {
      category: 'life',
      neutral: (u) => neutral(u, makePalette(idx)),
      threat: (u) => threat(u, makePalette(idx)),
    }
  }
  return MOTIF_RENDERERS.map((fn) =>
    bind(
      (u, P) => `${cardBgColored(u, P)}${fn('n', P)}`,
      (u, P) => `${cardBgColored(u, P)}${fn('t', P)}`,
    ),
  )
}
