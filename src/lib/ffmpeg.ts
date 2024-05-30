import { createFFmpeg } from '@ffmpeg/ffmpeg'
import { env } from './env'

export const ffmpeg = createFFmpeg({
  log: false,
  corePath: `${env.NEXT_PUBLIC_VERCEL_URL}/ffmpeg-dist/ffmpeg-core.js`,
})
