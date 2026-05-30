import { verifyToken } from "@/features/auth/verification.actions";
import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="w-full text-center py-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Tautan Verifikasi Tidak Valid</h2>
        <p className="text-gray-500 mb-8">Silakan cek kembali email Anda atau minta tautan verifikasi baru.</p>
        <Link href={ROUTES.LOGIN}><Button>Kembali ke Login</Button></Link>
      </div>
    );
  }

  const result = await verifyToken(token);

  return (
    <div className="w-full text-center py-4">
      {result.success ? (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Email Berhasil Diverifikasi!</h2>
          <p className="mb-8">Akun Anda sekarang aktif. Silakan masuk.</p>
          <Link href={ROUTES.LOGIN}><Button>Masuk</Button></Link>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Verifikasi Gagal</h2>
          <p className="text-red-500 mb-8">{result.error}</p>
          <Link href={ROUTES.LOGIN}><Button>Kembali ke Login</Button></Link>
        </>
      )}
    </div>
  );
}
