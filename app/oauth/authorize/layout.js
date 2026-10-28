import { Suspense } from 'react';
import { StudioStyles } from '../../../components/portal/ui';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Allow an assistant · Algorithmacy Studio',
  robots: { index: false, follow: false },
};

export default function OAuthLayout({ children }) {
  return (
    <>
      <StudioStyles />
      <a className="visually-hidden" href="#oauth">Skip to the content</a>
      <div className="sheet">
        <header className="top">
          <a className="top-brand" href="/studio">Algorithmacy Studio</a>
          <nav className="top-links" aria-label="Algorithmacy">
            <a href="/studio">The offer</a>
            <a href="/book/">Book a call</a>
            <a href="https://x.com/algorithmacy" target="_blank" rel="noopener noreferrer">@algorithmacy</a>
          </nav>
        </header>
        <main className="portal portal-login" id="oauth">
          <Suspense fallback={<p className="portal-login-lead">Checking the request.</p>}>
            {children}
          </Suspense>
        </main>
      </div>
    </>
  );
}
