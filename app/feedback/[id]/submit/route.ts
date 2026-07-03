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
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"

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

  const supabase = getSupabaseServiceRoleClient()
  if (!supabase) {
    return NextResponse.json(
      { error: "Konfigurasi feedback belum tersedia." },
      { status: 503 },
    )
  }

  const uploadedPhotoUrls: string[] = []

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
      console.error("[Supabase] Gagal validasi feedback request:", requestError.message)
      return NextResponse.json(
        { error: "Feedback belum bisa diproses. Silakan coba lagi." },
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
      if (uploadedPhotoUrls.length > 0) {
        await supabase.storage
          .from(feedbackCustomerPhotoBucket)
          .remove(uploadedPhotoUrls)
      }

      const duplicate = insertError.code === "23505"
      if (!duplicate) {
        console.error("[Supabase] Gagal menyimpan feedback submission:", insertError.message)
      }

      return NextResponse.json(
        {
          error: duplicate
            ? "Feedback sudah pernah dikirim."
            : "Feedback belum bisa disimpan. Silakan coba lagi.",
        },
        { status: duplicate ? 409 : 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (uploadedPhotoUrls.length > 0) {
      await supabase.storage
        .from(feedbackCustomerPhotoBucket)
        .remove(uploadedPhotoUrls)
    }

    console.error("[Feedback] Gagal mengirim feedback:", error)
    return NextResponse.json(
      {
        error: "Gagal mengirim feedback. Silakan coba lagi.",
      },
      { status: 500 },
    )
  }
}
