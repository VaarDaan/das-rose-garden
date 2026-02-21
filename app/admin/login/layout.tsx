// This layout renders without the admin sidebar so the login page
// is a standalone full-screen page.
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
