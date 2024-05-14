import { html } from "hono/html";
import { Layout } from "./layout";
import { getAssessorReqs, randomToken } from "./utils";

export const Pojo = (props: { obj: any }) => (
	<pre class="max-h-64 bg-yellow-200/30 text-[12px] text-red-500 leading-4 overflow-x-auto my-5">{ JSON.stringify(props.obj, null, 2) }</pre>
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
						<input class="w-full" type="text" name="username" placeholder="Your username" value={ props.username } />
					</td>
				</tr>
				<tr>
					<td class="pr-4 pb-3">Password:</td>
					<td class="pb-3">
						<input class="w-full" type="password" name="password" placeholder="Your password" value={ props.password } />
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
			{ props.username != undefined && '🤬 Username dan/atau password salah' }
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
		{ props.prev ? (
			<a href={ props.prev } class="w-5 hover:text-sky-500">
				<SVGPrev />
			</a>
		) : (
			<div class="text-stone-300 w-5">
				<SVGPrev />
			</div>
		) }
		{ props.next ? (
			<a href={ props.next } class="w-5 hover:text-sky-500">
				<SVGNext />
			</a>
		) : (
			<div class="text-stone-300 w-5">
				<SVGNext />
			</div>
		) }
	</div>
);

export const TableOrgs = (props: { orgs: any[] }) => (
	<div>
		<table class="w-full border-t border-stone-400">
			<tbody id="daftar-org">
				{ props.orgs.map((o: any, i: number) => (
					<tr class="border-b border-stone-300">
						<td class="pr-2 py-3">{ i + 1 }</td>
						<td class="pr-2 py-3">
							<a href={ `/orgs/${o.id}` }>{ o.name }</a>
						</td>
						<td class="pr-2 py-3">xxx</td>
						<td class="py-3 ">xxxxx</td>
					</tr>
				)) }
			</tbody>
		</table>
	</div>
);

export const TableBatches = (props: { batches: VBatch[] }) => (
	<div>
		<table class="w-full border-t border-stone-500">
			<tbody>
				{ props.batches.map((b: VBatch, i: number) => (
					<tr id={ `/batches/${b.id}` } class="batch border-b border-stone-300 cursor-pointer hover:text-sky-500">
						<td class="w-8 pr-2 py-3">{ i + 1 }</td>
						<td class="pr-2 py-3">{ b.date }</td>
						<td class="pr-2 py-3">{ b.org_name }</td>
						<td class="pr-2 py-3">{ b.title }</td>
						<td class="pr-2 py-3">{ b.type == 'ASCENT' ? 'AC' : 'CT' }</td>
					</tr>
				)) }
			</tbody>
		</table>
		{ html`<script>
			document.querySelectorAll('tr.batch').forEach((tr) => {
				tr.addEventListener('click', () => (document.location.href = tr.id));
			});
		</script>`}
	</div>
);

export const TableModules = (props: { modules: AcesModule[] }) => (
	<div>
		<table class="w-full border-t border-stone-400">
			{ props.modules.map((m: any, i: number) => (
				<ModulesRow mod={m} num={i + 1} />
			)) }
		</table>
	</div>
);

