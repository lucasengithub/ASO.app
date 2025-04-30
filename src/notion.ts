import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { get } from 'http';
import { title } from 'process';


if (!process.env.NOTION_KEY) {
    throw new Error('NOTION_KEY is not defined in environment variables');
}

if (!process.env.AADM_DATABASE_ID) {
    throw new Error('AADM_DATABASE_ID is not defined in environment variables');
}
if (!process.env.ESCUELA_DATABASE_ID) {
    throw new Error('ESCUELA_DATABASE_ID is not defined in environment variables');
}

if (!process.env.INICIO_DATABASE_ID) {
    throw new Error('INICIO_DATABASE_ID is not defined in environment variables');
}

if (!process.env.WEB_DATABASE_ID) {
    throw new Error('WEB_DATABASE_ID is not defined in environment variables');
}

const notion = new Client({
    auth: process.env.NOTION_KEY
});

export interface AADMItem {
    name: string;
    destino?: string;
    pageId?: string;
    icono?: string;
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
            const iconoProp = properties['Icono'] as { type?: 'rich_text'; rich_text?: Array<{ plain_text: string }> };
            
            return {
                name: nombreProp.title[0]?.plain_text || '',
                destino: destinoProp.url || undefined,
                pageId: destinoProp.url ? undefined : page.id,
                icono: iconoProp?.rich_text?.map(t => t.plain_text).join('') || '',
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
            const iconoProp = properties['Icono'] as { type?: 'rich_text'; rich_text?: Array<{ plain_text: string }> };
            
            return {
                name: nombreProp.title[0]?.plain_text || '',
                destino: destinoProp.url || undefined,
                pageId: destinoProp.url ? undefined : page.id,
                icono: iconoProp?.rich_text?.map(t => t.plain_text).join('') || '',
            };
        });
    } catch (error) {
        console.error('Error fetching Escuela items:', error);
        return [];
    }
}

