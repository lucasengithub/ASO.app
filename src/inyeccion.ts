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
            `<link rel="icon" type="image/png" href="/icons/192.png" /> \n <link rel="stylesheet" href="/aso.css">  \n <link rel="manifest" href="/manifest.json" crossorigin="use-credentials">\n  <meta name="theme-color" content="white"> \n</head>\n <div id="bCursor"> </div>`
        )
        .replace(
            '</html>',
            `<script>${helloC}</script> \n <script>${cursorData}</script> \n <script src="/formula.js"></script>  \n </html>`
        )
    res.send(modifiedData)
}