export const TableAssessors = (props: { data: any[] }) => (
	<div>
		<table class="w-full border-t border-stone-400">
			{ props.data.map((m: any, i: number) => (
				<AssessorRow assessor={ m } num={ `${i + 1}` } />
			)) }
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
					{ props.batches.map((b: any) => (
						<tr id={ `/batches/${b.id}` } class="batch border-b border-stone-300 cursor-pointer hover:text-sky-500">
							<td class="w-28 pr-2 py-3">{ b.date }</td>
							<td class="pr-2 py-3">{ b.type }</td>
							<td class="pr-2 py-3">{ b.title }</td>
							<td class="pr-2 py-3">23</td>
							<td class="pr-2 py-3">9</td>
						</tr>
					)) }
				</tbody>
			</table>
			{ html`<script>
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
			<form method="post" class="form-new-batch">
				<input type="hidden" name="org_id" value={ props.org_id } />
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
				<p class="text-red-600 text-center mb-5" id="error-new-batch"></p>
				<div class="flex justify-center gap-3">
					<button class="button">Submit</button>
					<button id="btn3" type="button" class="button-hollow">
						Cancel
					</button>
				</div>
			</form>
		</div>
		{ html`<script>
			document.addEventListener("DOMContentLoaded", () => {
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

				const form = document.querySelector(".form-new-batch")
				form.addEventListener("submit", e => {
					e.preventDefault()
					const date = fdate.value
					const givenDate = (new Date(date)).getTime()
					const now = new Date()
					now.setHours(00)
					now.setMinutes(00)
					now.setSeconds(00)
					now.setMilliseconds(00)
					if(givenDate > now.getTime()) return form.submit()
					document.getElementById("error-new-batch").innerHTML = "Tanggal harus lebih dari atau sama dengan hari ini"
				})
			})
		</script>`}
	</div>
);

export const BatchHero = (props: { batch: VBatch }) => {
	const prev = props.batch.prev_id ? `/batches/${props.batch.prev_id}` : '';
	const next = props.batch.next_id ? `/batches/${props.batch.next_id}` : '';
	return (
		<>
			<div class="flex items-center gap-4 mt-10 mb-10">
				<h1 class="flex-grow text-2xl text-sky-500 font-semibold tracking-tight">Batch # { props.batch.id }</h1>
				<PrevNext prev={ prev } next={ next } />
			</div>
			<p class="font-bold -mt-10 mb-6">{ props.batch.org_name }</p>
		</>
	);
}

export const BatchMenu = (props: { batch_id: string; path: string }) => {
	const { batch_id, path } = props;
	const menu = [
		{ path: '/settings', label: 'Settings' },
		{ path: '/persons', label: 'Persons' },
		{ path: '/assessors', label: 'Assessors' },
		{ path: '/preps', label: 'Preparation' },
		{ path: '/grouping', label: 'Grouping' },
		{ path: '/deployment', label: 'Deployment' },
	];
	return (
		<div class="border-b border-stone-300 my-8">
			<div class="flex gap-5 text-[14px] text-gray-600 font-medium -mb-[2px]">
				{ menu.map((m) => {
					const href = m.path == '/settings' ? `/batches/${batch_id}` : `/batches/${batch_id}${m.path}`;
					if (path == m.path)
						return (
							<a class="border-b-2 border-sky-500 text-sky-500 pb-1" href={ href }>
								{ m.label }
							</a>
						);
					return (
						<a class="border-b-2 border-transparent hover:border-gray-500 hover:text-stone-700 pb-1" href={ href }>
							{ m.label }
						</a>
					);
				}) }
			</div>
		</div>
	);
};

export const BatchLayout = (props: { css?: string[], batch: VBatch; path: string; children?: any }) => (
	<Layout css={ props.css }>
		<BatchHero batch={ props.batch } />
		<BatchMenu batch_id={ props.batch.id } path={ props.path } />
		{ props.children }
	</Layout>
);

export const BatchNeedsRegrouping = (props: { batch: VBatch; path: string }) => (
	<Layout>
		<BatchHero batch={ props.batch } />
		<BatchMenu batch_id={ props.batch.id } path={ props.path } />
		<div>
			<p class="text-red-500 my-5">Batch ini telah mengalami perubahan yang memerlukan regrouping.</p>
			<form method="post" action={ `/batches/${props.batch.id}/regroup` }>
				<button class="button">Regroup Batch</button>
			</form>
		</div>
	</Layout>
);

export const SettingsInfo = (props: { batch: VBatch }) => (
	<div class="rounded border border-stone-300 px-4 pt-2 pb-3 my-5">
		<div class="pr-6">
			<table class="w-full mb-1">
				<tbody>
					<tr>
						<td width="26%" class="text-nowrap pt-2 pr-2">
							Organization:
						</td>
						<td class="font-bold pt-2">{ props.batch.org_name }</td>
					</tr>
					<tr>
						<td class="text-nowrap pt-2 pr-2">Batch Type:</td>
						<td class="font-bold pt-2">
							<span>{ props.batch.type }</span>
						</td>
					</tr>
					{/* <tr>
						<td class="text-nowrap pt-2 pr-2">Date Created:</td>
						<td class="font--bold pt-2">{props.batch.created}</td>
					</tr> */}
					<tr>
						<td class="text-nowrap pt-2 pr-2">Participants:</td>
						<td class="font-bold pt-2">{ props.batch.persons }</td>
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
					hx-get={ `/batches/${props.batch.id}/form-date-title` }
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
								<input readonly type="date" name="date" class="input w-36" value={ props.batch.date } />
							</td>
						</tr>
						<tr>
							<td class="text-nowrap pt-2 pr-2">Title:</td>
							<td class="pt-2">
								<input readonly type="text" name="title" class="input" value={ props.batch.title } />
							</td>
						</tr>
					</tbody>
					<tbody id="B2" style="display:none">
						<tr>
							<td colspan={ 2 } class="border-b border-stone-300 pt-4"></td>
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
				hx-post={ `/batches/${props.batch.id}/date-title` }
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
								<input type="date" name="date" class="input w-36" value={ props.batch.date } />
							</td>
						</tr>
						<tr>
							<td class="text-nowrap pt-2 pr-2">Title:</td>
							<td class="pt-2">
								<input type="text" name="title" class="input" value={ props.batch.title } />
							</td>
						</tr>
					</tbody>
					<tbody id="B2">
						<tr>
							<td colspan={ 2 } class="border-b border-stone-300 pt-4"></td>
						</tr>
						<tr>
							<td></td>
							<td class="pt-3">
								<button class="button">Submit</button>
								<button
									type="button"
									class="button-hollow float-right"
									hx-get={ `/batches/${props.batch.id}/date-title` }
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
				{ props.label }
			</td>
			<td class="pt-2">
				<input readonly class="input w-full" type="text" name="mod[]" value={ props.module ? props.module.title : '---' } />
			</td>
		</tr>
	);
	return (
		<div id="settings-modules" class="rounded border border-stone-300 px-4 pr-2 pt-2 pb-3 my-5">
			<div class="relative">
				<div class="absolute top-0 right-0">
					<button
						class="flex items-center justify-center w-5 h-5 text-stone-300 hover:text-stone-500 active:text-stone-700"
						hx-get={ `/batches/${batch.id}/form-modules` }
						hx-target="#settings-modules"
						hx-swap="outerHTML"
					>
						<LockSVG />
					</button>
				</div>
				<form class="text-[15px] pr-6 mb-0">
					<table class="w-full">
						<tbody>
							<Row label={ label1 } module={ mod1 } />
							<Row label={ label2 } module={ mod2 } />
							<Row label={ label3 } module={ mod3 } />
							<Row label={ label4 } module={ mod4 } />
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
		if (isAC) return <SelectModule cat={ cat.toUpperCase() } name={ cat.toLowerCase() } modules={ modules } selections={ info.tokens } />;
		return <SelectCustomModule index={ order } name="module[]" modules={ modules } selections={ info.tokens } />;
	}

	const Row = (props: { cat: string; order: number }) => (
		<tr>
			<td width="26%" class="text-nowrap pt-2 pr-2">
				{ labels[props.order - 1] }
			</td>
			<td class="pt-2">
				<Select cat={ props.cat } order={ props.order - 1 } />
			</td>
		</tr>
	);
	return (
		<div id="settings-modules" class="rounded border border-stone-300 px-4 pr-2 pt-2 pb-3 my-5">
			<form class="text-[15px] pr-6 mb-0" hx-post={ `/batches/${batch.id}/modules` } hx-target="#settings-modules" hx-swap="outerHTML">
				<input type="hidden" name="batch_type" value={ batch.type } />
				<table class="w-full">
					<tbody>
						<Row cat="self" order={ 1 } />
						<Row cat="case" order={ 2 } />
						<Row cat="face" order={ 3 } />
						<Row cat="disc" order={ 4 } />
						<tr>
							<td></td>
							<td class="pt-3">
								<button class="button mr-3">Submit</button>
								<button
									type="button"
									class="button-hollow float-right"
									hx-get={ `/batches/${batch.id}/modules` }
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
		<select name={ name } class="w-full select pr-12">
			<option value=""> - N/A</option>
			{ _modules.map((m: any) =>
				selections.includes(m.id) ? (
					<option selected value={ m.id }>
						{ m.title }
					</option>
				) : (
					<option value={ m.id }>{ m.title }</option>
				)
			) }
		</select>
	);
};

const SelectCustomModule = (props: { readonly?: boolean; name: string; index: number; modules: any[]; selections: string[] }) => {
	const { name, index, modules, readonly, selections } = props;
	const _selections = props.selections.map((s) => s.split(':')[1]);
	if (readonly)
		return (
			<select disabled name={ name } class="w-full select pr-12">
				<option value=""> - N/A</option>
				{ modules.map((m: any) =>
					selections[index] && selections[index] == m.id ? (
						<option selected value={ (index + 1) + '|' + m.id }>
							{ m.title }
						</option>
					) : (
						<option value={ (index + 1) + '|' + m.id }>{ m.title }</option>
					)
				) }
			</select>
		);
	return (
		<select name={ name } class="w-full select pr-12">
			<option value=""> - N/A</option>
			{ modules.map((m: any) =>
				selections[index] && selections[index] == m.id ? (
					<option selected value={ (index + 1) + '|' + m.id }>
						{ m.title }
					</option>
				) : (
					<option value={ (index + 1) + '|' + m.id }>{ m.title }</option>
				)
			) }
		</select>
	);
};

export const DaftarPeserta = (props: { persons: Person[] }) => (
	<div>
		<h3 class="text-stone-600 font-medium uppercase mb-3">Daftar Peserta Batch</h3>
		<table class="w-full border-t border-stone-500">
			{ props.persons.map(async (p: Person, i: number) => (
				<RowPeserta
					nip={ p.nip }
					number={ i + 1 }
					person_id={ p.id }
					batch_id={ p.batch_id }
					username={ p.username }
					fullname={ p.fullname }
					jenis_kelamin={ p.jenis_kelamin }
				/>
			)) }
		</table>
		<Pojo obj={ props.persons[props.persons.length - 1] } />
	</div>
)

export const UploadPersonsCSV = (props: { batch: Batch | VBatch }) => (
	<div>
		<div class="rounded bg-stone-50 border border-stone-300 text--[15px] px-4 pt-2 pb-3">
			<p class="mb-5">Belum ada data peserta.</p>
			<form method="post">
				<input type="hidden" name="batch_id" value={ props.batch.id } />
				<input type="hidden" name="org_id" value={ props.batch.org_id } />
				<input type="hidden" name="participants" />
				<div>
					<input id="csv" name="csv" type="file" accept=".csv" style="margin-left:0.25rem;" class="mb-4" />
				</div>
				<p class="text-red-600 mb-4" id="participant-error-text"></p>
				<button type="submit" id="process-upload" style="display:none;" />
				<button type="button" id="before-upload" class="button">
					Upload Daftar Peserta
				</button>
			</form>
		</div>
		<p class="mt-2">
			🏀{ ' ' }
			<a class="text-stone-600 hover:text-orange-500 hover:underline" href="/static/template.xlsx">
				Download file template daftar peserta
			</a>
		</p>
		{/* DEV ONLY */ }
		{/* <p class="border-b border-stone-400 text-stone-400 text-center font-mono mt-8">DEV ONLY</p>
		<form method="post" class="flex items-center justify-center mt-6">
			<input type="hidden" name="batch_id" value={props.batch.id} />
			<input type="hidden" name="org_id" value={props.batch.org_id} />
			<div class="flex gap-3 items-center">
				<span>Create sample data:</span>
				<input type="number" name="num" min={5} max={100} value={15} class="w-20 input" />
				<button class="button">Create</button>
			</div>
		</form> */}
		{ html`
			<script src="https://unpkg.com/papaparse@5.4.1/papaparse.min.js"></script>
			<script>
				document.getElementById('before-upload').addEventListener('click', async (e) => {
					const errorMessage = {
						"01": "Jenis kelamin tidak boleh kosong",
						"02": "Jenis kelamin tidak valid (laki-laki/perempuan/pr/lk)",
						"03": "NIP tidak boleh kosong",
						"04": "NIP harus unik",
					}

					function isArrayUnique(array) {
						return new Set(array).size === array.length;
					}

					function toJSON(file) {
						return new Promise((resolve, reject) => {
							const fr = new FileReader();
							fr.onload = (e) => {
								try {
									const t = e.target.result;
									const x = window?.Papa.parse(t)?.data ?? [];
									x.shift();
									if (!x.length) return;

									const nipTmp = []

									const y = x.map((v) => {
										if(!v[1]?.trim()) return reject("01")
										if(!(v[1] === "pr" || v[1] === "lk") && !(v[1] === "perempuan" || v[1] === "laki-laki")) return reject("02")
										if(!v[2]?.trim()) return reject("03")

										nipTmp.push(v[2])

										return {
											name: v[0],
											jenis_kelamin: v[1],
											nip: v[2],
											hash: v?.[3]?.trim() ? v?.[2] : null,
											username: v?.[4]?.trim() ? v?.[1] : null,
										}
									});

									if(!isArrayUnique(nipTmp)) return reject("04")

									return resolve(y);
								} catch (error) {
									reject(error);
								}
							};

							fr.onerror = reject;
							fr.readAsText(file);
						});
					}

					const file = document.getElementById('csv').files[0];
					if (!file) return;

					try {
						const participants = await toJSON(file);
						document.querySelector('input[name=participants]').value = JSON.stringify(participants);
						document.getElementById('process-upload').click();
					} catch(er) {
						const message = errorMessage[er]
						if(message) {
							document.getElementById("participant-error-text").innerText = message
						} else {
							document.getElementById("participant-error-text").innerText = "Something went wrong!"
						}
					}
				});
			</script>
		`}
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
					{ groups.map((g) => (
						<tr class="border-b border-stone-300">
							<td class="pr-4 py-2 font-medium">{ g.name }</td>
							<td class="pr-2 py-2">{ modules.filter((m) => m.module_id == g.slot1)[0]?.title || '---' }</td>
							<td class="pr-2 py-2">{ modules.filter((m) => m.module_id == g.slot2)[0]?.title || '---' }</td>
							<td class="pr-2 py-2">{ modules.filter((m) => m.module_id == g.slot3)[0]?.title || '---' }</td>
							<td class="py-2">{ modules.filter((m) => m.module_id == g.slot4)[0]?.title || '---' }</td>
						</tr>
					)) }
				</tbody>
			</table>
		</div>
	);
}

export const TableGroups = (props: { groups: VGroup[], persons: VPerson[] }) => (
	<div>
		{ props.groups.map((g) => (
			<div class="my-4">
				<p class="text-[15px] font-semibold mb-2">{ g.name }</p>
				<p class="text-[15px] font-semibold mb-2">{ g.disc_assessor_name }</p>
				<table class="w-full border-t border-stone-500">
					<thead>
						<tr class="border-b border-stone-300">
							<th class="text-left w-8 pr-2 py-2">No</th>
							<th class="text-left pr-2 py-2">Peserta</th>
							<th class="text-left pr-2 py-2">Assessor</th>
						</tr>
					</thead>
					<tbody>
						{ props.persons
							.filter((p) => p.group_id == g.id)
							.map((p, i) => (
								<tr class="border-b border-stone-300">
									<td class="w-8 pr-2 py-2">{ i + 1 }</td>
									<td class="pr-2 py-2">{ p.fullname }</td>
									<td class="pr-2 py-2">{ p.face_assessor_name }</td>
								</tr>
							)) }
					</tbody>
				</table>
			</div>
		)) }
	</div>
);

export const DEV_TableRuntimeInfo = (props: { info: BatchRuntimeInfo, persons: number, type: string }) => {
	const { info, persons, type } = props;

	const Row = (props: { label: string; value: string | number | null }) => (
		<tr>
			<td class="pr-2">{ props.label }</td>
			<td class="pr-2">:</td>
			<td>{ props.value }</td>
		</tr>
	);

	const Sep = () => (
		<tr>
			<td colspan={ 3 } class="h-2"></td>
		</tr>
	);

	return (
		<table class="text-[12.35px] font-mono my-6">
			<tbody>
				<Row label="Persons" value={ persons } />
				<Row label="Modules" value={ info.modules } />
				<Row label="Mode" value={ info.slot_mode } />
				<Row label="Types" value={ info.types } />
				<Row label="Runtime" value={ info.runtime } />
				<Row label="Grouping" value={ info.grouping } />
				<Row label="Permutation" value={ info.permutation } />
				{ type == 'ASCENT' && (
					<>
						<Sep />
						<Row label="MOD Self" value={ info.mod_self?.title || '---' } />
						<Row label="MOD Case" value={ info.mod_case?.title || '---' } />
						<Row label="MOD Face" value={ info.mod_face?.title || '---' } />
						<Row label="MOD Disc" value={ info.mod_disc?.title || '---' } />
					</>
				) }
				{ type != 'ASCENT' && (
					<>
						<Sep />
						<Row label="MOD # 1" value={ info.mod_1?.title || '---' } />
						<Row label="MOD # 2" value={ info.mod_2?.title || '---' } />
						<Row label="MOD # 3" value={ info.mod_3?.title || '---' } />
						<Row label="MOD # 4" value={ info.mod_4?.title || '---' } />
					</>
				) }
			</tbody>
		</table>
	);
}

export const Regroup = (props: { batch: VBatch, path: string }) => {
	const id = `id${randomToken()}`

	return (
		<Layout id={ id }>
			<BatchHero batch={ props.batch } />
			<BatchMenu batch_id={ props.batch.id } path={ props.path } />
			<div>
				<p class="text-red-500 my-5">Batch ini telah mengalami perubahan yang memerlukan regrouping.</p>
				<button class="button" hx-post={ `/batches/${props.batch.id}/regroup` } hx-target={ `#${id}` } hx-swap="innerHTML">
					Regroup Batch
				</button>
			</div>
		</Layout>

	)
}



