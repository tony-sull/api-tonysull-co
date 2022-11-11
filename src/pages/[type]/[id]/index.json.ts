import type { APIRoute } from 'astro'
import { get as jsonld } from './index.jsonld.js'

export const get: APIRoute = jsonld
