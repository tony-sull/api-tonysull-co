import type { APIRoute } from 'astro'
import { fetchAll, fetchAllBySchema } from '@api/index.js'
import { ldToString } from '@components/schema.js'
import type { Schema } from '@schemas/index.js'

export async function getStaticPaths() {
    const content = await fetchAll()

    const types = content.reduce((acc, next) => {
        acc.add(next['@type'])
        return acc
    }, new Set<Schema['@type']>())

    return Array.from(types.values())
        .map((type) => ({
            params: { type }
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
    const { type } = params

    if (!type) {
        return new Response(`"type" is required`, { status: 400 })
    }

    const url = new URL(request.url)

    const limit = safeParse(25)(url.searchParams.get('limit'))
    const page = safeParse(1)(url.searchParams.get('page'))

    try {
        const content = await fetchAllBySchema(type as Schema['@type'])

        // TODO: What's the best way to efficiently load a page of unsorted files?
        const pageContent = content.slice((page - 1) * limit, page * limit)

        return new Response(ldToString(pageContent as any, 2), {
            headers: { 'Content-Type': 'application/ld+json' }
        })
    } catch (err: any) {
        return new Response(err, { status: 500 })
    }
}