// =============================================================================================================
// =============================================================================================================
export const BatchRequirements = (props: { batch: VBatch; alloc: SlotsAlloc }) => {
	const { batch, alloc } = props;
	const isNeedAssessor = ((alloc: SlotsAlloc) => {
		let currentAlloc = true;
		for (let i = 1; i < 5; i++) {
			if (!alloc[`face_slot${i}` as keyof typeof alloc]) {
				if (alloc[`face_slot${i}` as keyof typeof alloc]! > 0) {
					currentAlloc = false
					break;
				}
			}
			if (!alloc[`disc_slot${i}` as keyof typeof alloc]) {
				if (alloc[`disc_slot${i}` as keyof typeof alloc]! > 0) {
					currentAlloc = false
					break;
				}
			}
		}
		return currentAlloc
	})(alloc)

	if (!batch.modules) return (
		<div id="batch-assessors" style="margin:1rem 0">
			<p>Modul belum ditetapkan: belum diketahui kebutuhan asesor.</p>
		</div>
	);
	if (!isNeedAssessor) return (
		<div id="batch-assessors" style="margin:1rem 0">
			<p>Batch ini tidak membutuhkan asesor.</p>
		</div>
	);
	if (batch.persons == 0) return (
		<div id="batch-assessors" style="margin:1rem 0">
			<p>Peserta belum ditetapkan: belum diketahui kebutuhan asesor.</p>
		</div>
	);
	return <ReqsTable alloc={ alloc } />
};

