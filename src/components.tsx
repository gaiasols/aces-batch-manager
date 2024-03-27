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

const SVGPrev = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
		<path
			fillRule="evenodd"
			d="M4.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L6.31 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L4.72 9.47Zm9.25-4.25L9.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L11.31 10l3.72-3.72a.75.75 0 0 0-1.06-1.06Z"
			clipRule="evenodd"
		/>
	</svg>
);

const SVGNext = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
		<path
			fillRule="evenodd"
			d="M15.28 9.47a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L13.69 10 9.97 6.28a.75.75 0 0 1 1.06-1.06l4.25 4.25ZM6.03 5.22l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L8.69 10 4.97 6.28a.75.75 0 0 1 1.06-1.06Z"
			clipRule="evenodd"
		/>
	</svg>
);

export const PrevNext = (props: { prev?: string; next?: string }) => (
	<div class="flex gap-3">
		{props.prev ? (
			<a href={props.prev} class="w-5 hover:text-sky-500">
				<SVGPrev />
			</a>
		) : (
			<div class="text-stone-300 w-5">
				<SVGPrev />
			</div>
		)}
		{props.next ? (
			<a href={props.next} class="w-5 hover:text-sky-500">
				<SVGNext />
			</a>
		) : (
			<div class="text-stone-300 w-5">
				<SVGNext />
			</div>
		)}
	</div>
);

export const TableOrgs = (props: { orgs: any[] }) => (
	<div>
		<table class="w-full border-t border-stone-400">
			<tbody id="daftar-org">
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

export const TableOrgBatches = (props: { batches: VBatch[] }) => {
	if (props.batches.length == 0) return (
		<p class="text-[15px]">Organisasi/perusahaan ini belum pernah memiliki batch asesmen. Klik tombol di bawah untuk membuat batch.</p>
	)
	return (
		<div id="org-batches">
			<table class="w-full border-t border-stone-500">
				<tbody>
					{props.batches.map((b: any) => (
						<tr id={`/batches/${b.id}`} class="batch border-b border-stone-300 cursor-pointer hover:text-sky-500">
							<td class="w-28 pr-2 py-3">{b.date}</td>
							<td class="pr-2 py-3">{b.type}</td>
							<td class="pr-2 py-3">{b.title}</td>
							<td class="pr-2 py-3">23</td>
							<td class="pr-2 py-3">9</td>
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
};

export const FormNewOrg = () => (
	<div id="fcnt" class="rounded bg-stone-50 border border-orange-300 px-6 py-4 my-8" style="display:none">
		<form class="mb-1" hx-post="/orgs" hx-target="#daftar-org" hx-swap="beforeend">
			<p class="text-sm font-bold mb-2">Masukkan nama organisasi</p>
			<div class="flex items-center gap-3">
				<input required id="fname" type="text" name="name" class="flex-grow input" />
				<button class="button">Submit</button>
				<button id="btn3" class="button-hollow" type="button">
					Esc
				</button>
			</div>
		</form>
	</div>
);

export const FormNewBatch = (props: { org_id: string | number }) => (
	<div class="my-10">
		<div class="text-center">
			<button id="btn1" class="button-action">
				New Batch
			</button>
			<button id="btn2" class="button-action-stale" style="display:none">
				New Batch
			</button>
		</div>
		<div id="fcnt" class="rounded bg-stone-50 border border-orange-300 px-6 py-4 my-6" style="display:none">
			<form method="post">
				<input type="hidden" name="org_id" value={props.org_id} />
				<div class="flex gap-3 mb-4">
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium">Tipe batch:</label>
						<select required id="ftype" class="select" name="type">
							<option value="ASCENT">ASCENT</option>
							<option value="CUSTOM">CUSTOM</option>
						</select>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-sm font-medium">Tanggal batch:</label>
						<input required id="fdate" type="date" class="input" name="date" />
					</div>
					<div class="flex-grow flex flex-col gap-1">
						<label class="text-sm font-medium">Nama batch:</label>
						<input required id="ftitle" type="text" class="input" name="title" value="Batch" />
					</div>
				</div>
				<div class="flex justify-center gap-3">
					<button class="button">Submit</button>
					<button id="btn3" type="button" class="button-hollow">
						Cancel
					</button>
				</div>
			</form>
		</div>
		{html`<script>
			const btn1 = document.getElementById('btn1');
			const btn2 = document.getElementById('btn2');
			const btn3 = document.getElementById('btn3');
			const fcnt = document.getElementById('fcnt');
			const ftype = document.getElementById('ftype');
			const fdate = document.getElementById('fdate');
			const ftitle = document.getElementById('ftitle');
			btn1.addEventListener('click', () => {
				ftype.value = 'ASCENT';
				fdate.value = '';
				ftitle.value = 'Batch';
				btn1.style.display = 'none';
				btn2.style.display = 'inline-block';
				fcnt.style.display = 'block';
			});
			btn3.addEventListener('click', () => {
				btn2.style.display = 'none';
				btn1.style.display = 'inline-block';
				fcnt.style.display = 'none';
			});
		</script>`}
	</div>
);
