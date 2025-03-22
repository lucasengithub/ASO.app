import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';


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



export async function getNotionPage(pageId: string): Promise<string> {
    try {
        const blocks = await notion.blocks.children.list({
            block_id: pageId
        });

        const processedBlocks = await Promise.all(blocks.results.map(async block => {
            // Add this helper function at the top of the file
            function renderRichText(richText: any[]): string {
                return richText.map(textItem => {
                    let content = textItem.plain_text;
                    const annotations = textItem.annotations;
                    
                    // Aplicar formato básico
                    if (annotations.bold) content = `<b>${content}</b>`;
                    if (annotations.italic) content = `<i>${content}</i>`;
                    if (annotations.underline) content = `<u>${content}</u>`;
                    if (annotations.strikethrough) content = `<s>${content}</s>`;
                    
                    if (textItem.href) {
                        content = `<a href="${textItem.href}" target="_blank">${content}</a>`;
                    }

                    const hasColor = annotations.color !== 'default';
                    const hasBackground = annotations.color.endsWith('_background');

                    if (hasColor || hasBackground) {
                        let extra = '';
                        if (hasColor && !hasBackground) {
                            extra = ` class="notion-color-${annotations.color}"`;
                        }
                        if (hasBackground) {
                            const bgColor = annotations.color.replace('_background', '');
                            extra = ` style="background-color: ${bgColor};"`;
                        }
                        return `<span${extra}>${content}</span>`;
                    }
                    return content;
                }).join('');
            }
            
            // Update the paragraph handler
            if ('paragraph' in block) {
                return `<p>${renderRichText(block.paragraph.rich_text)}</p>`;
            }
            
            // Update heading handlers
            if ('heading_1' in block) {
                return `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`;
            }
            if ('heading_2' in block) {
                return `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`;
            }
            if ('heading_3' in block) {
                return `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`;
            }
            
            // Update list items
            if ('bulleted_list_item' in block) {
                return `<li>${renderRichText(block.bulleted_list_item.rich_text)}</li>`;
            }

            if ('numbered_list_item' in block) {
                return `<li>${renderRichText(block.numbered_list_item.rich_text)}</li>`;
            }

            
            // Update to-do items
            if ('to_do' in block) {
                return `<input type="checkbox" ${block.to_do.checked ? 'checked' : ''} disabled>
                        ${renderRichText(block.to_do.rich_text)}`;
            }
            
            // Update quote blocks
            if ('quote' in block) {
                return `<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`;
            }
            

            if ('bookmark' in block) {
                const url = block.bookmark.url;
                return `<div><a href="${url}" target="_blank" style="text-decoration: none;">
                    <button class="bigPost"><h4>Abrir.</h4>\n<p>${url}<p></button></a></div>`;
            }

            // Update code blocks
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

        }));

        return processedBlocks.join('\n');
    } catch (error) {
        console.error('Error fetching page content:', error);
        return '<p>Error loading content</p>';
    }
}