export const ReqsTable = (props: { alloc: SlotsAlloc }) => {
	const { minface, mindisc, maxface, maxdisc } = getAssessorReqs(props.alloc);
	const V = (props: { n: number }) => {
		if (props.n < 1) return <td class="p-3">0</td>;
		return <td class="p-3">{ props.n }</td>;
	};

	return (
		<table class="w-full">
			<thead>
				<tr class="border-b">
					<th class="text-left p-3">Jenis Asesor</th>
					<th class="text-left p-3">Minimum</th>
					<th class="text-left p-3">Maksimum</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-3">Asesor Grup:</td>
					<V n={ mindisc } />
					<V n={ maxdisc } />
				</tr>
				<tr class="border-b">
					<td class="p-3">Asesor Individu:</td>
					<V n={ minface } />
					<V n={ maxface } />
				</tr>
			</tbody>
		</table>
	);
};

export const AssessorAllocation = (props: { batch_id: string; type: string; minmax: Minmax; title: string; assessors: VBatchAssessor[] }) => {
	const { batch_id, type, minmax, title, assessors } = props;
	const parent_id = `${type}-assessors`;
	const tray_id = `${type}-assessors-tray`;
	const bucket_id = `${type}-assessors-bucket`;
	const minimum = type == "disc" ? minmax.mindisc : minmax.minface;
	const maximum = type == 'disc' ? minmax.maxdisc : minmax.maxface;

	if (minimum == 0) return <></>
	return (
		<div id={ parent_id } class="mt-16">
			<div style="display:flex;align-items:center;margin-bottom:.5rem">
				<h3 style="flex-grow:1" class="font-bold">
					{ title }: { minimum } - { maximum }
				</h3>
			</div>
			<table class="assessor-allocation border-t w-full">
				<tbody id={ tray_id }>
					{ assessors.map((a) => (
						<AllocationRow assessor={ a } type={ type as 'disc' | 'face' } />
					)) }
				</tbody>
			</table>
			<div class="mt-5">
				<p class="font-semibold" id={ `assessor-count-${type}` }>Total Assessor: <span class="count">0</span></p>
			</div>
			<div id={ `${type}-load-bucket` }>
				<button
					class="bucket-loader mt-5 button-action py-3"
					id={ `btn-${type}-load-bucket` }
					hx-get={ `/batches/${batch_id}/assessors/${type}` }
					hx-target={ `#${bucket_id}` }
					hx-swap="innerHTML"
				>
					LOAD BUCKET
				</button>
			</div>
			<div id={ bucket_id }></div>
		</div>
	);
};


