'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { InputField, TextareaField, SelectField } from '@/components/ui/Input'
import SubmitButton from '@/components/ui/SubmitButton'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '@/lib/constants/pens'
import { createProductAction } from '@/features/products/actions'
import { ROUTES } from '@/lib/constants/routes'
import { X, Upload, ImageIcon, Info } from 'lucide-react'

export default function NewProductForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Form values state for dynamic styling/control
  const [listingType, setListingType] = useState<'sell' | 'barter'>('sell')
  const [isNegotiable, setIsNegotiable] = useState(true)
  
  // Image handling state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const MAX_FILES = 5
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    // Check count limit
    if (selectedFiles.length + files.length > MAX_FILES) {
      toast.error(`Maksimal hanya dapat mengunggah ${MAX_FILES} foto produk.`)
      return
    }

    const newFiles: File[] = []
    const newPreviews: string[] = []
    let hasError = false

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" terlalu besar (maksimal 5MB).`)
        hasError = true
        return
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Format file "${file.name}" tidak didukung (gunakan JPG, PNG, WEBP, atau GIF).`)
        hasError = true
        return
      }

      newFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    })

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles])
      setPreviews((prev) => [...prev, ...newPreviews])
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy.images
        return copy
      })
    }

    // Reset file input value so same files can be chosen again if deleted
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  };

  const removeImage = (index: number) => {
    // Revoke the object URL
    URL.revokeObjectURL(previews[index])

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})

    const formData = new FormData(e.currentTarget)

    // Append selected images
    formData.delete('images') // Remove empty file input values
    selectedFiles.forEach((file) => {
      formData.append('images', file)
    })

    // Manual client-side validation for better responsive feedback
    const newErrors: Record<string, string> = {}
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const condition = formData.get('condition') as string
    const price = formData.get('price') as string

    if (!title || title.trim().length < 3) {
      newErrors.title = 'Judul produk minimal 3 karakter'
    } else if (title.length > 120) {
      newErrors.title = 'Judul produk maksimal 120 karakter'
    }

    if (!category) {
      newErrors.category = 'Kategori wajib dipilih'
    }

    if (!condition) {
      newErrors.condition = 'Kondisi barang wajib dipilih'
    }

    if (listingType === 'sell' && (!price || parseFloat(price) <= 0)) {
      newErrors.price = 'Harga wajib diisi dengan angka lebih dari 0 untuk tipe Penjualan'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstError = Object.values(newErrors)[0]
      toast.error(firstError)
      return
    }

    startTransition(async () => {
      try {
        const result = await createProductAction(formData)

        if (result.success && result.data?.id) {
          toast.success('Iklan barang berhasil dipasang!')
          router.push(ROUTES.PRODUCT_DETAIL(result.data.id))
          router.refresh()
        } else {
          toast.error(result.error || 'Gagal memasang iklan barang.')
          if ('fieldErrors' in result && result.fieldErrors) {
            const mappedErrors: Record<string, string> = {}
            Object.entries(result.fieldErrors).forEach(([key, val]) => {
              mappedErrors[key] = val[0]
            })
            setErrors(mappedErrors)
          }
        }
      } catch (err: any) {
        toast.error('Terjadi kesalahan koneksi atau internal server.')
        console.error(err)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <InputField
        id="title"
        name="title"
        required
        label="Judul Iklan"
        placeholder="Contoh: Arduino Uno R3 Bekas Pakai Normal"
        error={errors.title}
        disabled={isPending}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          id="listing_type"
          name="listing_type"
          required
          label="Tipe Penjualan"
          value={listingType}
          onChange={(e) => {
            const val = e.target.value as 'sell' | 'barter'
            setListingType(val)
            if (val === 'barter') {
              setErrors((prev) => {
                const copy = { ...prev }
                delete copy.price
                return copy
              })
            }
          }}
          disabled={isPending}
        >
          <option value="sell">Jual (Rupiah)</option>
          <option value="barter">Barter (Tukar Barang)</option>
        </SelectField>

        {listingType === 'sell' ? (
          <InputField
            id="price"
            name="price"
            type="number"
            min={1}
            required
            label="Harga (Rp)"
            placeholder="Contoh: 85000"
            error={errors.price}
            disabled={isPending}
          />
        ) : (
          <div className="flex flex-col justify-end bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-800 gap-1 h-[72px] self-end">
            <span className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              Sistem Barter Aktif
            </span>
            <span>Iklan ini akan dipasang secara gratis untuk saling bertukar barang tanpa tarif harga rupiah.</span>
            <input type="hidden" name="price" value="" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          id="campus_location"
          name="campus_location"
          label="Lokasi Kampus (opsional)"
          placeholder="Contoh: Gedung D4 / Kantin PENS"
          error={errors.campus_location}
          disabled={isPending}
        />

        <InputField
          id="stock"
          name="stock"
          type="number"
          min={1}
          defaultValue={1}
          required
          label="Stok Barang"
          placeholder="Contoh: 1"
          error={errors.stock}
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          id="category"
          name="category"
          required
          label="Kategori"
          defaultValue=""
          error={errors.category}
          disabled={isPending}
        >
          <option value="" disabled>-- Pilih Kategori --</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </SelectField>

        <SelectField
          id="condition"
          name="condition"
          required
          label="Kondisi Barang"
          defaultValue="good"
          error={errors.condition}
          disabled={isPending}
        >
          {PRODUCT_CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label} — {c.description}</option>
          ))}
        </SelectField>
      </div>

      <TextareaField
        id="description"
        name="description"
        rows={4}
        label="Deskripsi"
        placeholder="Jelaskan kondisi, spesifikasi, atau catatan penting tentang barang..."
        error={errors.description}
        disabled={isPending}
      />

      {/* Modern, interactive product image preview section */}
      <div className="space-y-2">
        <label className="block text-gray-700 text-sm font-medium">
          Foto Produk <span className="text-gray-400">(maksimal 5 foto, file format JPG/PNG/WEBP/GIF)</span>
        </label>
        
        {/* Upload Container Area */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div key={preview} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50 shadow-sm animate-fade-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={`Preview produk ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer shadow-md hover:scale-110 active:scale-95"
                disabled={isPending}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-[10px] text-white text-center font-medium">
                Foto {index + 1}
              </div>
            </div>
          ))}

          {selectedFiles.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl bg-gray-50/50 hover:bg-blue-50/20 text-gray-400 hover:text-blue-600 transition-all cursor-pointer group shadow-sm"
              disabled={isPending}
            >
              <Upload className="w-6 h-6 mb-1.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="text-xs font-semibold">Unggah Foto</span>
              <span className="text-[10px] text-gray-400 mt-0.5">({selectedFiles.length}/5)</span>
            </button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isPending}
        />
        {errors.images && <p className="mt-1 text-xs text-[var(--danger)]">{errors.images}</p>}
      </div>

      {listingType === 'sell' && (
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name="is_negotiable"
            checked={isNegotiable}
            onChange={(e) => setIsNegotiable(e.target.checked)}
            value="true"
            className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer focus:ring-blue-500/20"
            disabled={isPending}
          />
          <span className="text-gray-600 text-sm font-medium">Harga bisa nego (bisa ditawar oleh pembeli)</span>
          {/* We supply the hidden field because standard checkbox only submits if checked */}
          <input type="hidden" name="is_negotiable" value={isNegotiable ? 'true' : 'false'} />
        </label>
      )}

      <SubmitButton
        fullWidth
        size="lg"
        variant="accent"
        pendingText="Memasang iklan..."
        disabled={isPending}
      >
        Pasang Iklan Sekarang
      </SubmitButton>
    </form>
  )
}
