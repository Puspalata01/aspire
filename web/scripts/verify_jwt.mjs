import fs from "node:fs";
import { jwtVerify } from "jose";

const token = process.argv[2] ?? fs.readFileSync("/tmp/opencode/lok.json", "utf8");

const raw = token.startsWith("{") ? JSON.parse(token).data?.access_token : token;
if (!raw) {
  console.error("no token");
  process.exit(1);
}

const key = new TextEncoder().encode(process.env.JWT_SECRET);
const { payload } = await jwtVerify(raw, key, { issuer: "aspire" });

const required = ["sub", "email", "role", "permissions", "region_id", "iat", "exp", "iss"];
const missing = required.filter((k) => !(k in payload));
console.log("signature OK; claims =", Object.keys(payload).join(","));
console.log("missing:", missing.length ? missing.join(",") : "none");
console.log("role:", payload.role, "| perms:", JSON.stringify(payload.permissions));
const ttl = payload.exp - payload.iat;
console.log("access ttl (s):", ttl, ttl === 900 ? "= 15min OK" : "UNEXPECTED");
process.exit(missing.length ? 1 : 0);