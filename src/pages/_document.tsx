// pages/_document.tsx
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="bg">
        <Head>
          {/* PWA manifest */}
          <link rel="manifest" href="/manifest.webmanifest" />

          {/* Цвет на адрес бара / статус бара */}
          <meta name="theme-color" content="#059669" />

          {/* iOS икона */}
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/icons/tripsplitly-192.png"
          />

          {/* Favicon (desktop / browser tab) */}
          <link
            rel="icon"
            href="/tripsplitly-logo.png"
            type="image/png"
          />
          <link
            rel="shortcut icon"
            href="/tripsplitly-logo.png"
          />
        </Head>
        <body className="bg-[#020a08]">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
