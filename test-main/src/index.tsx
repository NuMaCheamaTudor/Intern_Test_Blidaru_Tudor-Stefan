// src/index.tsx
import { serve } from "bun";
import { Database } from "bun:sqlite";
import { seedDatabase } from "./seed";
import { computeBitSlow } from "./bitslow";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Get the current file's directory to correctly resolve paths
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const db = new Database(":memory:");

// Create users table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`).run();

function hashPassword(password: string): Promise<string> {
	return globalThis.crypto.subtle
		.digest("SHA-256", new TextEncoder().encode(password))
		.then((hashBuffer: ArrayBuffer) => {
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
		});
}

seedDatabase(db, {
	clientCount: 30,
	bitSlowCount: 20,
	transactionCount: 50,
	clearExisting: true,
});

// Helper CORS
const cors = () => ({
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
});

serve({
	async fetch(req) {
		const url = new URL(req.url);
		const { pathname } = url;
		const method = req.method;

		// CORS preflight
		if (method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: cors()
			});
		}

		// API routes
		if (pathname.startsWith("/api")) {
			// POST /api/register
			if (method === "POST" && pathname === "/api/register") {
				try {
					const body = await req.json();
					const { name, email, password } = body;

					if (!name || !email || !password) {
						return new Response("Missing fields", { status: 400, headers: cors() });
					}

					const hashedPassword = await hashPassword(password);

					try {
						db.query(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`)
							.run(name, email, hashedPassword);
					} catch (err) {
						if (String(err).includes("UNIQUE")) {
							return new Response("Email already registered", { status: 409, headers: cors() });
						}
						throw err;
					}

					return new Response("User registered successfully", { status: 201, headers: cors() });
				} catch (err) {
					console.error("Register error:", err);
					return new Response("Server error", { status: 500, headers: cors() });
				}
			}

			// POST /api/login
			if (method === "POST" && pathname === "/api/login") {
				try {
					const body = await req.json();
					const { email, password } = body;

					const user = db.query("SELECT * FROM users WHERE email = ?").get(email) as {
						id: number;
						name: string;
						email: string;
						password: string;
					};

					if (!user) {
						return new Response("User not found", { status: 404, headers: cors() });
					}

					const hashedInput = await hashPassword(password);
					if (hashedInput !== user.password) {
						return new Response("Invalid password", { status: 401, headers: cors() });
					}

					const { password: _, ...userData } = user;
					return new Response(JSON.stringify(userData), {
						headers: { ...cors(), "Content-Type": "application/json" }
					});
				} catch (err) {
					console.error("Login error:", err);
					return new Response("Server error", { status: 500, headers: cors() });
				}
			}

			// GET /api/transactions
			if (method === "GET" && pathname === "/api/transactions") {
				try {
					const transactions = db.query(`
						SELECT
							t.id,
							t.coin_id,
							t.amount,
							t.transaction_date,
							seller.id as seller_id,
							seller.name as seller_name,
							buyer.id as buyer_id,
							buyer.name as buyer_name,
							c.bit1,
							c.bit2,
							c.bit3,
							c.value
						FROM transactions t
						LEFT JOIN clients seller ON t.seller_id = seller.id
						JOIN clients buyer ON t.buyer_id = buyer.id
						JOIN coins c ON t.coin_id = c.coin_id
						ORDER BY t.transaction_date DESC
					`).all() as any[];

					const enhanced = transactions.map((t) => ({
						...t,
						computedBitSlow: computeBitSlow(t.bit1, t.bit2, t.bit3),
					}));

					return new Response(JSON.stringify(enhanced), {
						headers: { ...cors(), "Content-Type": "application/json" }
					});
				} catch (error) {
					console.error("Error fetching transactions:", error);
					return new Response("Error fetching transactions", {
						status: 500,
						headers: cors()
					});
				}
			}

			// If we reach here, the API endpoint was not found
			return new Response("API endpoint not found", {
				status: 404,
				headers: cors()
			});
		}

		// Static file handling
		try {
			// Determine what file is being requested
			let filePath = pathname === '/' ? '/index.html' : pathname;

			// Try to serve from root directory first
			let file = Bun.file(join(projectRoot, filePath.slice(1)));

			// If file doesn't exist and it's likely a frontend route, serve index.html
			if (!await file.exists() && !filePath.includes('.')) {
				file = Bun.file(join(projectRoot, 'index.html'));
			}

			// If the file exists, serve it
			if (await file.exists()) {
				const contentType = getContentType(filePath);
				return new Response(file, {
					headers: { "Content-Type": contentType }
				});
			}

			// 404 - File not found
			return new Response("File not found", { status: 404 });
		} catch (error) {
			console.error("Error serving file:", error);
			return new Response("Server error", { status: 500 });
		}
	},
	development: true
});

// Determine content type based on file extension
function getContentType(path: string): string {
	const extension = path.split('.').pop()?.toLowerCase() || '';
	const types: Record<string, string> = {
		'html': 'text/html',
		'css': 'text/css',
		'js': 'text/javascript',
		'jsx': 'text/javascript',
		'ts': 'text/javascript',
		'tsx': 'text/javascript',
		'json': 'application/json',
		'png': 'image/png',
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'gif': 'image/gif',
		'svg': 'image/svg+xml',
		'ico': 'image/x-icon'
	};

	return types[extension] || 'text/plain';
}

console.log("🚀 Server running at http://localhost:3000");