export const AllocationRow = (props: { assessor: VBatchAssessor, type: 'face' | 'disc' }) => {
	const { assessor: a, type } = props;

	return (
		<tr class="border-b" style="border-color:#cdd">
			<td class="p-3">{ a.fullname }</td>
			<td class="p-3">
				<div class="flex gap-5 items-center justify-end">
					<Av n={ a.slot1 } />
					<Av n={ a.slot2 } />
					<Av n={ a.slot3 } />
					<Av n={ a.slot4 } />
					<div class="flex gap-2 items-center">
						<button
							class="bg-gray-300 w-[30px] h-[30px] flex items-center justify-center rounded-lg"
							hx-get={ `/batches/${a.batch_id}/assessors/${a.ass_id}/${type}?form=true` }
							hx-target="closest tr"
							hx-swap="outerHTML"
						>
							✎
						</button>
						<form hx-delete={ `/batches/${a.batch_id}/assessors/${a.type}` } hx-target="closest tr" hx-swap="outerHTML" class="m-0">
							<input type="hidden" name="ass_id" value={ a.ass_id } />
							<input type="hidden" name="type" value={ a.type } />
							<button class="bg-gray-300 w-[30px] h-[30px] flex items-center justify-center rounded-lg">
								X
							</button>
						</form>
					</div>
				</div>
			</td>
		</tr>
	);
};

export const Av = (props: { n: number }) => {
	return props.n == 0 || props.n == undefined ? (
		<span style="width:15px;text-align:center">-</span>
	) : (
		<img src="/images/checked.png" style="width:15px;height:15px;margin-top:2px;opacity:0.65" />
	);
};

