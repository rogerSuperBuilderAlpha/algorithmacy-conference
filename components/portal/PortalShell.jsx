'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StudioStyles } from './ui';
import { MfaPanel } from './MfaPanel';
import { usePortal } from './session';
import {
  destinationPath,
  isEngineer,
  normalizePath,
  pageId,
  personName,
} from './format';

const PRIMARY = [
  ['dashboard', '/portal/', 'Home'],
  ['agents', '/portal/agents/', 'Agents'],
  ['approvals', '/portal/approvals/', 'Approvals'],
  ['requests', '/portal/requests/', 'Requests'],
  ['meetings', '/portal/meetings/', 'Calls'],
];

const ENGINEER = [
  ['admin', '/portal/admin/', 'Accounts'],
  ['admin-leads', '/portal/admin/leads/', 'Leads'],
  ['admin-engineers', '/portal/admin/engineers/', 'Engineers'],
  ['admin-availability', '/portal/admin/availability/', 'Availability'],
];

function current(id, page) {
  if (id === 'dashboard') return page === 'dashboard';
  if (id === 'agents') return page === 'agents';
  if (id === 'admin') return page === 'admin' || page === 'admin-account';
  return id === page;
}

function Rail({ user, page, mode }) {
  const ref = useRef(null);
  const { api, me, revision } = usePortal();
  const engineerRail = isEngineer(user) && mode !== 'client';
  const items = engineerRail ? ENGINEER : PRIMARY;
  const [waiting, setWaiting] = useState(0);
  useEffect(() => {
    if (engineerRail || !me || !me.account) {
      setWaiting(0);
      return undefined;
    }
    let cancel = false;
    api('approvals').then((data) => {
      if (!cancel) setWaiting((data.approvals || []).length);
    }).catch(() => {
      if (!cancel) setWaiting(0);
    });
    return () => { cancel = true; };
  }, [engineerRail, me, api, revision]);
  useEffect(() => {
    const nav = ref.current;
    if (!nav) return undefined;
    const link = nav.querySelector('[aria-current="page"]');
    if (link) {
      const railBox = nav.getBoundingClientRect();
      const linkBox = link.getBoundingClientRect();
      nav.scrollLeft += linkBox.left - railBox.left - (nav.clientWidth - linkBox.width) / 2;
    }
    function edges() {
      nav.classList.toggle('rail-more-left', nav.scrollLeft > 4);
      nav.classList.toggle('rail-more-right', nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4);
    }
    nav.addEventListener('scroll', edges, { passive: true });
    edges();
    return () => nav.removeEventListener('scroll', edges);
  }, [page, user]);
  return (
    <nav className="rail" id="portal-nav" aria-label="Portal" ref={ref}>
      {items.map((item) => {
        const name = item[0] === 'approvals' && waiting ? item[2] + ' (' + waiting + ')' : item[2];
        return (
          <Link key={item[0]} href={item[1]} data-page={item[0]} aria-current={current(item[0], page) ? 'page' : undefined}>
            {name}
          </Link>
        );
      })}
    </nav>
  );
}

function TopMeta({ user, account, mode, page }) {
  const { signOut } = usePortal();
  const who = isEngineer(user) && mode === 'engineer'
    ? personName(user)
    : ((account && account.office) || personName(user));
  const showAccount = !isEngineer(user) || mode === 'client';
  return (
    <div className="top-meta" id="portal-top-meta">
      {who ? <span className="portal-who">{who}</span> : null}
      {showAccount ? (
        <nav className="top-links" aria-label="Account">
          <Link className="top-settings" href="/portal/billing/" aria-current={page === 'billing' ? 'page' : undefined}>Subscription</Link>
          <Link className="top-settings" href="/portal/account/" aria-current={page === 'account' ? 'page' : undefined}>People</Link>
          <Link className="top-settings" href="/portal/settings/" aria-current={page === 'settings' ? 'page' : undefined}>Assistant</Link>
          <Link className="top-settings" href="/portal/reports/" aria-current={page === 'reports' ? 'page' : undefined}>Monthly report</Link>
        </nav>
      ) : null}
      <button type="button" className="top-signout" id="sign-out" onClick={signOut}>Sign out</button>
    </div>
  );
}

function PreviewBar({ me }) {
  const { choosePreview, resetOffice, mode, setView } = usePortal();
  if (!me || !me.user || !isEngineer(me.user)) return null;
  const choices = me.previewChoices || [];
  if (!choices.length) return null;
  const viewing = mode === 'client';
  const currentId = viewing && me.account ? me.account.id : '';
  const selected = choices.some((account) => account.id === currentId) ? currentId : '';
  const office = (me.account && me.account.office) || 'This office';
  return (
    <div className="preview-bar">
      <label>
        Office{' '}
        <select id="preview-account" value={selected} onChange={(event) => { if (event.target.value) choosePreview(event.target.value); }}>
          <option value="">Choose an office</option>
          {choices.map((account) => <option key={account.id} value={account.id}>{account.office}</option>)}
        </select>
      </label>
      {viewing ? (
        <p>
          {me.account && me.account.sample ? 'Sample office. Changes stay in this browser.' : ('Viewing ' + office + '.')}
          {' '}
          <button type="button" onClick={() => setView('engineer')}>Back to your desk</button>
          {me.account && me.account.sample ? <> <button type="button" id="reset-sample" onClick={resetOffice}>Reset sample</button></> : null}
        </p>
      ) : (
        <p>Open Harbor & Finch to practice what a client sees. Open a real office to look at that client’s portal.</p>
      )}
    </div>
  );
}