export async function getHomeItems(): Promise<AADMItem[]> {
    try {
        const response = await notion.databases.query({
            database_id: process.env.INICIO_DATABASE_ID!
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
    }
    catch (error) {
        console.error('Error fetching Home items:', error);
        return [];
    }
}

export async function getWebItems(): Promise<AADMItem[]> {
    try {
        const response = await notion.databases.query({
            database_id: process.env.WEB_DATABASE_ID!
        });

        return response.results.map((page) => {
            const p = page as PageObjectResponse;
            const properties = p.properties;
            
            const nombreProp = properties['Nombre'] as { type: 'title'; title: Array<{ plain_text: string }> };
            
            return {
                name: nombreProp.title[0]?.plain_text || '',
                pageId: page.id,
            };
        });
    } catch (error) {
        console.error('Error fetching Web items:', error);
        return [];
    }
}

function renderRichText(richText: any[]): string {
    return richText.map(textItem => {
        let content = textItem.plain_text;
        const annotations = textItem.annotations;

        // Aplicar formato básico
        if (annotations.bold) content = `<b>${content}</b>`;
        if (annotations.italic) content = `<i>${content}</i>`;
        if (annotations.underline) content = `<u>${content}</u>`;
        if (annotations.strikethrough) content = `<s>${content}</s>`;

        // Enlace
        if (textItem.href) {
            let href = textItem.href;

            // Verificar si el enlace comienza con "/"
            if (href.startsWith('/')) {
                // Ajustar el enlace
                href = `/app/i${href}`;
                // Retornar el enlace sin target="_blank"
                content = `<a href="${href}">${content}</a>`;
            } else {
                // Enlace normal con target="_blank"
                content = `<a href="${href}" target="_blank">${content}</a>`;
            }
        }

        // Manejar colores
        const hasColor = annotations.color !== 'default';
        const hasBackground = annotations.color.endsWith('_background');

        if (hasColor || hasBackground) {
            let style = '';
            if (hasColor && !hasBackground) {
                style = `color: ${annotations.color};`;
            }
            if (hasBackground) {
                const bgColor = annotations.color.replace('_background', '');
                style += `background-color: ${bgColor};`;
            }
            return `<span style="${style}">${content}</span>`;
        }

        return content;
    }).join('');
}

async function processBlock(block: any): Promise<string> {
    if ('paragraph' in block) {
        return `<p>${renderRichText(block.paragraph.rich_text)}</p>`;
    }
    
    if ('heading_1' in block) {
        return `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`;
    }
    if ('heading_2' in block) {
        return `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`;
    }
    if ('heading_3' in block) {
        return `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`;
    }
    
    if ('bulleted_list_item' in block) {
        return `<ul><li>${renderRichText(block.bulleted_list_item.rich_text)}</li></ul>`;
    }

    if ('to_do' in block) {
        return `<input type="checkbox" ${block.to_do.checked ? 'checked' : ''} disabled>
                ${renderRichText(block.to_do.rich_text)}`;
    }
    
    if ('quote' in block) {
        return `<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`;
    }

    if ('bookmark' in block) {
        const url = block.bookmark.url;
        return `<div><a href="${url}" target="_blank" style="text-decoration: none;">
            <button class="bigPost"><h4>Abrir.</h4>\n<p>${url}<p></button></a></div>`;
    }

    if ('code' in block) {
        return `<pre><code>${renderRichText(block.code.rich_text)}</code></pre>`;
    }

    if ('divider' in block) {
        return '<hr>';
    }

    if ('embed' in block) {
        const url = block.embed.url;
        return `<iframe src="${url}" frameborder="0"></iframe>`;
    }

    if ('child_page' in block) {
        return `<a href="/app/i/${block.id}" class="aadm-item" style="text-decoration: none;">
            <p class="childpage"  >${block.child_page.title} <span class="material-symbols-outlined"> arrow_forward </span></p>
        </a>`;
    }

    if ('toggle' in block) {
        // Verificar si los hijos ya están cargados
        let toggleChildren = block.toggle.children;

        // Si no están cargados, obtenerlos desde la API
        if (!toggleChildren) {
            const childrenResponse = await notion.blocks.children.list({
                block_id: block.id,
            });
            toggleChildren = childrenResponse.results;
        }

        // Procesar los hijos del toggle
        const toggleContent = await Promise.all(
            toggleChildren.map(processBlock)
        );

        return `<details>
                    <summary>${renderRichText(block.toggle.rich_text)}</summary>
                    ${toggleContent.join('')}
                </details>`;
    }

    return '';
}


export async function getNotionPage(pageId: string): Promise<{ content: string, pageTitle: string }> {
    try {
        const blocks = await notion.blocks.children.list({
            block_id: pageId
        });

        let isInsideNumberedList = false;

        const processedBlocks = await Promise.all(blocks.results.map(async block => {
            if ('numbered_list_item' in block) {
                const listItem = `<li>${renderRichText(block.numbered_list_item.rich_text)}</li>`;
                if (!isInsideNumberedList) {
                    isInsideNumberedList = true;
                    return `<ol>${listItem}`;
                }
                return listItem;
            } else {
                if (isInsideNumberedList) {
                    isInsideNumberedList = false;
                    return `</ol>${await processBlock(block)}`;
                }
                return await processBlock(block);
            }
        }));

        if (isInsideNumberedList) {
            processedBlocks.push('</ol>');
        }

        // Obtener el título de la página
        const page = await notion.pages.retrieve({ page_id: pageId }) as PageObjectResponse;
        let pageTitle = '';
        
        // Extract title from properties
        if (page.properties && 'title' in page.properties) {
            const titleProp = page.properties.title as { type: 'title'; title: Array<{ plain_text: string }> };
            pageTitle = titleProp.title.map(t => t.plain_text).join('');
        } else {
            // Try to find the title property (it might have a different name)
            for (const key in page.properties) {
                const prop = page.properties[key];
                if (prop.type === 'title') {
                    const titleProp = prop as { type: 'title'; title: Array<{ plain_text: string }> };
                    pageTitle = titleProp.title.map(t => t.plain_text).join('');
                }
            }
        }

        return {
            content: `<div class="notion-page"><h1 class="hTitle">${pageTitle}</h1>${processedBlocks.join('')}</div>`,
            pageTitle: pageTitle
        };

    } catch (error) {
        console.error('Error fetching page content:', error);
        return {
            content: '<p>Error loading content</p>',
            pageTitle: 'Error'
        };
    }
}