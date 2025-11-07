import '@/app/(dashboard)/globals-dashboard.css'

import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TEMP: Disable auth check for UI iteration
  // const supabase = await createClient()

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/signin')
  // }

  return (
    <div className="flex h-screen">
      {/* Sidebar - Full Height */}
      <Sidebar />

      {/* Main Area - Navbar + Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
