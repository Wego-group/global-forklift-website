import assert from "node:assert/strict";
import test from "node:test";
import { handler } from "./lead.mjs";

const validLead = {
  name: "Test Buyer",
  company: "Test Logistics",
  email: "buyer@example.com",
  phone: "+1 555 0100",
  country: "Chile",
  product: "diesel-35t-classic",
  quantity: "2",
  message: "Please quote CIF Valparaiso.",
  language: "en",
  source_path: "/en/products/diesel-35t-classic/",
  inquiry_type: "product"
};

function event(payload) {
  return {
    httpMethod: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  };
}

test("sends a WxPusher one-to-one message with the configured SPT", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.WXPUSHER_SPT;
  const originalWebhook = process.env.LEAD_WEBHOOK_URL;
  let requestBody;

  process.env.WXPUSHER_SPT = "SPT_test-token";
  delete process.env.LEAD_WEBHOOK_URL;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ code: 1000, msg: "ok", success: true }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };

  try {
    const result = await handler(event(validLead));
    const body = JSON.parse(result.body);

    assert.equal(result.statusCode, 200);
    assert.equal(body.mode, "wxpusher");
    assert.match(body.inquiry_id, /^WG-\d{8}-[A-F0-9]{8}$/);
    assert.equal(requestBody.spt, "SPT_test-token");
    assert.equal(requestBody.contentType, 2);
    assert.equal("sptList" in requestBody, false);
    assert.match(requestBody.content, /Test Buyer/);
    assert.match(requestBody.content, /Please quote CIF Valparaiso/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.WXPUSHER_SPT;
    else process.env.WXPUSHER_SPT = originalToken;
    if (originalWebhook === undefined) delete process.env.LEAD_WEBHOOK_URL;
    else process.env.LEAD_WEBHOOK_URL = originalWebhook;
  }
});

test("does not call the legacy webhook when WxPusher is configured", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.WXPUSHER_SPT;
  const originalWebhook = process.env.LEAD_WEBHOOK_URL;
  const urls = [];

  process.env.WXPUSHER_SPT = "SPT_test-token";
  process.env.LEAD_WEBHOOK_URL = "https://legacy.example.com/lead";
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    return new Response(JSON.stringify({ code: 1000, success: true }), { status: 200 });
  };

  try {
    const result = await handler(event(validLead));
    assert.equal(result.statusCode, 200);
    assert.deepEqual(urls, ["https://wxpusher.zjiecode.com/api/send/message/simple-push"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.WXPUSHER_SPT;
    else process.env.WXPUSHER_SPT = originalToken;
    if (originalWebhook === undefined) delete process.env.LEAD_WEBHOOK_URL;
    else process.env.LEAD_WEBHOOK_URL = originalWebhook;
  }
});

test("rejects incomplete inquiries before calling a delivery provider", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response();
  };

  try {
    const result = await handler(event({ name: "Buyer", message: "Quote please" }));
    assert.equal(result.statusCode, 422);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("escapes customer HTML before creating the WxPusher message", async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.WXPUSHER_SPT;
  const originalWebhook = process.env.LEAD_WEBHOOK_URL;
  let requestBody;

  process.env.WXPUSHER_SPT = "SPT_test-token";
  delete process.env.LEAD_WEBHOOK_URL;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ code: 1000, success: true }), { status: 200 });
  };

  try {
    const result = await handler(event({ ...validLead, message: "<script>alert(1)</script>" }));
    assert.equal(result.statusCode, 200);
    assert.doesNotMatch(requestBody.content, /<script>/);
    assert.match(requestBody.content, /&lt;script&gt;/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.WXPUSHER_SPT;
    else process.env.WXPUSHER_SPT = originalToken;
    if (originalWebhook === undefined) delete process.env.LEAD_WEBHOOK_URL;
    else process.env.LEAD_WEBHOOK_URL = originalWebhook;
  }
});
