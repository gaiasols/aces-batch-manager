import { html } from "hono/html";
import { FC } from "hono/jsx";

export const Layout: FC = (props) => {
	const title = props.title || 'Aces Batch Manager';
	const refresh = props.refresh;
	return (
		<html>
			<head>
				<title>{title}</title>
				{props.refresh != undefined && <meta http-equiv="refresh" content={props.refresh} />}
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link href="/styles.css" rel="stylesheet" />
				<script
					src="https://unpkg.com/htmx.org@1.9.10"
					integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC"
					crossorigin="anonymous"
				></script>
				<script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
			</head>
			<body class="antialiased">
				<div class="min-h-screen px-4 sm:px-5 pb-60">
					<Mainmenu />
					<div class="max-w-2xl mx-auto">{props.children}</div>
				</div>
			</body>
		</html>
	);
};

export const XLayout: FC = (props) => {
	return (
		<html>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script
					src="https://unpkg.com/htmx.org@1.9.10"
					integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC"
					crossorigin="anonymous"
				></script>
				<script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
				<link href="/styles.css" rel="stylesheet" />
			</head>
			<body class="antialiased">
				<div class="w-full h-full flex items-center justify-center bg-stone-100 border-8 border-white">
					<div class="flex-grow max-w-lg p-6">
						<div class="rounded-lg bg-white px-8 pt-7 pb-6">
							<div class="flex items-center gap-3 mb-6">
								<div class="w-16">
									<ABM />
								</div>
								<div class="flex flex-col">
									<p class="text-stone-400 font-bold leading-none">Aces Batch</p>
									<p class="text-3xl font-bold leading-none tracking--wide">Manager</p>
								</div>
							</div>
							<p class="text-xl font-bold mb-5">Lorem ipsum dolor sis amet.</p>
							{/* <LoginForm /> */}
							{props.children}
						</div>
					</div>
				</div>
				{html`<script>
					document.body.addEventListener('login-ok', function (evt) {
						document.location = '/orgs';
					});
					const changeEvent = (event) => {
						const msg = document.getElementById('msg');
						if (msg) msg.innerText = '';
					};
				</script>`}
			</body>
		</html>
	);
}

const Mainmenu = () => (
	<div class="bg-stone-50 border-b border-stone-400/50 py-4 -mx-4 sm:-mx-5 px-4 sm:px-5">
		<div class="max-w-2xl mx-auto flex gap-4 text-sm text-stone-600 font-medium uppercase">
			<a href="/">Home</a>
			<a href="/orgs">Orgs</a>
			<a href="/batches">Batches</a>
			<a href="/modules">Modules</a>
			<a href="/assessors">Assessors</a>
		</div>
	</div>
);

