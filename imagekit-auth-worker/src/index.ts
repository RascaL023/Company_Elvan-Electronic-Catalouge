/**
 * ImageKit Signature Worker
 *
 * Issues short-lived upload signatures for ImageKit client-side uploads.
 * Contract: GET /signature -> { token, expire, signature }
 *
 * The FE only depends on this URL. If this logic ever moves to another
 * backend (e.g. a VPS), keep the same contract so the FE stays untouched.
 */

import { createHmac, randomUUID } from 'node:crypto';

const SIGNATURE_TTL_SECONDS = 1800;
const DEFAULT_ALLOWED_ORIGINS = 'http://localhost:5173';

type WorkerEnv = Env & {
	IMAGEKIT_PRIVATE_KEY?: string;
	ALLOWED_ORIGINS?: string;
};

function isAllowedOrigin(origin: string | null, env: WorkerEnv): boolean {
	if (!origin) {
		return false;
	}
	const raw = env.ALLOWED_ORIGINS ?? DEFAULT_ALLOWED_ORIGINS;
	const allowed = raw
		.split(',')
		.map((o) => o.trim())
		.filter(Boolean);
	return allowed.includes(origin);
}

function corsHeaders(origin: string | null): Record<string, string> {
	const headers: Record<string, string> = {
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Max-Age': '86400',
	};
	if (origin) {
		headers['Access-Control-Allow-Origin'] = origin;
		headers['Vary'] = 'Origin';
	}
	return headers;
}

function sign(token: string, expire: string, privateKey: string): string {
	return createHmac('sha1', privateKey).update(token + expire).digest('hex');
}

function json(data: unknown, status: number, headers: Record<string, string>): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...headers },
	});
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const origin = request.headers.get('Origin');
		const headers = corsHeaders(origin);

		if (request.method === 'OPTIONS') {
			if (origin && !isAllowedOrigin(origin, env)) {
				return new Response(null, { status: 403, headers });
			}
			return new Response(null, { status: 204, headers });
		}

		if (request.method !== 'GET' || url.pathname !== '/signature') {
			return json({ error: 'Not found' }, 404, headers);
		}

		if (!isAllowedOrigin(origin, env)) {
			return json({ error: 'Origin not allowed' }, 403, headers);
		}

		const privateKey = env.IMAGEKIT_PRIVATE_KEY;
		if (!privateKey) {
			return json({ error: 'IMAGEKIT_PRIVATE_KEY is not configured' }, 500, headers);
		}

		const token = randomUUID();
		const expire = Math.floor(Date.now() / 1000) + SIGNATURE_TTL_SECONDS;
		const signature = sign(token, String(expire), privateKey);

		return json({ token, expire, signature }, 200, headers);
	},
} satisfies ExportedHandler<WorkerEnv>;
