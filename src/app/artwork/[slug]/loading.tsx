import Header from "@/components/Header"

export default function Loading() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1440px] px-4 pt-[140px] pb-24 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] w-full animate-pulse bg-stone-200" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse bg-stone-200" />
            <div className="h-5 w-1/3 animate-pulse bg-stone-200" />
            <div className="h-24 w-full animate-pulse bg-stone-100" />
            <div className="h-12 w-40 animate-pulse bg-stone-200" />
          </div>
        </div>
      </main>
    </>
  )
}
