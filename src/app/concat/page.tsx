import { Concat } from '@/components/Concact'
import { MainForm } from '@/components/MainForm'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-xl font-semibold leading-none">Juntar dois videos</h1>
      <Link href="/" className="text-blue-500">
        Voltar
      </Link>
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-lg bg-white p-6 shadow">
        <Concat />
      </div>
    </div>
  )
}