function EngineerTask({ me }) {
  const { mode } = usePortal();
  const task = me && me.user && me.user.engineerTask;
  if (!task || mode !== 'engineer') return null;
  return (
    <section className="notice" id="engineer-task">
      <p><b>Add your photo and two sentences.</b> This is the public profile under Your Engineers. It does not sign you in. The task stays until that profile is on the Studio page.</p>
      <ol className="engineer-steps">
        <li>Fork <a href={task.repo}>the repository</a>.</li>
        <li>Add a square photo at <code>{task.photo}</code>.</li>
        <li>In <code>studio/index.html</code>, find “Your Engineers.” Copy either person block and put yours after it. Change the photo path, your name, two sentences a client could read, and your LinkedIn link. <a href={task.page}>The section is here.</a></li>
        <li>Open a pull request to main. Leave out client names, keys, and documents.</li>
      </ol>
    </section>
  );
}

function BareChrome({ pathname, children }) {
  const finish = normalizePath(pathname).startsWith('/portal/login/finish');
  return (
    <>
      <StudioStyles />
      <a className="visually-hidden" href="#portal">Skip to the content</a>
      <div className="sheet">
        <header className="top">
          <a className="top-brand" href="/studio">Algorithmacy Studio</a>
          <nav className="top-links" aria-label="Algorithmacy">
            {finish ? <a href="/portal/login/">Sign in</a> : (
              <>
                <a href="/studio">The offer</a>
                <a href="/book/">Book a call</a>
              </>
            )}
            <a href="https://x.com/algorithmacy" target="_blank" rel="noopener noreferrer">@algorithmacy</a>
          </nav>
        </header>
        <main className={finish ? 'portal' : 'portal portal-login'} id="portal">
          <Suspense fallback={<p className="portal-loading">Loading.</p>}>{children}</Suspense>
        </main>
      </div>
    </>
  );
}

function AuthenticatedChrome({ children }) {
  const pathname = usePathname();
  const portal = usePortal();
  const page = pageId(pathname);
  const first = useRef(true);
  const sent = useRef('');
  const away = portal.me ? destinationPath(pathname, portal.me.user, portal.mode) : '';

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!away || sent.current === away) return;
    sent.current = away;
    window.location.replace(away);
  }, [away]);

  if (portal.status === 'loading') {
    return (
      <Frame page={page} user={null} account={null} mode="client" loading>
        <p className="portal-loading">Loading.</p>
      </Frame>
    );
  }
  if (portal.status === 'unconfigured') {
    return (
      <Frame page={page} user={null} account={null} mode="client" quiet>
        <header className="page-head">
          <h1>Sign-in is not open yet.</h1>
          <p>Write to <a href="mailto:topanga@algorithmacy.org">topanga@algorithmacy.org</a>.</p>
        </header>
      </Frame>
    );
  }
  if (portal.status === 'error') {
    return (
      <Frame page={page} user={portal.viewer && portal.viewer.user} account={null} mode={portal.mode}>
        <header className="page-head"><h1>Something went wrong.</h1></header>
        <p className="desk-status" role="alert">{portal.error}</p>
        <div className="portal-actions"><button type="button" className="btn" onClick={() => window.location.reload()}>Reload</button></div>
      </Frame>
    );
  }
  if (portal.status === 'mfa') {
    return (
      <BareChrome pathname="/portal/login/">
        <MfaPanel me={portal.viewer || { mfa: portal.mfa }} onDone={portal.finishMfa} />
      </BareChrome>
    );
  }

  const me = portal.me;
  if (!me) {
    return (
      <Frame page={page} user={portal.viewer && portal.viewer.user} account={null} mode={portal.mode} loading>
        <p className="portal-loading">Loading.</p>
      </Frame>
    );
  }

  if (away) {
    return (
      <Frame page={page} user={me.user} account={me.account} mode={portal.mode} me={me} loading>
        <p className="portal-loading">Loading.</p>
      </Frame>
    );
  }

  return (
    <Frame page={page} user={me.user} account={me.account} mode={portal.mode} me={me}>
      <Suspense fallback={<p className="portal-loading">Loading.</p>}>{children}</Suspense>
    </Frame>
  );
}

function Frame({ page, user, account, mode, me, loading, quiet, children }) {
  return (
    <>
      <StudioStyles />
      <a className="visually-hidden" href="#portal">Skip to the content</a>
      <div className="sheet">
        <header className="top" id="portal-top">
          <div className="top-brand-row">
            <Link className="top-brand" href={isEngineer(user) && mode === 'engineer' ? '/portal/admin/' : '/portal/'}>Algorithmacy Studio</Link>
            <a className="top-x" href="https://x.com/algorithmacy" target="_blank" rel="noopener noreferrer">@algorithmacy</a>
          </div>
          {quiet ? <div className="top-meta" id="portal-top-meta" /> : (loading || !user ? <div className="top-meta" id="portal-top-meta"><span className="portal-loading">Loading.</span></div> : (
            <TopMeta user={user} account={account} mode={mode} page={page} />
          ))}
        </header>
        <div className="portal">
          <div className="portal-frame">
            {user && !loading ? <Rail user={user} page={page} mode={mode} /> : <nav className="rail" id="portal-nav" aria-label="Portal" hidden />}
            <main className="portal-body" id="portal" data-page={page || undefined}>
              {me && !loading ? <PreviewBar me={me} /> : null}
              {me && !loading ? <EngineerTask me={me} /> : null}
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PortalShell({ children }) {
  const pathname = usePathname();
  if (normalizePath(pathname).startsWith('/portal/login')) {
    return <BareChrome pathname={pathname}>{children}</BareChrome>;
  }
  return <AuthenticatedChrome>{children}</AuthenticatedChrome>;
}
