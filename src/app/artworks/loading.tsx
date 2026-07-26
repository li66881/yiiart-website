import Header from "@/components/Header"

export default function Loading() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1440px] px-4 pt-[140px] pb-24 sm:px-6 lg:px-10">
        <div className="h-9 w-56 animate-pulse bg-stone-200" />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/5] w-full animate-pulse bg-stone-200" />
              <div className="h-4 w-3/4 animate-pulse bg-stone-200" />
              <div className="h-4 w-1/2 animate-pulse bg-stone-100" />
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
