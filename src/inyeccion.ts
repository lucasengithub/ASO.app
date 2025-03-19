import { Response } from 'express';
import { barData, cursorData, preventBack, topData } from './navbar'

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
            `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward" /> \n<link rel="stylesheet" href="/aso.css">  \n <link rel="manifest" href="/manifest.json" crossorigin="use-credentials">\n  <meta name="apple-mobile-web-app-status-bar" content="#aa7700"> \n <meta name="theme-color" content="white">  \n</head>\n <div id="bCursor"> </div>`
        )
        .replace(
            '</html>',
            ` <script>${cursorData}</script> \n <script src="/formula.js"></script>  \n </html>`
        )
    res.send(modifiedData)
}
