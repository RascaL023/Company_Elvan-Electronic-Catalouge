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
const IMAGEKIT_API_BASE = 'https://api.imagekit.io/v1';
const MAX_BATCH_DELETE = 100;

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
		'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
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

function basicAuthHeader(privateKey: string): string {
	return `Basic ${btoa(`${privateKey}:`)}`;
}

/**
 * Deletes the given ImageKit fileIds via ImageKit's batch delete-by-fileIds API.
 * Returns the number of files successfully deleted.
 */
async function deleteImageKitFiles(
	env: WorkerEnv,
	fileIds: string[]
): Promise<{ deleted: number; failed: string[] }> {
	const privateKey = env.IMAGEKIT_PRIVATE_KEY;
	if (!privateKey) {
		throw new Error('IMAGEKIT_PRIVATE_KEY is not configured');
	}
	const failed: string[] = [];
	let deleted = 0;

	// ImageKit batch delete accepts up to 100 fileIds per request.
	const chunks: string[][] = [];
	for (let i = 0; i < fileIds.length; i += MAX_BATCH_DELETE) {
		chunks.push(fileIds.slice(i, i + MAX_BATCH_DELETE));
	}

	for (const chunk of chunks) {
		const res = await fetch(`${IMAGEKIT_API_BASE}/files/batch/deleteByFileIds`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: basicAuthHeader(privateKey),
			},
			body: JSON.stringify({ fileIds: chunk }),
		});
		if (!res.ok) {
			failed.push(...chunk);
			continue;
		}
		const data = (await res.json()) as { success?: string[] } | null;
		const ok = new Set((data !== null ? data.success : undefined) ?? chunk);
		deleted += chunk.filter((id) => ok.has(id)).length;
		failed.push(...chunk.filter((id) => !ok.has(id)));
	}

	return { deleted, failed };
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

		if (request.method === 'DELETE' && url.pathname === '/files') {
			if (!isAllowedOrigin(origin, env)) {
				return json({ error: 'Origin not allowed' }, 403, headers);
			}
			let fileIds: string[];
			try {
				const body = (await request.json()) as { fileIds?: unknown };
				if (!Array.isArray(body.fileIds)) {
					throw new Error('fileIds must be an array');
				}
				fileIds = body.fileIds.filter(
					(id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 200
				);
			} catch (err) {
				return json({ error: 'Invalid request body' }, 400, headers);
			}
			if (fileIds.length === 0) {
				return json({ error: 'fileIds must be a non-empty array' }, 400, headers);
			}
			try {
				const { deleted, failed } = await deleteImageKitFiles(env, fileIds);
				return json({ deleted, failed }, 200, headers);
			} catch (err) {
				return json(
					{ error: err instanceof Error ? err.message : 'Delete failed' },
					500,
					headers
				);
			}
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