export const FormAllocationRow = (props: { assessor: VBatchAssessor, type: string }) => {
	const { assessor, type } = props;

	const Ax = (props: { name: string; v: number }) => {
		if (props.v == 0) return (
			<input type="checkbox" name={ props.name } />
		);
		return (
			<input type="checkbox" checked name={ props.name } />
		);
	};

	return (
		<tr class="border-b" style="border-color:#cdd">
			<td class="p-3">{ assessor.fullname }</td>
			<td class="px-3 py-4">
				<form
					class="flex gap-5 items-center justify-end m-0"
					hx-put={ `/batches/${assessor.batch_id}/assessors/${assessor.ass_id}/${type}` }
					hx-target="closest tr"
					hx-swap="outerHTML"
				>
					<Ax name="slot1" v={ assessor.slot1 } />
					<Ax name="slot2" v={ assessor.slot2 } />
					<Ax name="slot3" v={ assessor.slot3 } />
					<Ax name="slot4" v={ assessor.slot4 } />
					<div style="display:flex;gap:.25rem">
						<button class="bg-gray-300 w-[30px] h-[30px] flex items-center justify-center rounded-lg text-xs font-bold p-2">OK</button>
						<button
							class="bg-gray-300 w-[30px] h-[30px] flex items-center justify-center rounded-lg text-xs font-bold p-2"
							type="button"
							hx-get={ `/batches/${assessor.batch_id}/assessors/${assessor.ass_id}/${type}` }
							hx-target="closest tr"
							hx-swap="outerHTML"
						>
							ESC
						</button>
					</div>
				</form>
			</td>
		</tr>
	);
};


// =====================================================================================================================================
// =====================================================================================================================================
export function PersonEditor({ person }: { person: Person }) {
	const id = `id${randomToken()}`
	const idEr = `id${randomToken()}`

	return (
		<td id={ id } colspan={ 6 }>
			<form
				class="person-editor py-5"
				hx-put={ `/batches/${person.batch_id}/persons/${person.id}` }
				hx-target={ `closest tbody` }
				hx-swap="outerHTML"
			>
				<div class="flex gap-5 input-container">
					<div class="w-full">
						<label for="fullname" class="block text-sm font-medium leading-6 text-gray-900">Fullname <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="fullname" id="fullname" value={ person.fullname } required />
						</div>
					</div>
					<div class="w-full">
						<label for="username" class="block text-sm font-medium leading-6 text-gray-900">Username <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="username" id="username" value={ person.username } required />
						</div>
					</div>
				</div>
				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="nip" class="block text-sm font-medium leading-6 text-gray-900">NIP <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="nip" id="nip" value={ person.nip } required />
						</div>
					</div>
					<div class="w-full">
						<label for="jenis_kelamin" class="block text-sm font-medium leading-6 text-gray-900">Jenis kelamin <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="jenis_kelamin" id="jenis_kelamin" value={ person.jenis_kelamin } required />
						</div>
					</div>
				</div>
				<div class="flex input-container mt-2">
					<div class="w-full">
						<label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
						<div class="mt-2">
							<input class="w-full" type="text" name="password" id="password" />
						</div>
					</div>
				</div>
				<div class="flex input-container mt-2 justify-center">
					<span class="text-center text-red-600 font-semibold" id={ idEr }></span>
				</div>
				<div class="flex input-container gap-3 mt-5 justify-end">
					<button
						type="button"
						class="button bg-transparent text-black active:bg-transparent"
						hx-get={ `/batches/1/persons/1` }
						hx-target={ `#${id}` }
						hx-swap="outerHTML"
					>Cancel</button>
					<button class="button">Submit</button>
				</div>
			</form>
			{ html`
				<script>
					document.getElementById("${id}").addEventListener("htmx:responseError", e => {
						document.getElementById("${idEr}").innerText = e.detail.xhr.responseText
					})
				</script>
			`}
		</td>
	)
}

export function RowPeserta(
	{ batch_id, person_id, fullname, username, nip, jenis_kelamin, number }
		: { batch_id: number, person_id: string, fullname: string, username: string, nip: string, jenis_kelamin: string, number?: number }
) {

	const id = `id${randomToken()}`
	const idBody = `id${randomToken()}`
	return (
		<tbody id={ idBody }>
			<tr class="border-b border-stone-300 cursor-pointer hover:text-sky-500">
				<td class="w-8 pr-2 py-3">{ number ?? "#" }</td>
				<td class="pr-2 py-3">{ fullname }</td>
				<td class="pr-2 py-3">{ username }</td>
				<td class="pr-2 py-3">{ nip }</td>
				<td class="pr-2 py-3">{ jenis_kelamin }</td>
				<td class="pr-2 py-3">
					<button
						class="button bg-blue-600 text-xs hover:bg-blue-400 mr-2"
						hx-get={ `/batches/${batch_id}/persons/${person_id}?form=true` }
						hx-swap="innerHTML"
						hx-target={ `#${id}` }
					>
						Put
					</button>
					<button
						class="button bg-red-600 text-xs hover:bg-red-400"
						hx-delete={ `/batches/${batch_id}/persons/${person_id}` }
						hx-swap="innerHTML"
						hx-target={ `#${idBody}` }
					>
						Del
					</button>
				</td>
			</tr>
			<tr id={ id }></tr>
		</tbody>
	)
}

