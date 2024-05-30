import { PlusCircle } from 'lucide-react'
import { ChangeEvent } from 'react'

interface UploadVideoProps {
  onSelectVideo: (videos: File) => void
}

export function UploadVideo({ onSelectVideo }: UploadVideoProps) {
  function handleVideoFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files

    if (!files) {
      return
    }

    onSelectVideo(files[0])
  }

  return (
    <div className="relative flex flex-col gap-4">
      <label
        htmlFor="videos"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:enabled:bg-violet-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
      >
        <PlusCircle className="h-4 w-4 text-white" />
        Selecione os vídeos
      </label>

      <input
        type="file"
        accept="video/*"
        multiple
        id="videos"
        className="invisible absolute top-0 h-0 w-0"
        onChange={handleVideoFileSelected}
      />
    </div>
  )
}
