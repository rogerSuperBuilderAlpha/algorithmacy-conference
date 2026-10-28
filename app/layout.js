export const metadata = {
  title: 'Algorithmacy',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <link rel="stylesheet" href="/assets/css/x-follow.css" />
        {children}
        <script src="/assets/js/x-follow.js" defer />
      </body>
    </html>
  );
}
