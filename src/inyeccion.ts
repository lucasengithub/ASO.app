import { Response } from 'express';
import { barData, cursorData, helloC, preventBack, topData } from './navbar'

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
            <meta name="theme-color" content="white">
            <meta name="apple-mobile-web-app-status-bar-style" content="white">
            <link rel="preload" href="/icons/material-symbols/material-symbols-outlined.woff2" as="font" type="font/woff2" crossorigin="anonymous" fetchpriority="high">
            <style>
              @font-face {
                font-family: 'Material Symbols Outlined';
                font-display: swap;
                src: url('/icons/material-symbols/material-symbols-outlined.woff2') format('woff2');
              }
            </style>
            </head>\n <div id="bCursor"> </div>`
        )
        .replace(
            '</html>',
            `<script defer>${helloC}</script>
            <script defer>${cursorData}</script>
            <script defer src="/formula.js"></script>
            </html>`
        )
    res.send(modifiedData)
}
