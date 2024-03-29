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

export const TableModules = (props: { modules: AcesModule[] }) => (
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

export const BatchHero = (props: { batch: VBatch }) => {
	const prev = props.batch.prev_id ? `/batches/${props.batch.prev_id}` : '';
	const next = props.batch.next_id ? `/batches/${props.batch.next_id}` : '';
	return (
		<>
			<div class="flex items-center gap-4 mt-10 mb-10">
				<h1 class="flex-grow text-2xl text-sky-500 font-semibold tracking-tight">Batch # {props.batch.id}</h1>
				<PrevNext prev={prev} next={next} />
			</div>
			<p class="font-bold -mt-10 mb-6">{props.batch.org_name}</p>
		</>
	);
}

export const BatchMenu = (props: { batch_id: number; path: string }) => {
	const { batch_id, path } = props;
	const menu = [
		{ path: '/settings', label: 'Settings' },
		{ path: '/persons', label: 'Persons' },
		{ path: '/assessors', label: 'Assessors' },
		{ path: '/grouping', label: 'Grouping' },
		{ path: '/deployment', label: 'Deployment' },
	];
	return (
		<div class="border-b border-stone-300 my-8">
			<div class="flex gap-5 text-[14px] text-gray-600 font-medium -mb-[2px]">
				{menu.map((m) => {
					const href = m.path == '/settings' ? `/batches/${batch_id}` : `/batches/${batch_id}${m.path}`;
					if (path == m.path)
						return (
							<a class="border-b-2 border-sky-500 text-sky-500 pb-1" href={href}>
								{m.label}
							</a>
						);
					return (
						<a class="border-b-2 border-transparent hover:border-gray-500 hover:text-stone-700 pb-1" href={href}>
							{m.label}
						</a>
					);
				})}
			</div>
		</div>
	);
};

export const SettingsInfo = (props: { batch: VBatch }) => (
	<div class="rounded border border-stone-300 px-4 pt-2 pb-3 my-5">
		<div class="pr-6">
			<table class="w-full mb-1">
				<tbody>
					<tr>
						<td width="26%" class="text-nowrap pt-2 pr-2">
							Organization:
						</td>
						<td class="font-bold pt-2">{props.batch.org_name}</td>
					</tr>
					<tr>
						<td class="text-nowrap pt-2 pr-2">Batch Type:</td>
						<td class="font-bold pt-2">
							<span>{props.batch.type}</span>
						</td>
					</tr>
					{/* <tr>
						<td class="text-nowrap pt-2 pr-2">Date Created:</td>
						<td class="font--bold pt-2">{props.batch.created}</td>
					</tr> */}
					<tr>
						<td class="text-nowrap pt-2 pr-2">Participants:</td>
						<td class="font-bold pt-2">{props.batch.persons}</td>
					</tr>
					<tr>
						<td class="text-nowrap pt-2 pr-2">Assessors:</td>
						<td class="font-bold pt-2">[TBD]</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
);

export const SettingsDateTitle = (props: { batch: VBatch }) => (
	<div id="date-title" class="rounded border border-stone-300 px-4 pr-2 pt-2 pb-3 my-5">
		<div class="relative ">
			<div class="absolute top-0 right-0">
				<button
					class="flex items-center justify-center w-5 h-5 text-stone-300 hover:text-stone-500 active:text-stone-700"
					hx-get={`/batches/${props.batch.id}/form-date-title`}
					hx-target="#date-title"
					hx-swap="outerHTML"
				>
					<LockSVG />
				</button>
			</div>
			<form class="text-[15px] pr-6 mb-0">
				<table class="w-full">
					<tbody>
						<tr>
							<td width="26%" class="text-nowrap pt-2 pr-2">
								Date:
							</td>
							<td class="pt-2">
								<input readonly type="date" name="date" class="input w-36" value={props.batch.date} />
							</td>
						</tr>
						<tr>
							<td class="text-nowrap pt-2 pr-2">Title:</td>
							<td class="pt-2">
								<input readonly type="text" name="title" class="input" value={props.batch.title} />
							</td>
						</tr>
					</tbody>
					<tbody id="B2" style="display:none">
						<tr>
							<td colspan={2} class="border-b border-stone-300 pt-4"></td>
						</tr>
						<tr>
							<td></td>
							<td class="pt-3">
								<button class="button">SUBWAY</button>
							</td>
						</tr>
					</tbody>
				</table>
			</form>
		</div>
	</div>
);

export const FormSettingsDateTitle = (props: { batch: VBatch }) => (
	<div id="date-title" class="rounded border border-stone-300 px-4 pr-2 pt-2 pb-3 my-5">
		<div class="relative ">
			<form
				class="text-[15px] pr-6 mb-0"
				hx-post={`/batches/${props.batch.id}/date-title`}
				hx-target="#date-title"
				hx-swap="outerHTML"
			>
				<table class="w-full">
					<tbody>
						<tr>
							<td width="26%" class="text-nowrap pt-2 pr-2">
								Date:
							</td>
							<td class="pt-2">
								<input type="date" name="date" class="input w-36" value={props.batch.date} />
							</td>
						</tr>
						<tr>
							<td class="text-nowrap pt-2 pr-2">Title:</td>
							<td class="pt-2">
								<input type="text" name="title" class="input" value={props.batch.title} />
							</td>
						</tr>
					</tbody>
					<tbody id="B2">
						<tr>
							<td colspan={2} class="border-b border-stone-300 pt-4"></td>
						</tr>
						<tr>
							<td></td>
							<td class="pt-3">
								<button class="button">Submit</button>
								<button
									type="button"
									class="button-hollow float-right"
									hx-get={`/batches/${props.batch.id}/date-title`}
									hx-target="#date-title"
									hx-swap="outerHTML"
								>
									Cancel
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</form>
		</div>
	</div>
);

export const LockSVG = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
		<path
			fill-rule="evenodd"
			d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
			clip-rule="evenodd"
		/>
	</svg>
);