export const PairingGroupAssessorWithParticipant = ({ vGroups, VBatchAssessor }: { vGroups: VGroup[], VBatchAssessor: VBatchAssessor[] }) => {
	const groups_by_slots = [
		vGroups.filter(g => g.slot1.includes("DISC")),
		vGroups.filter(g => g.slot2.includes("DISC")),
		vGroups.filter(g => g.slot3.includes("DISC")),
		vGroups.filter(g => g.slot4.includes("DISC")),
	];
	const assessor_by_availability = [
		VBatchAssessor.filter(a => a.slot1 == 1),
		VBatchAssessor.filter(a => a.slot2 == 1),
		VBatchAssessor.filter(a => a.slot3 == 1),
		VBatchAssessor.filter(a => a.slot4 == 1),
	]

	return (
		<tbody id="PairingGroupAssessorWithParticipant">
			{
				groups_by_slots.map((bs, i) => (
					<>
						{ bs.map((g) => (
							<tr>
								<td class="pt-3">
									Slot { i + 1 } &rarr; { g.name }:
								</td>
								<td class="pt-3 justify-end flex">
									<form
										hx-swap="outerHTML"
										hx-target="#PairingGroupAssessorWithParticipant"
										hx-put={ `/batches/${g.batch_id}/preps/assessor-participant/disc/${g.id}` }
										style="display:flex;align-items:center;gap:.35rem;margin:-4px 0"
									>
										<select name={ `gslot${g}` } g={ g.id } class="w-[200px]">
											<option value="">---------</option>
											{ assessor_by_availability[i].map((l) => (
												<option disabled={ Boolean(bs.find(x => x.ass_id === l.ass_id)) } selected={ l.ass_id === g.ass_id } value={ l.ass_id }>{ l.fullname }</option>
											)) }
										</select>
										<button class="w-[40px] rounded-lg h-[40px] rounded-lg flex items-center justify-center bg-gray-300">OK</button>
									</form>
								</td>
							</tr>
						)) }
					</>
				))
			}
		</tbody>
	)
}

export const PairingF2FAssessorWithParticipant = ({ vPersons, VBatchAssessor, groupFacePosition }: { groupFacePosition: GroupFacePosition, vPersons: VPerson[], VBatchAssessor: VBatchAssessor[] }) => {
	type TAssessorAvailability = Record<'1' | '2' | '3' | '4', Record<string, { disabled: boolean; fullname: string; ass_id: number }>>

	const persons_by_group = vPersons.reduce<Record<string, VPerson[]>>((acc, curr) => {
		if (groupFacePosition[curr.group_id] === 1) {
			acc[1].push(curr)
			return acc
		}
		if (groupFacePosition[curr.group_id] === 2) {
			acc[2].push(curr)
			return acc
		}
		if (groupFacePosition[curr.group_id] === 3) {
			acc[3].push(curr)
			return acc
		}
		acc[4].push(curr)
		return acc

	}, { 1: [], 2: [], 3: [], 4: [] } as Record<string, VPerson[]>)

	const assessor_by_availability = VBatchAssessor.reduce<TAssessorAvailability>((acc, curr) => {
		const pairedParticipants = vPersons.filter(v => v.face_ass_id === curr.ass_id)

		const toPush = {
			fullname: curr.fullname,
			ass_id: curr.ass_id,
			disabled: false,
		}

		const fillAssessor = (position: '1' | '2' | '3' | '4'): void => {
			const copied = { ...toPush }

			if (pairedParticipants.find(x => groupFacePosition[x.group_id] === Number(position))) {
				copied.disabled = true
			}

			if (acc[`${position}`]) {
				acc[`${position}`][curr.ass_id] = copied
			} else {
				acc[`${position}`] = { [curr.ass_id]: copied }
			}
		}

		if (curr.slot1 === 1) {
			fillAssessor('1')
		}
		if (curr.slot2 === 1) {
			fillAssessor('2')
		}
		if (curr.slot3 === 1) {
			fillAssessor('3')
		}
		if (curr.slot4 === 1) {
			fillAssessor('4')
		}

		return acc
	}, {} as TAssessorAvailability)

	return (
		<>
			<tbody id="PairingF2FAssessorWithParticipant">
				{
					Object.entries(persons_by_group).map((bs, i) => (
						<>
							<tr colspan={ 2 } class={ "border-black border-b" }>
								<td class="pb-3 pt-5">
									<strong>Sesi { bs[0] }</strong>
								</td>
							</tr>
							{ bs[1].map((g) => (
								<tr>
									<td width="250" class="pt-3">
										{ g.fullname }
									</td>
									<td class="pt-3">
										<form
											hx-swap="outerHTML"
											hx-target="#PairingF2FAssessorWithParticipant"
											hx-put={ `/batches/${g.batch_id}/preps/assessor-participant/face/${g.id}` }
											class={ "flex items-center justify-end gap-2 m-0" }
										>
											<select class="w-[200px]" name="ass_id">
												<option value="">---------</option>
												{ Boolean(assessor_by_availability[groupFacePosition[g.group_id] as unknown as '1' | '2' | '3' | '4']) && (
													<>
														{
															Object.values(assessor_by_availability[groupFacePosition[g.group_id] as unknown as '1' | '2' | '3' | '4']).map((l) => (
																<option disabled={ l.disabled } selected={ l.ass_id === g.face_ass_id } value={ l.ass_id }>{ l.fullname }</option>
															))
														}
													</>
												) }
											</select>
											<button class="w-[40px] rounded-lg h-[40px] rounded-lg flex items-center justify-center bg-gray-300">OK</button>
										</form>
									</td>
								</tr>
							)) }
						</>
					))
				}
			</tbody>
		</>
	)
}

export const AssessorRow = ({ num, assessor }: { num?: string, assessor: Assessor }) => {
	const id = `id${randomToken()}`
	return (
		<tbody>
			<tr
				class="border-b border-stone-300 hover:bg-gray-200"
				hx-get={ `/assessors/${assessor.id}?form=true` }
				hx-swap="innerHTML"
				hx-target={ `#${id}` }
			>
				<td class="pr-2 py-3">{ num ?? "#" }</td>
				<td class="py-3 ">{ assessor.fullname }</td>
				<td class="pr-2 py-3">{ assessor.username }</td>
				<td class="text-sm text-right font-mono pr-2 py-3">{ assessor.hash }</td>
			</tr>
			<tr id={id}></tr>
		</tbody>
	)
}

