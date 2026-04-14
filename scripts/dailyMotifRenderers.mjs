/**
 * 100 бытовых мотивов: база + rest + rest2. См. комментарии в dailyMotifRenderersBase.mjs.
 */
import { MOTIF_RENDERERS_BASE } from './dailyMotifRenderersBase.mjs'
import { MOTIF_RENDERERS_REST } from './dailyMotifRenderersRest.mjs'
import { MOTIF_RENDERERS_REST2 } from './dailyMotifRenderersRest2.mjs'

export const MOTIF_RENDERERS = [...MOTIF_RENDERERS_BASE, ...MOTIF_RENDERERS_REST, ...MOTIF_RENDERERS_REST2]
