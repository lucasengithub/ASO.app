import { Response } from 'express';
import { barData, helloC, preventBack, topData } from './navbar'

export const navGen = (content: string | string[], res: Response) => {
    let data = typeof content === 'string' ? content : content.join('');
    const modifiedData = data
        .replace(
            '<div id="aso-bar"></div>',
            `<div id="aso-bar">${barData}</div>\n<script>${preventBack}</script>`
        )
        .replace(
            '<div id="head-bar"></div>',
            `<div id="head-bar">${topData}</div>`
        )
        .replace(
            '</head>',
            `<link rel="icon" type="image/png" href="/icons/192.png" />
            <link rel="stylesheet" href="/aso.css">
            <link rel="manifest" href="/manifest.json" crossorigin="use-credentials">
            <meta name="apple-mobile-web-app-capable" content="yes">
            <meta name="apple-mobile-web-app-status-bar-style" content="white-translucent">
            <link rel="apple-touch-icon" href="/icons/192.png">
            <meta name="apple-mobile-web-app-title" content="ASO.app">
            <meta name="theme-color" content="white">
            <meta name="description" content="La ASO.app reúne todo lo que necesitas para la ESD.">
            <meta name="keywords" content="ASO, ESD, Escuela, Aplicación, App, Noticias, Notificaciones">
            <meta name="author" content="aadm.space">
            <meta name="robots" content="index, follow">
            <link rel="preload" href="/icons/material-symbols/material-symbols-outlined.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchpriority="high">
            <style>
              @font-face {
                font-family: 'Material Symbols Outlined';
                font-display: swap;
                src: url('/icons/material-symbols/material-symbols-outlined.woff2') format('woff2');
              }
            </style>
            </head>\n <div id="bCursor"> </div> `
        )
        .replace(
            '</html>',
            `<!-- start webpushr code --> <script>(function(w,d, s, id) {if(typeof(w.webpushr)!=='undefined') return;w.webpushr=w.webpushr||function(){(w.webpushr.q=w.webpushr.q||[]).push(arguments)};var js, fjs = d.getElementsByTagName(s)[0];js = d.createElement(s); js.id = id;js.async=1;js.src = "https://cdn.webpushr.com/app.min.js";fjs.parentNode.appendChild(js);}(window,document, 'script', 'webpushr-jssdk'));webpushr('setup',{'key':'BB77e-1LauvWNJsKBDUTpVERE4I6vRJeEFVBhRNY0RS0E01jvUvzIYqq0jzCfNRM0ZueehtU7gTWk9_PkIPXRoI' });</script><!-- end webpushr code -->
            <script defer>${helloC}</script>
            <script defer src="/formula.js"></script>
            </html>`
        )
    res.send(modifiedData)
}
