import { NextResponse } from "next/server"

import {
  feedbackCustomerPhotoBucket,
  feedbackCustomerPhotoMaxFiles,
  feedbackRecommendations,
} from "@/lib/feedback/constants"
import { feedbackUuidPattern } from "@/lib/feedback/data"
import {
  getFeedbackImageValidationError,
  uploadFeedbackImage,
} from "@/lib/feedback/storage"
import { getSupabaseClient } from "@/lib/supabase/client"

interface FeedbackRouteContext {
  params: Promise<{ id: string }>
}

function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim()
}

function getPhotoFiles(formData: FormData) {
  return formData
    .getAll("photos")
    .filter(
      (value): value is File =>
        typeof value !== "string" &&
        typeof value.arrayBuffer === "function" &&
        typeof value.size === "number" &&
        value.size > 0,
    )
}

export async function POST(
  request: Request,
  { params }: FeedbackRouteContext,
) {
  const { id } = await params

  if (!feedbackUuidPattern.test(id)) {
    return NextResponse.json(
      { error: "Link feedback tidak valid." },
      { status: 404 },
    )
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json(
      { error: "Konfigurasi Supabase belum tersedia." },
      { status: 503 },
    )
  }

  try {
    const formData = await request.formData()
    const rating = Number(getText(formData, "rating"))
    const criticism = getText(formData, "criticism")
    const testimonial = getText(formData, "testimonial")
    const recommendations = formData
      .getAll("recommendations")
      .map((value) => String(value).trim())
      .filter(Boolean)
    const photos = getPhotoFiles(formData)

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating wajib dipilih dari 1 sampai 5." },
        { status: 400 },
      )
    }

    if (!criticism && !testimonial) {
      return NextResponse.json(
        { error: "Isi kritik/saran atau testimoni singkat." },
        { status: 400 },
      )
    }

    if (photos.length > feedbackCustomerPhotoMaxFiles) {
      return NextResponse.json(
        { error: `Maksimal ${feedbackCustomerPhotoMaxFiles} foto pelanggan.` },
        { status: 400 },
      )
    }

    const allowedRecommendations = new Set<string>(feedbackRecommendations)
    if (
      recommendations.some(
        (recommendation) => !allowedRecommendations.has(recommendation),
      )
    ) {
      return NextResponse.json(
        { error: "Rekomendasi feedback tidak valid." },
        { status: 400 },
      )
    }

    for (const photo of photos) {
      const validationError = getFeedbackImageValidationError(photo)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }
    }

    const { data: feedbackRequest, error: requestError } = await supabase
      .from("feedback_requests")
      .select("id,status")
      .eq("id", id)
      .maybeSingle()

    if (requestError) {
      return NextResponse.json(
        { error: requestError.message },
        { status: 500 },
      )
    }

    if (!feedbackRequest) {
      return NextResponse.json(
        { error: "Request feedback tidak ditemukan." },
        { status: 404 },
      )
    }

    if ((feedbackRequest as { status: string }).status !== "pending") {
      return NextResponse.json(
        { error: "Feedback sudah pernah dikirim atau link tidak aktif." },
        { status: 409 },
      )
    }

    const uploadedPhotoUrls: string[] = []
    for (const photo of photos) {
      const path = await uploadFeedbackImage(
        supabase,
        feedbackCustomerPhotoBucket,
        id,
        photo,
      )
      uploadedPhotoUrls.push(path)
    }

    const { error: insertError } = await supabase
      .from("feedback_submissions")
      .insert({
        feedback_request_id: id,
        rating,
        criticism: criticism || null,
        testimonial: testimonial || null,
        recommendations,
        customer_photo_urls: uploadedPhotoUrls,
      })

    if (insertError) {
      const duplicate = insertError.code === "23505"
      return NextResponse.json(
        {
          error: duplicate
            ? "Feedback sudah pernah dikirim."
            : insertError.message,
        },
        { status: duplicate ? 409 : 400 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Gagal mengirim feedback.",
      },
      { status: 500 },
    )
  }
}