export const SettingsModules = (props: { batch: VBatch; info: BatchRuntimeInfo }) => {
	const { batch, info } = props;
	const isAC = batch.type == 'ASCENT';
	const label1 = isAC ? 'Mod Selftest:' : 'Module # 1';
	const label2 = isAC ? 'Mod Case:' : 'Module # 2';
	const label3 = isAC ? 'Mod Face2Face:' : 'Module # 3';
	const label4 = isAC ? 'Mod Discussion:' : 'Module # 4';
	const mod1 = isAC ? info.mod_self : info.mod_1;
	const mod2 = isAC ? info.mod_case : info.mod_2;
	const mod3 = isAC ? info.mod_face : info.mod_3;
	const mod4 = isAC ? info.mod_disc : info.mod_4;

	const Row = (props: { label: string; module: VBatchModule | null }) => (
		<tr>
			<td width="26%" class="text-nowrap pt-2 pr-2">
				{props.label}
			</td>
			<td class="pt-2">
				<input readonly class="input w-full" type="text" name="mod[]" value={props.module ? props.module.title : '---'} />
			</td>
		</tr>
	);
	return (
		<div id="settings-modules" class="rounded border border-stone-300 px-4 pr-2 pt-2 pb-3 my-5">
			<div class="relative">
				<div class="absolute top-0 right-0">
					<button
						class="flex items-center justify-center w-5 h-5 text-stone-300 hover:text-stone-500 active:text-stone-700"
						hx-get={`/batches/${batch.id}/form-modules`}
						hx-target="#settings-modules"
						hx-swap="outerHTML"
					>
						<LockSVG />
					</button>
				</div>
				<form class="text-[15px] pr-6 mb-0">
					<table class="w-full">
						<tbody>
							<Row label={label1} module={mod1} />
							<Row label={label2} module={mod2} />
							<Row label={label3} module={mod3} />
							<Row label={label4} module={mod4} />
						</tbody>
					</table>
				</form>
			</div>
		</div>
	);
};

