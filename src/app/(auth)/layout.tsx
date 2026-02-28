export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth pages don't show the main Nav
  return <>{children}</>;
}
