import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { FeedbackSubmissionForm } from "@/components/feedback/feedback-submission-form"
import { feedbackProductPhotoBucket } from "@/lib/feedback/constants"
import { getPublicFeedbackRequest } from "@/lib/feedback/data"
import { getSafeImageSrc } from "@/lib/security/safe-image-src"
import { resolveStorageImageUrl } from "@/lib/supabase/storage"

export const dynamic = "force-dynamic"

const feedbackRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
}

interface FeedbackPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: FeedbackPageProps) {
  const { id } = await params
  const result = await getPublicFeedbackRequest(id)

  if (result.status !== "ok") {
    return {
      title: "Feedback Produk | daztore.id",
      robots: feedbackRobots,
    }
  }

  return {
    title: `Feedback ${result.request.productName} | daztore.id`,
    description: "Halaman feedback pelanggan daztore.id.",
    robots: feedbackRobots,
  }
}

function MessagePanel({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <h2 className="font-serif text-2xl font-bold text-stone-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </div>
  )
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { id } = await params
  const result = await getPublicFeedbackRequest(id)

  if (result.status === "not-found") {
    notFound()
  }

  if (result.status === "unconfigured") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf0] p-4">
        <MessagePanel
          title="Konfigurasi belum tersedia"
          description="Supabase belum dikonfigurasi pada aplikasi ini."
        />
      </main>
    )
  }

  if (result.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf0] p-4">
        <MessagePanel
          title="Feedback belum bisa dimuat"
          description={result.message}
        />
      </main>
    )
  }

  const request = result.request
  const productImage = resolveStorageImageUrl(
    feedbackProductPhotoBucket,
    request.productPhotoUrl,
    "/gallery-1.jpg",
  )
  const safeProductImage = getSafeImageSrc(productImage) || "/gallery-1.jpg"
  const submitted = request.status === "submitted"
  const expired = request.status === "expired"

  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-6 text-stone-900 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            daztore.id
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Feedback Produk
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Halo {request.customerName}, terima kasih sudah mempercayakan momen
            spesial Anda kepada daztore.id.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="overflow-hidden rounded-2xl border border-amber-200/70 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-stone-100">
              <Image
                src={safeProductImage}
                alt={request.productName}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="space-y-3 p-5">
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                {request.productCategoryLabel}
              </span>
              <div>
                <h2 className="font-serif text-2xl font-bold">
                  {request.productName}
                </h2>
                {request.productDescription && (
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {request.productDescription}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200/70 bg-white p-5 shadow-sm sm:p-6">
            {submitted ? (
              <MessagePanel
                title="Feedback sudah terkirim"
                description="Link ini sudah pernah digunakan, sehingga feedback tidak bisa dikirim ulang."
              />
            ) : expired ? (
              <MessagePanel
                title="Link feedback tidak aktif"
                description="Request feedback ini sudah expired dan tidak menerima kiriman baru."
              />
            ) : (
              <FeedbackSubmissionForm feedbackRequestId={request.id} />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