export function AssessorEditor({ assessor }: { assessor: Assessor }) {
	const id = `id${randomToken()}`
	const idEr = `id${randomToken()}`

	return (
		<td id={ id } colspan={ 4 }>
			<form
				class="assessor-editor py-5"
				hx-put={ `/assessors/${assessor.id}` }
				hx-target={ `closest tbody` }
				hx-swap="outerHTML"
			>
				<div class="flex gap-5 input-container">
					<div class="w-full">
						<label for="fullname" class="block text-sm font-medium leading-6 text-gray-900">Fullname <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="fullname" id="fullname" value={ assessor.fullname } required />
						</div>
					</div>
					<div class="w-full">
						<label for="username" class="block text-sm font-medium leading-6 text-gray-900">Username <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="username" id="username" value={ assessor.username } required />
						</div>
					</div>
				</div>
				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email</label>
						<div class="mt-2">
							<input class="w-full" type="email" name="email" id="email" value={ assessor.email ?? "" } />
						</div>
					</div>
					<div class="w-full">
						<label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
						<div class="mt-2">
							<input class="w-full" type="text" name="password" id="password" />
						</div>
					</div>
				</div>
				<div class="flex input-container mt-2 justify-center">
					<span class="text-center text-red-600 font-semibold" id={ idEr }></span>
				</div>
				<div class="flex input-container gap-3 mt-5 justify-end">
					<button
						type="button"
						class="button bg-transparent text-black active:bg-transparent"
						hx-get={ `/assessors/1` }
						hx-target={ `#${id}` }
						hx-swap="outerHTML"
					>
						Cancel
					</button>
					<button class="button">Submit</button>
				</div>
			</form>
			{ html`
				<script>
					document.getElementById("${id}").addEventListener("htmx:responseError", e => {
						document.getElementById("${idEr}").innerText = e.detail.xhr.responseText
					})
				</script>
			`}
		</td>
	)
}

export const ModulesRow = ({ mod, num }: { mod: AcesModule, num?: number }) => {
	const id = `id${randomToken()}`

	return (
		<tbody>
			<tr
				class="border-b border-stone-300 hover:bg-gray-200"
				hx-get={ `/modules/${mod.id}?form=true` }
				hx-swap="innerHTML"
				hx-target={ `#${id}` }
			>
				<td class="pr-2 py-3">{ num ?? "#" }</td>
				<td class="py-3 ">{ mod.title }</td>
				<td class="text-sm text-stone-400 font-mono pr-2 py-3">{ mod.id }</td>
				<td class="pr-2 py-3">{ mod.category }</td>
				<td class="pr-2 py-3">{ mod.ascent ? '✅' : '-' }</td>
			</tr>
			<tr id={id}></tr>
		</tbody>
	)
}

// id: string;
// category: string;
// title: string;
// ascent: number;
// version: string | null;
// created?: string;
// updated?: string | null;

export function ModuleEditor({ mod }: { mod: AcesModule }) {
	const id = `id${randomToken()}`
	const idEr = `id${randomToken()}`
	const type = mod.id.split(":").pop()

	return (
		<td id={ id } colspan={ 5 }>
			<form
				class="module-editor py-5"
				hx-put={ `/modules/${mod.id}` }
				hx-target={ `closest tbody` }
				hx-swap="outerHTML"
			>
				<div class="flex gap-5 input-container">
					<div class="w-full">
						<label for="category" class="block text-sm font-medium leading-6 text-gray-900">Category <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<select name="category" id="category" class="w-full">
								<option value="SELF" selected={mod.category === "SELF"}>SELF</option>
								<option value="CASE" selected={mod.category === "CASE"}>CASE</option>
								<option value="FACE" selected={mod.category === "FACE"}>FACE</option>
								<option value="DISC" selected={mod.category === "DISC"}>DISC</option>
							</select>
						</div>
					</div>
				</div>
				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="type" class="block text-sm font-medium leading-6 text-gray-900">Type <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="type" id="type" value={type} required placeholder="GPQ-01" />
						</div>
					</div>
					<div class="w-full">
						<label for="title" class="block text-sm font-medium leading-6 text-gray-900">Title <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="title" id="title" value={ mod.title } required />
						</div>
					</div>
				</div>
				<div class="flex gap-5 input-container mt-5">
					<div class="w-full flex items-center">
						<div>
							<input type="checkbox" name="ascent" id="ascent" checked={Boolean(mod.ascent)} />
						</div>
						<label for="ascent" class="block ml-2 -mt-[2px] text-sm font-medium leading-6 text-gray-900">Assessment Center</label>
					</div>
				</div>
				<div class="flex input-container mt-2 justify-center">
					<span class="text-center text-red-600 font-semibold" id={ idEr }></span>
				</div>
				<div class="flex input-container gap-3 mt-5 justify-end">
					<button
						type="button"
						class="button bg-transparent text-black active:bg-transparent"
						hx-get={ `/modules/1` }
						hx-target={ `#${id}` }
						hx-swap="outerHTML"
					>
						Cancel
					</button>
					<button class="button">Submit</button>
				</div>
			</form>
			{ html`
				<script>
					document.getElementById("${id}").addEventListener("htmx:responseError", e => {
						document.getElementById("${idEr}").innerText = e.detail.xhr.responseText
					})
				</script>
			`}
		</td>
	)
}
