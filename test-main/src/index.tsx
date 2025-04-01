import { serve } from "bun";
import { Database } from "bun:sqlite";
import { seedDatabase } from "./seed";
import { computeBitSlow } from "./bitslow";
import { readFile } from "fs/promises";
import path from "path";

const db = new Database(":memory:");

// Creăm tabela de users dacă nu există deja
const createUsersTable = () => {
	db.query(`
		CREATE TABLE IF NOT EXISTS users (
											 id INTEGER PRIMARY KEY AUTOINCREMENT,
											 name TEXT NOT NULL,
											 email TEXT NOT NULL UNIQUE,
											 password TEXT NOT NULL
		)
	`).run();
};

// Funcție de hash pentru parole
function hashPassword(password: string): Promise<string> {
	return globalThis.crypto.subtle
		.digest("SHA-256", new TextEncoder().encode(password))
		.then((hashBuffer: ArrayBuffer) => {
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
		});
}

createUsersTable();
seedDatabase(db, {
	clientCount: 30,
	bitSlowCount: 20,
	transactionCount: 50,
	clearExisting: true,
});

const server = serve({
	async fetch(req) {
		const url = new URL(req.url);
		const { pathname } = url;
		const { method } = req;

		// 🛡️ CORS preflight
		if (method === "OPTIONS" && pathname === "/api/register") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type"
				}
			});
		}

		// ✍️ POST /api/register
		if (method === "POST" && pathname === "/api/register") {
			try {
				let body = {};
				try {
					body = await req.json();
				} catch (err) {
					return new Response("Invalid JSON input", {
						status: 400,
						headers: { "Access-Control-Allow-Origin": "*" }
					});
				}

				const { name, email, password } = body as {
					name: string;
					email: string;
					password: string;
				};

				if (!name || !email || !password) {
					return new Response("Missing fields", {
						status: 400,
						headers: { "Access-Control-Allow-Origin": "*" }
					});
				}

				const hashedPassword = await hashPassword(password);

				try {
					db.query(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`)
						.run(name, email, hashedPassword);
				} catch (err) {
					if (String(err).includes("UNIQUE")) {
						return new Response("Email already registered", {
							status: 409,
							headers: { "Access-Control-Allow-Origin": "*" }
						});
					}
					throw err;
				}

				return new Response("User registered successfully", {
					status: 201,
					headers: { "Access-Control-Allow-Origin": "*" }
				});
			} catch (e) {
				console.error("Register error:", e);
				return new Response("Server error", {
					status: 500,
					headers: { "Access-Control-Allow-Origin": "*" }
				});
			}
		}

		// 📥 GET /api/transactions
		if (pathname === "/api/transactions") {
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
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*"
					}
				});
			} catch (error) {
				console.error("Error fetching transactions:", error);
				return new Response("Error fetching transactions", {
					status: 500,
					headers: { "Access-Control-Allow-Origin": "*" }
				});
			}
		}

		// 🖼️ Fallback: frontend
		const html = await Bun.file("index.html").text();
		return new Response(html, {
			headers: { "Content-Type": "text/html" }
		});
	},

	development: true,
});

console.log(`🚀 Server running at ${server.url}`);