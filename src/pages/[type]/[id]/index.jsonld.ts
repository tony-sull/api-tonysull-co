import type { APIRoute } from 'astro'
import { fetchAll, fetchOne } from '../../../api/index.js'
import type { Schema } from '../../../schemas/index.js'
import { MaybeType } from '../../../utils/maybe.js'
import { ldToString } from '../../../components/schema.js'
import { identifierToSlug } from '@utils/slugify.js'

export async function getStaticPaths() {
    const content = await fetchAll()

    return content.map((entry) => ({
        params: {
            type: entry['@type'],
            id: identifierToSlug(entry.identifier)
        }
    }))
}

function safeParse(fallback: number) {
    return (value?: string | null) => {
        if (value === undefined || value === null) {
            return fallback
        }
        try {
            return parseInt(value)
        } catch {
            return fallback
        }
    }
}

export const get: APIRoute = async ({ params, request }): Promise<Response> => {
    const { type, id } = params

    if (!type) {
        return new Response(`"type" is required`, { status: 400 })
    }

    if (!id) {
        return new Response(`"identifier" is required`, { status: 400 })
    }

    const url = new URL(request.url)

    const limit = safeParse(25)(url.searchParams.get('limit'))
    const page = safeParse(1)(url.searchParams.get('page'))

    try {
        const content = await fetchOne(type as Schema['@type'], id.toString())

        if (content.type === MaybeType.Nothing) {
            return new Response('404 not found', { status: 404 })
        }

        if ('@graph' in content.value) {
            content.value['@graph'] = content.value['@graph'].slice(
                (page - 1) * limit,
                page * limit
            )
        }

        return new Response(ldToString(content.value as any), {
            headers: { 'Content-Type': 'application/ld+json' }
        })
    } catch (err: any) {
        return new Response(err, { status: 500 })
    }
}