export const FormSettingsModules = (props: { batch: VBatch; modules: AcesModule[], info: BatchRuntimeInfo }) => {
	const { batch, modules, info } = props;
	const isAC = batch.type == 'ASCENT';
	const label1 = isAC ? 'Mod Selftest:' : 'Module # 1';
	const label2 = isAC ? 'Mod Case:' : 'Module # 2';
	const label3 = isAC ? 'Mod Face2Face:' : 'Module # 3';
	const label4 = isAC ? 'Mod Discussion:' : 'Module # 4';
	const labels = [label1, label2, label3, label4];

	const Select = (props: { cat: string, order: number }) => {
		const { cat, order } = props;
		if (isAC) return <SelectModule cat={cat.toUpperCase()} name={cat.toLowerCase()} modules={modules} selections={info.tokens} />;
		return <SelectCustomModule index={order} name="module[]" modules={modules} selections={info.tokens} />;
	}

	const Row = (props: { cat: string; order: number }) => (
		<tr>
			<td width="26%" class="text-nowrap pt-2 pr-2">
				{labels[props.order-1]}
			</td>
			<td class="pt-2">
				<Select cat={props.cat} order={props.order -1} />
			</td>
		</tr>
	);
	return (
		<div id="settings-modules" class="rounded border border-stone-300 px-4 pr-2 pt-2 pb-3 my-5">
			<form class="text-[15px] pr-6 mb-0" hx-post={`/batches/${batch.id}/modules`} hx-target="#settings-modules" hx-swap="outerHTML">
				<input type="hidden" name="batch_type" value={batch.type} />
				<table class="w-full">
					<tbody>
						<Row cat="self" order={1} />
						<Row cat="case" order={2} />
						<Row cat="face" order={3} />
						<Row cat="disc" order={4} />
						<tr>
							<td></td>
							<td class="pt-3">
								<button class="button mr-3">Submit</button>
								<button
									type="button"
									class="button-hollow float-right"
									hx-get={`/batches/${batch.id}/modules`}
									hx-target="#settings-modules"
									hx-swap="outerHTML"
								>
									Cancel
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</form>
		</div>
	);
}

const SelectModule = (props: { name: string; cat: string; modules: AcesModule[]; selections: string[] }) => {
	const { name, cat, modules, selections } = props;
	const _modules = modules.filter((m: any) => m.ascent == 1).filter((m: any) => m.category == cat);
	return (
		<select name={name} class="w-full select pr-12">
			<option value=""> - N/A</option>
			{_modules.map((m: any) =>
				selections.includes(m.id) ? (
					<option selected value={m.id}>
						{m.title}
					</option>
				) : (
					<option value={m.id}>{m.title}</option>
				)
			)}
		</select>
	);
};

const SelectCustomModule = (props: { readonly?: boolean; name: string; index: number; modules: any[]; selections: string[] }) => {
	const { name, index, modules, readonly, selections } = props;
	const _selections = props.selections.map((s) => s.split(':')[1]);
	if (readonly)
		return (
			<select disabled name={name} class="w-full select pr-12">
				<option value=""> - N/A</option>
				{modules.map((m: any) =>
					selections[index] && selections[index] == m.id ? (
						<option selected value={(index + 1) + '|' + m.id}>
							{m.title}
						</option>
					) : (
						<option value={(index + 1) + '|' + m.id}>{m.title}</option>
					)
				)}
			</select>
		);
	return (
		<select name={name} class="w-full select pr-12">
			<option value=""> - N/A</option>
			{modules.map((m: any) =>
				selections[index] && selections[index] == m.id ? (
					<option selected value={(index + 1) + '|' + m.id}>
						{m.title}
					</option>
				) : (
					<option value={(index + 1) + '|' + m.id}>{m.title}</option>
				)
			)}
		</select>
	);
};

export const DaftarPeserta = (props: { persons: any[] }) => (
	<div>
		<h3 class="text-stone-600 font-medium uppercase mb-3">Daftar Peserta Batch</h3>
		<table class="w-full border-t border-stone-500">
			<tbody>
				{props.persons.map(async (p: any, i: number) => (
					<tr class="border-b border-stone-300 cursor-pointer hover:text-sky-500">
						<td class="w-8 pr-2 py-3">{i + 1}</td>
						<td class="pr-2 py-3">{p.fullname}</td>
						<td class="pr-2 py-3">{p.username}</td>
						<td class="text-sm text-right font-mono pr-2 py-3">{p.hash}</td>
					</tr>
				))}
			</tbody>
		</table>
		<Pojo obj={props.persons[props.persons.length - 1]} />
	</div>
);