const ABM = () => (
	<svg viewBox="0 0 420 375">
		<title>Cloudflare Workers logo (horizontal combination mark)</title>
		<defs>
			<linearGradient id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-a" x1="50%" x2="25.7%" y1="100%" y2="8.7%">
				<stop offset="0%" stop-color="#eb6f07"></stop>
				<stop offset="100%" stop-color="#fab743"></stop>
			</linearGradient>
			<linearGradient id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-b" x1="81%" x2="40.5%" y1="83.7%" y2="29.5%">
				<stop offset="0%" stop-color="#d96504"></stop>
				<stop offset="100%" stop-color="#d96504" stop-opacity="0"></stop>
			</linearGradient>
			<linearGradient id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-c" x1="42%" x2="84%" y1="8.7%" y2="79.9%">
				<stop offset="0%" stop-color="#eb6f07"></stop>
				<stop offset="100%" stop-color="#eb720a" stop-opacity="0"></stop>
			</linearGradient>
			<linearGradient id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-d" x1="50%" x2="25.7%" y1="100%" y2="8.7%">
				<stop offset="0%" stop-color="#ee6f05"></stop>
				<stop offset="100%" stop-color="#fab743"></stop>
			</linearGradient>
			<linearGradient id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-e" x1="-33.2%" x2="91.7%" y1="100%" y2="0%">
				<stop offset="0%" stop-color="#d96504" stop-opacity=".8"></stop>
				<stop offset="49.8%" stop-color="#d96504" stop-opacity=".2"></stop>
				<stop offset="100%" stop-color="#d96504" stop-opacity="0"></stop>
			</linearGradient>
			<linearGradient id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-f" x1="50%" x2="25.7%" y1="100%" y2="8.7%">
				<stop offset="0%" stop-color="#ffa95f"></stop>
				<stop offset="100%" stop-color="#ffebc8"></stop>
			</linearGradient>
			<linearGradient id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-g" x1="8.1%" x2="96.5%" y1="1.1%" y2="48.8%">
				<stop offset="0%" stop-color="#fff" stop-opacity=".5"></stop>
				<stop offset="100%" stop-color="#fff" stop-opacity=".1"></stop>
			</linearGradient>
			<linearGradient id="CloudflareWorkersLogoCombinationMarkHorizontal--gradient-h" x1="-13.7%" y1="104.2%" y2="46.2%">
				<stop offset="0%" stop-color="#fff" stop-opacity=".5"></stop>
				<stop offset="100%" stop-color="#fff" stop-opacity=".1"></stop>
			</linearGradient>
		</defs>
		<path
			fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-a)"
			d="M107 5.4l49 88.4-45 81a26 26 0 0 0 0 25.3l45 81.2-49 88.4A52 52 0 0 1 85 349L7 213.5a52.2 52.2 0 0 1 0-52L85 26a52 52 0 0 1 22-20.6z"
		></path>
		<path
			fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-b)"
			d="M111 174.9a26 26 0 0 0 0 25.2l45 81.2-49 88.4A52 52 0 0 1 85 349L7 213.5C.8 202.8 35.5 190 111 175z"
			opacity=".7"
		></path>
		<path
			fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-c)"
			d="M112 14.3l44 79.5-7.3 12.7-38.8-65.7C98.7 22.5 81.6 32 60.2 69l3.2-5.5L85 26a52 52 0 0 1 21.8-20.6l5.1 8.9z"
			opacity=".5"
		></path>
		<path
			fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-d)"
			d="M331 26l78 135.5c9.3 16 9.3 36 0 52L331 349a52 52 0 0 1-45 26h-78l97-174.9a26 26 0 0 0 0-25.2L208 0h78a52 52 0 0 1 45 26z"
		></path>
		<path
			fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-e)"
			d="M282 374.4l-77 .7 93.2-175.8a27 27 0 0 0 0-25.4L205 0h17.6l97.8 173.1a27 27 0 0 1-.1 26.8 15624 15624 0 0 0-62.7 110c-19 33.4-10.8 54.9 24.4 64.5z"
		></path>
		<path
			fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-f)"
			d="M130 375c-8 0-16-1.9-23-5.3l96.2-173.5c3-5.4 3-12 0-17.4L107 5.4A52 52 0 0 1 130 0h78l97 174.9a26 26 0 0 1 0 25.2L208 375h-78z"
		></path>
		<path
			fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-g)"
			d="M298.2 178.8L199 0h9l97 174.9a26 26 0 0 1 0 25.2L208 375h-9l99.2-178.8c3-5.4 3-12 0-17.4z"
			opacity=".6"
		></path>
		<path
			fill="url(#CloudflareWorkersLogoCombinationMarkHorizontal--gradient-h)"
			d="M203.2 178.8L107 5.4c3-1.6 6.6-2.8 10-3.8 21.2 38.1 52.5 95.9 94 173.3a26 26 0 0 1 0 25.2L115.5 373c-3.4-1-5.2-1.7-8.4-3.2l96-173.5c3-5.4 3-12 0-17.4z"
			opacity=".6"
		></path>
	</svg>
);
