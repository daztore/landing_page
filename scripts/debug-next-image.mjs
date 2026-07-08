const img =
  "https://zfpfccznrbotrvfqcdzh.supabase.co/storage/v1/object/public/landing_page/sections/img-9803-487ecefb-d802-4671-87b1-9ca4d7de4399.jpg"

const qs = new URLSearchParams({
  url: img,
  w: "1200",
  q: "75",
})

const baseUrl = process.env.IMAGE_DEBUG_BASE_URL || "http://127.0.0.1:3000"
const target = `${baseUrl}/_next/image?${qs.toString()}`

const res = await fetch(target, {
  headers: {
    Accept: "image/webp,image/*,*/*",
  },
})

const contentType = res.headers.get("content-type") || ""
const buffer = Buffer.from(await res.arrayBuffer())

console.log("TARGET:", target)
console.log("STATUS:", res.status, res.statusText)
console.log("CONTENT_TYPE:", contentType)
console.log("BODY_BYTES:", buffer.length)

if (contentType.startsWith("image/") === false) {
  console.log("BODY:")
  console.log(buffer.toString("utf8"))
}
