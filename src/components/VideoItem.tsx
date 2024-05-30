import { X } from 'lucide-react'
import { Video } from './MainForm'

interface VideoItemProps {
  id: string
  video: Video
  onRemove?: (id: string) => void
  theSecond?: boolean
}

export function VideoItem({ id, video, onRemove, theSecond }: VideoItemProps) {
  return (
    <div className="relative w-full rounded-md">
      {onRemove && (
        <button
          type="button"
          aria-label="Remover vídeo"
          onClick={() => onRemove(id)}
          className="absolute -right-2 -top-2 z-10 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <video
        src={theSecond ? video.convertedURL : video.previewURL}
        data-disabled={video.isLoading}
        className="pointer-events-none aspect-video w-full rounded-md data-[disabled=true]:opacity-60"
        controls={false}
      />

      {/* {video.transcribedAt ? (
        <a
          target="_blank"
          download
          href={`/api/ai/transcribe/download?key=${id}`}
          className="absolute right-2 top-2 rounded bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:enabled:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Baixar transcrição
        </a>
      ) : (
        <button
          type="button"
          onClick={() => {}}
          disabled={video.isLoading}
          className="absolute right-2 top-2 rounded bg-violet-500 px-2 py-1 text-xs font-medium text-white hover:enabled:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Transcrever
        </button>
      )} */}

      <span className="absolute bottom-0 left-0 right-0 rounded-b-md bg-black/40 p-1 text-center text-xs text-zinc-200">
        {video.isLoading ? `${video.convertingProgress}%` : video.file.name}
      </span>
    </div>
  )
}
