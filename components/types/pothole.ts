export type PotholeMediaAsset = {
  id?: string | number
  url?: string
  imageUrl?: string
  photoUrl?: string
  uploadedAt?: string
  path?: string
  location?: string
  key?: string
  photoKey?: string
  imageKey?: string
  objectKey?: string
  filename?: string
  name?: string
}

export type Pothole = {
  id: string
  roadName?: string
  description?: string
  district?: string
  location?: string
  severity?: "Critical" | "High" | "Medium" | "Low"
  status?: "Pending" | "In Progress" | "Resolved"
  latitude?: number
  longitude?: number
  reportedAt?: string
  dateReported?: string
  createdAt?: string
  reporterName?: string
  reporterPhone?: string
  reporterEmail?: string
  imageUrl?: string
  photoUrl?: string
  imageKey?: string
  photoKey?: string
  photos?: Array<PotholeMediaAsset | string>
  images?: Array<PotholeMediaAsset | string>
  attachments?: Array<PotholeMediaAsset | string>
}
