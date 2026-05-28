import Modal from '@/components/ui/Modal'
import { InputField, TextareaField } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

interface OfferModalProps {
  isOpen: boolean
  onClose: () => void
  productPrice: number
  offerPrice: string
  setOfferPrice: (val: string) => void
  offerNote: string
  setOfferNote: (val: string) => void
  isSubmitting: boolean
  onSubmit: () => void
}

export default function OfferModal({
  isOpen,
  onClose,
  productPrice,
  offerPrice,
  setOfferPrice,
  offerNote,
  setOfferNote,
  isSubmitting,
  onSubmit
}: OfferModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose} title="Ajukan Penawaran Baru">
      <div className="space-y-4 pt-2">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
           <p className="text-gray-500 text-sm mb-1">Harga saat ini</p>
           <p className="text-gray-900 font-bold text-xl">{formatPrice(productPrice)}</p>
        </div>
        <InputField
          type="number"
          value={offerPrice}
          onChange={(e) => setOfferPrice(e.target.value)}
          label="Harga Penawaran Anda (Rp)"
          placeholder="Contoh: 150000"
        />
        <TextareaField
          value={offerNote}
          onChange={(e) => setOfferNote(e.target.value)}
          label="Pesan Tambahan (opsional)"
          placeholder="Ketik alasan penawaran atau lokasi COD yang diinginkan..."
          rows={3}
        />
      </div>
      <div className="flex gap-3 mt-6">
        <Button
          onClick={onClose}
          variant="secondary"
          fullWidth
          size="lg"
          className="font-semibold h-12"
        >
          Batal
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!offerPrice || isSubmitting}
          variant="accent"
          fullWidth
          size="lg"
          className="bg-amber-400 hover:bg-amber-500 text-white font-bold h-12 border-none shadow-sm shadow-amber-400/30"
          loading={isSubmitting}
        >
          Kirim Tawaran
        </Button>
      </div>
    </Modal>
  )
}