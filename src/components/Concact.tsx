'use client'

import { useState } from 'react'
import { UploadVideo } from './UploadVideosStep'
import { VideoItem } from './VideoItem'

import { ffmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/ffmpeg'

export interface Video {
  file: File
  previewURL: string
  isLoading: boolean
  convertingProgress: number
  isConverted: boolean
  convertedFile?: File
  convertedURL?: string
  duration: number
}

export function Concat() {
  const [video, setVideo] = useState<Video>()
  const [video2, setVideo2] = useState<Video>()

  function handleUpload(file: File) {
    setVideo({
      file,
      previewURL: URL.createObjectURL(file),
      isLoading: false,
      convertingProgress: 0,
      isConverted: false,
      duration: 0,
    })
  }

  function handleUploadVideo2(file: File) {
    setVideo2({
      file,
      previewURL: URL.createObjectURL(file),
      isLoading: false,
      convertingProgress: 0,
      isConverted: false,
      duration: 0,
    })
  }

  async function handleGenerateNewVideo() {
    if (!video) {
      return
    }

    if (!video2) {
      return
    }

    setVideo2({
      ...video2,
      isLoading: true,
    })

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load()
    }

    if (!video2) {
      throw new Error(`Trying to convert an inexistent video`)
    }

    const { file: fileVideo2 } = video2

    ffmpeg.FS('writeFile', fileVideo2.name, await fetchFile(fileVideo2))

    const { file: fileVideo } = video

    ffmpeg.FS('writeFile', fileVideo.name, await fetchFile(fileVideo))

    const fileVideo2Name = fileVideo2.name.split('.').shift()
    const fileVideoName = fileVideo.name.split('.').shift()

    // convert all to mp4

    await ffmpeg.run(
      '-i',
      fileVideo2.name,
      '-codec',
      'copy',
      `${fileVideo2Name}.mp4`,
    )
    await ffmpeg.run(
      '-i',
      fileVideo.name,
      '-codec',
      'copy',
      `${fileVideoName}.mp4`,
    )

    ffmpeg.setProgress(({ ratio }) => {
      const progress = Math.round(ratio * 100)

      console.log(progress)

      setVideo2({
        ...video2,
        convertingProgress: progress,
        isLoading: true,
      })
    })

    await ffmpeg.run(
      '-i',
      `${fileVideoName}.mp4`,
      '-i',
      `${fileVideo2Name}.mp4`,
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      `${fileVideoName} - converted.mp4`,
    )

    // ffmpeg -i "./ACIDENTALMENTE ASTRONAUTAS, INFANTIL.mkv" -i "./ACIDENTALMENTE ASTRONAUTAS, INFANTIL - 100k.mp4" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "./ACIDENTALMENTE ASTRONAUTAS, INFANTIL - pt.mkv"

    const data = ffmpeg.FS('readFile', `${fileVideoName} - converted.mp4`)

    const convertedFile = new File(
      [data.buffer],
      `${fileVideoName} - converted.mp4`,
      {
        type: 'video/mp4',
      },
    )

    setVideo2({
      ...video2,
      isLoading: false,
      isConverted: true,
      convertedFile,
      convertedURL: URL.createObjectURL(convertedFile),
    })
  }

  return (
    <div>
      {!video && <UploadVideo onSelectVideo={handleUpload} />}
      {!video ? (
        <span className="inline-block text-center text-xs text-zinc-500">
          Nenhum vídeo selecionado
        </span>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <VideoItem id={''} video={video} />

          {!video2 && <UploadVideo onSelectVideo={handleUploadVideo2} />}

          {video2 && <VideoItem id={''} video={video2} theSecond />}

          {!video2?.isConverted && video && (
            <button
              type="button"
              className="rounded-md bg-violet-500 px-4 py-2 text-white"
              onClick={handleGenerateNewVideo}
            >
              Gerar video
            </button>
          )}

          {video2?.isConverted && (
            <a
              href={video2.convertedURL}
              download={video2.convertedFile?.name}
              className="rounded-md bg-emerald-500 px-4 py-2 text-white"
            >
              Baixar
            </a>
          )}
        </div>
      )}
    </div>
  )
}
