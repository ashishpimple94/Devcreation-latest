import Link from 'next/link';
import Image from 'next/image';

/** Centered brand shell for the auth screens (login, register, forgot). */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-8">
        <Image src="/assets/Logos/logo.jpeg" alt="Dev Creation" width={140} height={70} className="h-16 w-auto object-contain" priority />
      </Link>
      <h1 className="font-display-alt text-3xl font-medium text-ink">{title}</h1>
      <p className="mb-8 mt-2 text-center text-sm text-body">{subtitle}</p>
      {children}
    </div>
  );
}