export const UploadPersonsCSV = (props: { batch: Batch | VBatch }) => (
	<div>
		<div class="rounded bg-stone-50 border border-stone-300 text--[15px] px-4 pt-2 pb-3">
			<p class="mb-5">Belum ada data peserta.</p>
			<form>
				<input type="hidden" name="batch_id" value={props.batch.id} />
				<button class="button">Upload Daftar Peserta</button>
			</form>
		</div>
		<p class="mt-2">
			🏀{' '}
			<a class="text-stone-600 hover:text-orange-500 hover:underline" href="#">
				Download file template daftar peserta
			</a>
		</p>
		{/* DEV ONLY */}
		<p class="border-b border-stone-400 text-stone-400 text-center font-mono mt-8">DEV ONLY</p>
		<form method="post" class="flex items-center justify-center mt-6">
			<input type="hidden" name="batch_id" value={props.batch.id} />
			<input type="hidden" name="org_id" value={props.batch.org_id} />
			<div class="flex gap-3 items-center">
				<span>Create sample data:</span>
				<input type="number" name="num" min={5} max={100} value={15} class="w-20 input" />
				<button class="button">Create</button>
			</div>
		</form>
	</div>
);

export const TableGroupSlots = (props: { groups: VGroup[], modules: VBatchModule[], type: string }) => {
	const { groups, modules, type } = props;
	return (
		<div id="" class="">
			<p class="text-[15px] font-semibold mb-2">Pembagian grup dan slot dalam batch ini</p>
			<table class="w-full border-t border-stone-500 mb-6">
				<thead>
					<tr class="border-b border-stone-400">
						<td class="pr-4 py-2"></td>
						<td class="pr-2 py-2">Slot 1</td>
						<td class="pr-2 py-2">Slot 2</td>
						<td class="pr-2 py-2">Slot 3</td>
						<td class="py-2">Slot 4</td>
					</tr>
				</thead>
				<tbody>
					{groups.map((g) => (
						<tr class="border-b border-stone-300">
							<td class="pr-4 py-2 font-medium">{g.name}</td>
							<td class="pr-2 py-2">{modules.filter((m) => m.module_id == g.slot1)[0]?.title || '---'}</td>
							<td class="pr-2 py-2">{modules.filter((m) => m.module_id == g.slot2)[0]?.title || '---'}</td>
							<td class="pr-2 py-2">{modules.filter((m) => m.module_id == g.slot3)[0]?.title || '---'}</td>
							<td class="py-2">{modules.filter((m) => m.module_id == g.slot4)[0]?.title || '---'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export const TableGroups = (props: { groups: VGroup[], persons: VPerson[] }) => (
	<div>
		{props.groups.map((g) => (
			<div class="my-4">
				<p class="text-[15px] font-semibold mb-2">{g.name}</p>
				<table class="w-full border-t border-stone-500">
					<tbody>
						{props.persons
							.filter((p) => p.group_id == g.id)
							.map((p, i) => (
								<tr class="border-b border-stone-300">
									<td class="w-8 pr-2 py-2">{i + 1}</td>
									<td class="pr-2 py-2">{p.fullname}</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>
		))}
	</div>
);

export const DEV_TableRuntimeInfo = (props: { info: BatchRuntimeInfo, persons: number, type: string }) => {
	const { info, persons, type } = props;

	const Row = (props: { label: string; value: string | number | null }) => (
		<tr>
			<td class="pr-2">{props.label}</td>
			<td class="pr-2">:</td>
			<td>{props.value}</td>
		</tr>
	);

	const Sep = () => (
		<tr>
			<td colspan={3} class="h-2"></td>
		</tr>
	);

	return (
		<table class="text-[12.35px] font-mono my-6">
			<tbody>
				<Row label="Persons" value={persons} />
				<Row label="Modules" value={info.modules} />
				<Row label="Mode" value={info.slot_mode} />
				<Row label="Types" value={info.types} />
				<Row label="Runtime" value={info.runtime} />
				<Row label="Grouping" value={info.grouping} />
				<Row label="Permutation" value={info.permutation} />
				{type == 'ASCENT' && (
					<>
						<Sep />
						<Row label="MOD Self" value={info.mod_self?.title || '---'} />
						<Row label="MOD Case" value={info.mod_case?.title || '---'} />
						<Row label="MOD Face" value={info.mod_face?.title || '---'} />
						<Row label="MOD Disc" value={info.mod_disc?.title || '---'} />
					</>
				)}
				{type != 'ASCENT' && (
					<>
						<Sep />
						<Row label="MOD # 1" value={info.mod_1?.title || '---'} />
						<Row label="MOD # 2" value={info.mod_2?.title || '---'} />
						<Row label="MOD # 3" value={info.mod_3?.title || '---'} />
						<Row label="MOD # 4" value={info.mod_4?.title || '---'} />
					</>
				)}
			</tbody>
		</table>
	);
}
