import { html } from "hono/html";

export const Pojo = (props: { obj: any }) => (
	<pre class="max-h-64 bg-yellow-200/30 text-[12px] text-red-500 leading-4 overflow-x-auto my-5">{JSON.stringify(props.obj, null, 2)}</pre>
);

export const LoginForm = (props: { username?: string; password?: string }) => (
	<div>
		<form hx-post="/login" hx-target="closest div" class="max-w-sm mb-6">
			<table class="w-full">
				<tr>
					<td width="26%" class="pr-4 pb-3">
						Username:
					</td>
					<td class="pb-3">
						<input class="w-full" type="text" name="username" placeholder="Your username" value={props.username} />
					</td>
				</tr>
				<tr>
					<td class="pr-4 pb-3">Password:</td>
					<td class="pb-3">
						<input class="w-full" type="password" name="password" placeholder="Your password" value={props.password} />
					</td>
				</tr>
				<tr>
					<td></td>
					<td>
						<button class="button w-full h-12">Submit</button>
					</td>
				</tr>
			</table>
		</form>
		<p id="msg" class="h5 text-sm text-orange-600">
			{props.username != undefined && '🤬 Username dan/atau password salah'}
		</p>
	</div>
);

export const TableOrgs = (props: { orgs: any[] }) => (
	<div>
		<table class="w-full border-t border-stone-400">
			<tbody>
				{props.orgs.map((o: any, i: number) => (
					<tr class="border-b border-stone-300">
						<td class="pr-2 py-3">{i + 1}</td>
						<td class="pr-2 py-3">
							<a href={`/orgs/${o.id}`}>{o.name}</a>
						</td>
						<td class="pr-2 py-3">xxx</td>
						<td class="py-3 ">xxxxx</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

export const TableBatches = (props: { batches: VBatch[] }) => (
	<div>
		<table class="w-full border-t border-stone-500">
			<tbody>
				{props.batches.map((b: VBatch, i: number) => (
					<tr id={`/batches/${b.id}`} class="batch border-b border-stone-300 cursor-pointer hover:text-sky-500">
						<td class="w-8 pr-2 py-3">{i + 1}</td>
						<td class="pr-2 py-3">{b.date}</td>
						<td class="pr-2 py-3">{b.org_name}</td>
						<td class="pr-2 py-3">{b.title}</td>
						<td class="pr-2 py-3">{b.type == 'ASCENT' ? 'AC' : 'CT'}</td>
					</tr>
				))}
			</tbody>
		</table>
		{html`<script>
			document.querySelectorAll('tr.batch').forEach((tr) => {
				tr.addEventListener('click', () => (document.location.href = tr.id));
			});
		</script>`}
	</div>
);

export const TableModules = (props: { modules: Module[] }) => (
	<div>
		<table class="w-full border-t border-stone-400">
			<tbody>
				{props.modules.map((m: any, i: number) => (
					<tr class="border-b border-stone-300">
						<td class="pr-2 py-3">{i + 1}</td>
						<td class="py-3 ">{m.title}</td>
						<td class="text-sm text-stone-400 font-mono pr-2 py-3">{m.id}</td>
						<td class="pr-2 py-3">{m.category}</td>
						<td class="pr-2 py-3">{m.ascent ? '✅' : '-'}</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

export const TableAssessors = (props: { data: any[] }) => (
	<div>
		<table class="w-full border-t border-stone-400">
			<tbody>
				{props.data.map((m: any, i: number) => (
					<tr class="border-b border-stone-300">
						<td class="pr-2 py-3">{i + 1}</td>
						<td class="py-3 ">{m.fullname}</td>
						<td class="pr-2 py-3">{m.username}</td>
						<td class="text-sm text-right font-mono pr-2 py-3">{m.hash}</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);
