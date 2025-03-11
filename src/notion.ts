import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

// Eliminar la importación existente de node-fetch y reemplazarla con una declaración
declare const fetch: any;

if (!process.env.NOTION_KEY) {
    throw new Error('NOTION_KEY is not defined in environment variables');
}

if (!process.env.AADM_DATABASE_ID) {
    throw new Error('AADM_DATABASE_ID is not defined in environment variables');
}

const notion = new Client({
    auth: process.env.NOTION_KEY
});

export interface AADMItem {
    name: string;
    destino?: string;
    pageId?: string;
}

export async function getAADMItems(): Promise<AADMItem[]> {
    try {
        const response = await notion.databases.query({
            database_id: process.env.AADM_DATABASE_ID!
        });

        return response.results.map((page) => {
            const p = page as PageObjectResponse;
            const properties = p.properties;
            
            const nombreProp = properties['Nombre'] as { type: 'title'; title: Array<{ plain_text: string }> };
            const destinoProp = properties['Destino'] as { type: 'url'; url: string | null };
            
            return {
                name: nombreProp.title[0]?.plain_text || '',
                destino: destinoProp.url || undefined,
                pageId: destinoProp.url ? undefined : page.id
            };
        });
    } catch (error) {
        console.error('Error fetching AADM items:', error);
        return [];
    }
}

export async function getEscuelaItems(): Promise<AADMItem[]> {
    try {
        const response = await notion.databases.query({
            database_id: process.env.ESCUELA_DATABASE_ID!
        });

        return response.results.map((page) => {
            const p = page as PageObjectResponse;
            const properties = p.properties;
            
            const nombreProp = properties['Nombre'] as { type: 'title'; title: Array<{ plain_text: string }> };
            const destinoProp = properties['Destino'] as { type: 'url'; url: string | null };
            
            return {
                name: nombreProp.title[0]?.plain_text || '',
                destino: destinoProp.url || undefined,
                pageId: destinoProp.url ? undefined : page.id
            };
        });
    } catch (error) {
        console.error('Error fetching Escuela items:', error);
        return [];
    }
}

async function getWebsiteTitle(url: string): Promise<string> {
    try {
        const nodeFetch = await import('node-fetch');
        const fetch = nodeFetch.default;
        const response = await fetch(url);
        const html = await response.text();
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        return titleMatch ? titleMatch[1] : url;
    } catch (error) {
        console.error('Error fetching website title:', error);
        return url;
    }
}

async function getTableItems(blockId: string): Promise<string> {
    try {
        const response = await notion.databases.query({
            database_id: blockId
        });

        const items = response.results.map((page) => {
            const p = page as PageObjectResponse;
            const properties = p.properties;
            
            // Asumimos que todas las tablas tienen una columna 'Nombre'
            const nombreProp = properties['Nombre'] as { type: 'title'; title: Array<{ plain_text: string }> };
            const destinoProp = properties['Destino'] as { type: 'url'; url: string | null };
            
            return {
                name: nombreProp.title[0]?.plain_text || '',
                destino: destinoProp.url || undefined,
                pageId: destinoProp.url ? undefined : page.id
            };
        });

        const itemsHtml = items.map(item => {
            if (item.destino) {
                return `<a href="${item.destino}" target="_blank"><button class="bigaso">${item.name}</button></a>`;
            } else if (item.pageId) {
                return `<a href="/app/${item.pageId}" class="aadm-item"><button class="bigaso">${item.name}</button></a>`;
            }
            return '';
        }).join('\n');

        return `<div class="notion-content">${itemsHtml}</div>`;
    } catch (error) {
        console.error('Error fetching table items:', error);
        return '';
    }
}

export async function getNotionPage(pageId: string): Promise<string> {
    try {
        const blocks = await notion.blocks.children.list({
            block_id: pageId
        });

        const processedBlocks = await Promise.all(blocks.results.map(async block => {
            if ('paragraph' in block) {
                return `<p>${block.paragraph.rich_text.map(t => t.plain_text).join('')}</p>`;
            }
            if ('heading_1' in block) {
                return `<h1>${block.heading_1.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')}</h1>`;
            }
            if ('heading_2' in block) {
                return `<h2>${block.heading_2.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')}</h2>`;
            }
            if ('heading_3' in block) {
                return `<h3>${block.heading_3.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')}</h3>`;
            }
            if ('bulleted_list_item' in block) {
                return `<li>${block.bulleted_list_item.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')}</li>`;
            }
            if ('numbered_list_item' in block) { 
                return '';
            }
            if ('to_do' in block) {
                return `<input type="checkbox" ${block.to_do.checked ? 'checked' : ''} disabled>${block.to_do.rich_text[0].plain_text}`;
            }
            if ('image' in block) {
                const imageUrl = block.image.type === 'file' ? block.image.file.url : block.image.external.url;
                return `<img class="notionpic" src="${imageUrl}" alt="${block.image.caption[0]?.plain_text || ''}">`;
            }
            if ('bookmark' in block) {
                const title = await getWebsiteTitle(block.bookmark.url);
                return `<a href="${block.bookmark.url}" target="_blank"><button class="bookmark"><i>${title}</i><b>Abrir.<b></button></a>`;
            }
            if ('quote' in block) {
                return `<blockquote>${block.quote.rich_text[0].plain_text}</blockquote>`;
            }
            if ('code' in block) {
                return `<pre><code>${block.code.rich_text}</code></pre>`;
            }

            if ('divider' in block) {
                return '<hr>';
            }

            if ('child_page' in block) {
                return `<a href="/app/aadm/${block.id}" class="aadm-item">
                    <button class="bigaso">${block.child_page.title}</button>
                </a>`;
            }

            if ('child_database' in block) {
                return await getTableItems(block.id);
            }
        }));

        return processedBlocks.join('\n');
    } catch (error) {
        console.error('Error fetching page content:', error);
        return '<p>Error loading content</p>';
    }
}