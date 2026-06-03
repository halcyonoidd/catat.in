import Navbar from '@/src/components/navbar';
import Sidebar from '@/src/components/sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>

      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}