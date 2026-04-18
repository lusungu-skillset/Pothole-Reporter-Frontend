import type { Pothole, PotholeMediaAsset } from "@/components/types/pothole"
import { API_BASE_URL } from "@/lib/api"

const MINIO_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_MINIO_URL?.replace(/\/$/, "") || ""
const MINIO_BUCKET = process.env.NEXT_PUBLIC_MINIO_BUCKET?.replace(/^\/+|\/+$/g, "") || ""

type MediaLike = PotholeMediaAsset | string | null | undefined

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const toCleanString = (value: unknown) => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const toAbsoluteMediaUrl = (value: string) => {
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`
  }

  if (MINIO_PUBLIC_BASE_URL) {
    const normalized = value.replace(/^\/+/, "")
    if (MINIO_BUCKET && !normalized.startsWith(`${MINIO_BUCKET}/`)) {
      return `${MINIO_PUBLIC_BASE_URL}/${MINIO_BUCKET}/${normalized}`
    }

    return `${MINIO_PUBLIC_BASE_URL}/${normalized}`
  }

  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`
}

const extractMediaUrl = (asset: MediaLike) => {
  if (!asset) return null

  if (typeof asset === "string") {
    const normalized = toCleanString(asset)
    return normalized ? toAbsoluteMediaUrl(normalized) : null
  }

  const keys = [
    asset.photoUrl,
    asset.url,
    asset.imageUrl,
    asset.path,
    asset.location,
    asset.imageKey,
    asset.photoKey,
    asset.objectKey,
    asset.key,
    asset.filename,
    asset.name,
  ]

  for (const candidate of keys) {
    const normalized = toCleanString(candidate)
    if (normalized) return toAbsoluteMediaUrl(normalized)
  }

  return null
}

export function getPotholeImageUrls(pothole?: Partial<Pothole> | Record<string, unknown> | null) {
  if (!pothole || !isRecord(pothole)) return []

  const potholeRecord = pothole as Record<string, unknown>
  const mediaCandidates: MediaLike[] = []
  const collectionKeys = ["photos", "images", "attachments", "media"]
  const singleKeys = ["imageUrl", "photoUrl", "imageKey", "photoKey", "image", "photo", "key", "objectKey"]

  for (const key of collectionKeys) {
    const value = potholeRecord[key]
    if (Array.isArray(value)) {
      mediaCandidates.push(...(value as MediaLike[]))
    }
  }

  for (const key of singleKeys) {
    const value = potholeRecord[key]
    if (typeof value === "string") {
      mediaCandidates.push(value)
    } else if (isRecord(value)) {
      mediaCandidates.push(value as PotholeMediaAsset)
    }
  }

  const resolved = mediaCandidates
    .map((asset) => extractMediaUrl(asset))
    .filter((value): value is string => Boolean(value))

  return Array.from(new Set(resolved))
}
