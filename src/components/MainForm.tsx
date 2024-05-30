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

export function MainForm() {
  const [video, setVideo] = useState<Video>()
  const [audio, setAudio] = useState<Video>()

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

  function handleUploadAudio(file: File) {
    setAudio({
      file,
      previewURL: URL.createObjectURL(file),
      isLoading: false,
      convertingProgress: 0,
      isConverted: false,
      duration: 0,
    })
  }

  console.log(video)

  async function handleConvert() {
    if (!video) {
      return
    }

    setVideo({
      ...video,
      isLoading: true,
    })

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load()
    }

    if (!video) {
      throw new Error(`Trying to convert an inexistent video`)
    }

    const { file } = video

    ffmpeg.FS('writeFile', file.name, await fetchFile(file))

    const fileExtension = file.name.split('.').pop()

    const fileName = file.name.split('.').shift()

    if (fileExtension !== 'mp4') {
      await ffmpeg.run('-i', file.name, '-codec', 'copy', `${fileName}.mp4`)

      const data = ffmpeg.FS('readFile', `${fileName}.mp4`)
      const convertedFile = new File([data.buffer], `${fileName}.mp4`, {
        type: 'video/mp4',
      })

      setVideo({
        ...video,
        file: convertedFile,
        previewURL: URL.createObjectURL(convertedFile),
        isLoading: true,
      })
    }
    ffmpeg.setProgress(({ ratio }) => {
      const progress = Math.round(ratio * 100)

      // console.log(progress)

      setVideo({
        ...video,
        convertingProgress: progress,
        isLoading: true,
      })
    })

    await ffmpeg.run(
      '-i',
      `${fileName}.mp4`,
      '-b',
      '100K',
      `${fileName} - 100K.mp4`,
    )

    const data = ffmpeg.FS('readFile', `${fileName} - 100K.mp4`)

    const convertedFile = new File([data.buffer], `${fileName} - 100K.mp4`, {
      type: 'video/mp4',
    })

    setVideo({
      ...video,
      isLoading: false,
      isConverted: true,
      convertedFile,
      convertedURL: URL.createObjectURL(convertedFile),
    })
  }

  async function handleGenerateNewVideo() {
    if (!video) {
      return
    }

    if (!audio) {
      return
    }

    setAudio({
      ...audio,
      isLoading: true,
    })

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load()
    }

    if (!audio) {
      throw new Error(`Trying to convert an inexistent video`)
    }

    const { file: fileAudio } = audio

    ffmpeg.FS('writeFile', fileAudio.name, await fetchFile(fileAudio))

    const { file: fileVideo } = video

    ffmpeg.FS('writeFile', fileVideo.name, await fetchFile(fileVideo))

    const fileAudioName = fileAudio.name.split('.').shift()
    const fileVideoName = fileVideo.name.split('.').shift()

    ffmpeg.setProgress(({ ratio }) => {
      const progress = Math.round(ratio * 100)

      console.log(progress)

      setAudio({
        ...audio,
        convertingProgress: progress,
      })
    })

    await ffmpeg.run(
      '-i',
      `${fileVideoName}.mp4`,
      '-i',
      `${fileAudioName}.mp4`,
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

    setAudio({
      ...audio,
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
          {!video.isConverted && (
            <button
              type="button"
              className="rounded-md bg-violet-500 px-4 py-2 text-white"
              onClick={handleConvert}
            >
              Converter
            </button>
          )}

          {video.isConverted && (
            <>
              <a
                href={video.convertedURL}
                download={video.convertedFile?.name}
                className="rounded-md bg-emerald-500 px-4 py-2 text-white"
              >
                Baixar
              </a>

              {/* {!audio && <UploadVideo onSelectVideo={handleUploadAudio} />}

              {audio && <VideoItem id={''} video={audio} theSecond />}

              {!audio?.isConverted && (
                <button
                  type="button"
                  className="rounded-md bg-violet-500 px-4 py-2 text-white"
                  onClick={handleGenerateNewVideo}
                >
                  Gerar video
                </button>
              )}

              {audio?.isConverted && (
                <a
                  href={audio.convertedURL}
                  download={audio.convertedFile?.name}
                  className="rounded-md bg-emerald-500 px-4 py-2 text-white"
                >
                  Baixar
                </a>
              )} */}
            </>
          )}
        </div>
      )}
    </div>
  )
}
