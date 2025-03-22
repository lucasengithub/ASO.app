import { parseStringPromise } from 'xml2js'

export async function getRSSFeedHTML(): Promise<string> {
    try {
        // Agrega un parámetro para evitar cache
        const url = process.env.URL_ASO_FEED + `?cb=${Date.now()}`;
        const response = await fetch(url);
        const str = await response.text();
        const parsed = await parseStringPromise(str);
        let html = "";
        const items = parsed.rss.channel[0].item;
        items.forEach((item: any) => {
            const title = item.title[0];
            const link = item.link[0];
            const description = item.description[0];
            html += `<div><a href="${link}" target="_blank" style="text-decoration: none;"><button class="bigPost"><h4>${title}</h4>\n<p>${description}<p></button></a></div>`;
        });
        return html;
    } catch (err) {
        console.error("Error al cargar el feed RSS:", err);
        return "No se pudo cargar el feed RSS.";
    }
}

export async function getESDRSSFeedHTML(): Promise<string> {
    try {
        const response = await fetch(process.env.URL_ESD_FEED as string);
        const str = await response.text();
        const parsed = await parseStringPromise(str);
        let html = "";
        const items = parsed.rss.channel[0].item;
        items.forEach((item: any) => {
            const title = item.title[0];
            const badLink = item.link[0];
            const link = badLink.replace('https://admin-dev.esdmadrid.es/', 'https://esdmadrid.es/posts/');
            html += `<div><a href="${link}" target="_blank" style="text-decoration: none;"><button class="squarePost"></img>${title}</button></a></div>`;
        });
        return html;
    } catch (err) {
        console.error("Error al cargar el feed ESD:", err);
        return "No se pudo cargar el feed ESD.";
    }
}