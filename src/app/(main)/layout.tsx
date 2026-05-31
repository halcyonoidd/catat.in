// src/app/(main)/layout.tsx
import Navbar from '@/src/components/navbar'; // Sesuaikan jika lokasi foldernya berbeda

// Bagian 'export default function' ini WAJIB ada
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}