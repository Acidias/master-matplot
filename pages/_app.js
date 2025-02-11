// pages/_app.js
// import '@nextra/theme-docs/style.css'
import Head from 'next/head'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Load PyScript CSS and JS */}
        <link rel="stylesheet" href="https://pyscript.net/alpha/pyscript.css" />
        <script defer src="https://pyscript.net/alpha/pyscript.js"></script>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
