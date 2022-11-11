import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { fetchOne } from '@api/index.js'
import type { Schema } from '@schemas/index.js'
import type { Schema as Periodical } from '@schemas/periodical.js'
import { MaybeType } from '@utils/maybe.js'

function isObject(value: unknown): value is Record<string, unknown> {
    return Object.prototype.toString.call(value) === '[object Object]'
}

function stringifyCustomData(data: Record<string, unknown>): string {
    return Object.entries(data)
        .filter(([key, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `<${key}>${isObject(value) ? stringifyCustomData(value) : value}</${key}>`)
        .join('')
}

export const get: APIRoute = async ({ params, request }) => {
    const { schema, id } = params

    if (!schema) {
        return new Response(`"schema" is required`, { status: 400 })
    }

    if (!id) {
        return new Response(`"identifier" is required`, { status: 400 })
    }

    if (schema !== 'Periodical') {
        return new Response('404 not found', { status: 404 })
    }

    try {
        const content = await fetchOne(schema as Schema['@type'], id.toString())

        if (content.type === MaybeType.Nothing) {
            return new Response('404 not found', { status: 404 })
        }

        const periodical = content.value as Periodical

        const [pubDate] = periodical['@graph']
            .map(
                ({ datePublished, dateModified }) =>
                    dateModified || datePublished
            )
            .filter((date) => !!date)
            .sort((a, b) => b!.getDate() - a!.getDate())

        return rss({
            title: periodical.name,
            description: periodical.description,
            site: import.meta.env.SITE,
            items: periodical['@graph']
                .filter(({ datePublished }) => !!datePublished)
                .map((article) => ({
                    link: article.url,
                    title: article.name,
                    description: article.description,
                    pubDate: article.datePublished!,
                    customData: stringifyCustomData({
                        author: article.author?.email,
                        guid: article.identifier
                    })
                })),
            customData: stringifyCustomData({
                pubDate: pubDate?.toUTCString(),
                copywright: `© ${new Date().getFullYear()}. All rights reserved.`,
                generator: 'Flow CMS',
                image: periodical.image?.contentUrl && {
                    link: import.meta.env.SITE,
                    title: periodical.name,
                    description: periodical.description,
                    url: periodical.image?.contentUrl
                },
                lastBuildDate: new Date().toUTCString(),
                link: new URL(
                    new URL(request.url).pathname,
                    import.meta.env.SITE
                )
            })
        })
    } catch (err: any) {
        return new Response(err, { status: 500 })
    }
}
