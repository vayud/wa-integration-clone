require("dotenv").config();
const express = require("express");
const request = require("request-promise-native");
const NodeCache = require("node-cache");
const session = require("express-session");
const opn = require("open");
const mysql = require("mysql2/promise");
const app = express();

const PORT = 3000;

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
	throw new Error("Missing CLIENT_ID or CLIENT_SECRET environment variable.");
}

//===========================================================================//
//  HUBSPOT APP CONFIGURATION
//
//  All the following values must match configuration settings in your app.
//  They will be used to build the OAuth URL, which users visit to begin
//  installing. If they don't match your app's configuration, users will
//  see an error page.

// Replace the following with the values from your app auth config,
// or set them as environment variables before running.
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Scopes for this app will default to `crm.objects.contacts.read`
// To request others, set the SCOPE environment variable instead
let SCOPES = ["crm.objects.contacts.read"];
if (process.env.SCOPE) {
	// Accept comma, space, or URL-encoded space as separators
	SCOPES = process.env.SCOPE.split(/,| |%20/).map(s => s.trim()).filter(Boolean);
}

let OPTIONAL_SCOPES = [];
if (process.env.OPTIONAL_SCOPE) {
	OPTIONAL_SCOPES = process.env.OPTIONAL_SCOPE.split(/,| |%20/).map(s => s.trim()).filter(Boolean);
}

// On successful install, users will be redirected to /oauth
const REDIRECT_URI = `http://localhost:${PORT}/oauth`;

//===========================================================================//

// Use a session to keep track of client ID
app.use(
	session({
		secret: Math.random().toString(36).substring(2),
		resave: false,
		saveUninitialized: true,
	})
);

// MySQL connection pool
const db = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "wa-integration",
});

// Store tokens in DB
async function storeTokens(userId, installCode, refreshToken, accessToken) {
	await db.execute(
		`INSERT INTO app_installs (hub_portal_id, install_code, refresh_token, access_token, last_installed) VALUES (?, ?, ?, ?, current_timestamp()) ON DUPLICATE KEY UPDATE refresh_token = VALUES (refresh_token), access_token = VALUES(access_token), last_installed = current_timestamp()`,
		[userId, installCode, refreshToken, accessToken]
	);
}

// Get tokens from DB
async function getTokens(userId) {
	const [rows] = await db.execute(
		`SELECT refresh_token, access_token FROM app_installs WHERE hub_portal_id = ? AND status = 'Active' ORDER BY last_installed DESC LIMIT 1`,
		[userId]
	);
	return rows[0] || null;
}

//================================//
//   Running the OAuth 2.0 Flow   //
//================================//

// Step 1
// Build the authorization URL to redirect a user
// to when they choose to install the app
const authUrl =
	"https://app.hubspot.com/oauth/authorize" +
	`?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
	`&scope=${encodeURIComponent(SCOPES.join(" "))}` + // scopes being requested by the app
	`&optional_scope=${encodeURIComponent(OPTIONAL_SCOPES.join(" "))}` + // scopes being requested by the app
	`&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page

// Redirect the user from the installation page to
// the authorization URL
app.get("/install", (req, res) => {
	console.log("");
	console.log("=== Initiating OAuth 2.0 flow with HubSpot ===");
	console.log("");
	console.log("===> Step 1: Redirecting user to your app's OAuth URL");
	res.redirect(authUrl);
	console.log("===> Step 2: User is being prompted for consent by HubSpot");
});

// Step 2
// The user is prompted to give the app access to the requested
// resources. This is all done by HubSpot, so no work is necessary
// on the app's end

// Step 3
// Receive the authorization code from the OAuth 2.0 Server,
// and process it based on the query parameters that are passed
app.get("/oauth", async (req, res) => {
	console.log("===> Step 3: Handling the request sent by the server");

	// Received a user authorization code, so now combine that with the other
	// required values and exchange both for an access token and a refresh token
	if (req.query.code) {
		console.log("       > Received an authorization token");

		const authCodeProof = {
			grant_type: "authorization_code",
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			redirect_uri: REDIRECT_URI,
			code: req.query.code,
		};

		// Step 4
		// Exchange the authorization code for an access token and refresh token
		console.log("===> Step 4: Exchanging authorization code for an access token and refresh token");
		const token = await exchangeForTokens(req.sessionID, authCodeProof);
		if (token.message) {
			return res.redirect(`/error?msg=${token.message}`);
		}

		// Once the tokens have been retrieved, use them to make a query
		// to the HubSpot API
		res.redirect(`/`);
	}
});

//==========================================//
//   Exchanging Proof for an Access Token   //
//==========================================//

const exchangeForTokens = async (userId, exchangeProof) => {
	try {
		const responseBody = await request.post("https://api.hubapi.com/oauth/v1/token", {
			form: exchangeProof,
		});
		const tokens = JSON.parse(responseBody);
		refreshTokenStore[userId] = tokens.refresh_token;
		accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));
		// Store in DB (use install_code as code for this session)
		await storeTokens(userId, exchangeProof.code || "", tokens.refresh_token, tokens.access_token);
		console.log("       > Received an access token and refresh token");
		return tokens.access_token;
	} catch (e) {
		console.error(`       > Error exchanging ${exchangeProof.grant_type} for access token`);
		return JSON.parse(e.response.body);
	}
};

const refreshAccessToken = async (userId) => {
	// Try to get refresh token from DB if not in memory
	if (!refreshTokenStore[userId]) {
		const dbTokens = await getTokens(userId);
		if (dbTokens) refreshTokenStore[userId] = dbTokens.refresh_token;
	}
	const refreshTokenProof = {
		grant_type: "refresh_token",
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		redirect_uri: REDIRECT_URI,
		refresh_token: refreshTokenStore[userId],
	};
	return await exchangeForTokens(userId, refreshTokenProof);
};

const getAccessToken = async (userId) => {
	// If the access token has expired, retrieve a new one using the refresh token
	if (!accessTokenCache.get(userId)) {
		// Try to get access token from DB if not in memory
		const dbTokens = await getTokens(userId);
		if (dbTokens) accessTokenCache.set(userId, dbTokens.access_token);
		if (!accessTokenCache.get(userId)) {
			console.log("Refreshing expired access token");
			await refreshAccessToken(userId);
		}
	}
	return accessTokenCache.get(userId);
};

const isAuthorized = (userId) => {
	// Check in-memory first, then DB
	if (refreshTokenStore[userId]) return true;
	return false; // Optionally, could check DB for token existence
};

//========================================//
//   Displaying information to the user   //
//========================================//

app.get("/", async (req, res) => {
	res.setHeader("Content-Type", "text/html");
	res.write(`<h2>HubSpot OAuth 2.0 Quickstart App</h2>`);
	if (isAuthorized(req.sessionID)) {
		const accessToken = await getAccessToken(req.sessionID);
		res.write(`<h4>Access token: ${accessToken}</h4>`);
	} else {
		res.write(`<a href="/install"><h3>Install the app</h3></a>`);
	}
	res.end();
});

app.get("/error", (req, res) => {
	res.setHeader("Content-Type", "text/html");
	res.write(`<h4>Error: ${req.query.msg}</h4>`);
	res.end();
});

app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));

opn.default(`http://localhost:${PORT}`);
