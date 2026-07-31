import { createHmac } from "node:crypto";
import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const TEST_ORIGIN = "http://localhost:5173";
const TEST_PRIVATE_KEY = "test-private-key";

describe("ImageKit signature worker", () => {
	it("signs GET /signature with allowed origin", async () => {
		const request = new IncomingRequest(
			"http://localhost:8787/signature",
			{ headers: { Origin: TEST_ORIGIN } },
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(
			request,
			{ ...env, IMAGEKIT_PRIVATE_KEY: TEST_PRIVATE_KEY },
			ctx,
		);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe(TEST_ORIGIN);
		const body = (await response.json()) as {
			token: string;
			expire: number;
			signature: string;
		};
		expect(body.token).toBeTypeOf("string");
		expect(body.expire).toBeGreaterThan(Math.floor(Date.now() / 1000));
		const expected = createHmac("sha1", TEST_PRIVATE_KEY)
			.update(body.token + body.expire)
			.digest("hex");
		expect(body.signature).toBe(expected);
	});

	it("rejects disallowed origin with 403", async () => {
		const request = new IncomingRequest(
			"http://localhost:8787/signature",
			{ headers: { Origin: "https://evil.example" } },
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(
			request,
			{ ...env, IMAGEKIT_PRIVATE_KEY: TEST_PRIVATE_KEY },
			ctx,
		);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(403);
	});

	it("returns 500 when private key is missing", async () => {
		const request = new IncomingRequest(
			"http://localhost:8787/signature",
			{ headers: { Origin: TEST_ORIGIN } },
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(
			request,
			{ ...env, IMAGEKIT_PRIVATE_KEY: undefined },
			ctx,
		);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(500);
	});

	it("handles OPTIONS preflight", async () => {
		const request = new IncomingRequest(
			"http://localhost:8787/signature",
			{
				method: "OPTIONS",
				headers: { Origin: TEST_ORIGIN },
			},
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(204);
		expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
	});

	it("responds via SELF (integration style)", async () => {
		const response = await SELF.fetch("https://example.com/signature", {
			headers: { Origin: TEST_ORIGIN },
		});
		expect(response.status).toBe(200);
	});
});
