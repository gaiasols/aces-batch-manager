import { html } from "hono/html";
import { Layout } from "./layout";
import { getAssessorReqs, randomToken } from "./utils";
import { orgsTypeArray } from "./orgs-type";
import { businessSectorArray } from "./business-sector";

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
						<td class="pr-2 py-3">
							<a href={`orgs/${o.id}/update-orgs`} class="bg-zinc-800 text-white text-xs px-4 py-1 rounded">Update</a>
						</td>
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
				<ModulesRow mod={ m } num={ i + 1 } />
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

export const BatchLayout = (props: { css?: string[], js?: string[], batch: VBatch; path: string; children?: any }) => (
	<Layout css={ props.css } js={ props.js }>
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
								<button class="button">SUBMIT</button>
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
									const x = (window?.Papa.parse(t)?.data ?? []).filter(y => y.length === 3);
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
				hx-get={ `/assessors/${assessor.id}?form=true&num=${num}` }
				hx-swap="innerHTML"
				hx-target={ `#${id}` }
			>
				<td class="pr-2 py-3">{ num ?? "#" }</td>
				<td class="py-3 ">{ assessor.fullname }</td>
				<td class="pr-2 py-3">{ assessor.username }</td>
			</tr>
			<tr id={ id }></tr>
		</tbody>
	)
}

export function AssessorEditor({ assessor, num }: { num?: string, assessor: Assessor }) {
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
				<input type="hidden" name="num" value={num} />
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

				<hr class="border-bottom border-black mt-8 mb-5" />
				
				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="ranking" class="block text-sm font-medium leading-6 text-gray-900">Ranking</label>
						<div class="mt-2">
							<input class="w-full" type="number" name="ranking" id="ranking" value={ assessor.ranking ?? "" } />
						</div>
					</div>
					<div class="w-full">
						<label for="university" class="block text-sm font-medium leading-6 text-gray-900">University</label>
						<div class="mt-2">
							<input class="w-full" type="text" name="university" id="university" value={ assessor.university ?? "" } />
						</div>
					</div>
				</div>

				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="date_of_birth" class="block text-sm font-medium leading-6 text-gray-900">Date of Birth</label>
						<div class="mt-2">
							<input class="w-full" type="date" name="date_of_birth" id="date_of_birth" value={ assessor.date_of_birth ?? "" } />
						</div>
					</div>
					<div class="w-full">
						<label for="graduation_year" class="block text-sm font-medium leading-6 text-gray-900">Graduation Year</label>
						<div class="mt-2">
							<input class="w-full" type="number" name="graduation_year" id="graduation_year" value={ assessor.graduation_year ?? "" } />
						</div>
					</div>
				</div>

				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="phone_number" class="block text-sm font-medium leading-6 text-gray-900">Phone Number</label>
						<div class="mt-2">
							<input class="w-full" type="tel" name="phone_number" id="phone_number" value={ assessor.phone_number ?? "" } />
						</div>
					</div>
					<div class="w-full">
						<label for="home_address" class="block text-sm font-medium leading-6 text-gray-900">Home Address</label>
						<div class="mt-2">
							<input class="w-full" type="text" name="home_address" id="home_address" value={ assessor.home_address ?? "" } />
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
						<label for="ktp_number" class="block text-sm font-medium leading-6 text-gray-900">KTP Number</label>
						<div class="mt-2">
							<input class="w-full" type="text" name="ktp_number" id="ktp_number" value={ assessor.ktp_number ?? "" } />
						</div>
					</div>
				</div>

				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="npwp_number" class="block text-sm font-medium leading-6 text-gray-900">NPWP Number</label>
						<div class="mt-2">
							<input class="w-full" type="text" name="npwp_number" id="npwp_number" value={ assessor.npwp_number ?? "" } />
						</div>
					</div>
					<div class="w-full">
						<label for="npwp_name" class="block text-sm font-medium leading-6 text-gray-900">NPWP Name</label>
						<div class="mt-2">
							<input class="w-full" type="text" name="npwp_name" id="npwp_name" value={ assessor.npwp_name ?? "" } />
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
			<tr id={ id }></tr>
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
								<option value="SELF" selected={ mod.category === "SELF" }>SELF</option>
								<option value="CASE" selected={ mod.category === "CASE" }>CASE</option>
								<option value="FACE" selected={ mod.category === "FACE" }>FACE</option>
								<option value="DISC" selected={ mod.category === "DISC" }>DISC</option>
							</select>
						</div>
					</div>
				</div>
				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="type" class="block text-sm font-medium leading-6 text-gray-900">Type <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="type" id="type" value={ type } required placeholder="GPQ-01" />
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
							<input type="checkbox" name="ascent" id="ascent" checked={ Boolean(mod.ascent) } />
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

export const FormBatchTimeSettings = ({ batch, type }: { type: "batch" | "slot_1" | "slot_2" | "slot_3" | "slot_4", batch: VBatch }) => {
	const datetime: Record<string, Date | undefined | string> = {
		date_start: undefined,
		date_end: undefined,
		time_start: undefined,
		time_end: undefined,
	}
	
	if(type === "batch") {
		datetime.date_start = batch.batch_timestamp_start ? new Date(batch.batch_timestamp_start) : undefined
		datetime.date_end = batch.batch_timestamp_end ? new Date(batch.batch_timestamp_end) : undefined
	}

	if(type.includes("slot")) {
		const level = type.split("_")[1]
		datetime.date_start = batch[`time${level}` as keyof VBatch] ? new Date(batch[`time${level}` as keyof VBatch] as string) : undefined
		datetime.date_end = batch[`time${level}_end` as keyof VBatch] ? new Date(batch[`time${level}_end` as keyof VBatch] as string) : undefined
	}
	
	datetime.time_start = datetime.date_start 
		? `${(datetime.date_start as Date).getHours().toString().padStart(2, '0')}:${(datetime.date_start as Date).getMinutes().toString().padStart(2, '0')}` 
		: undefined
	datetime.time_end = datetime.date_end 
		? `${(datetime.date_end as Date).getHours().toString().padStart(2, '0')}:${(datetime.date_end as Date).getMinutes().toString().padStart(2, '0')}` 
		: undefined

	return (
		<form class="text-[15px] pr-6 mb-0" hx-put={`/batches/${batch.id}/deployment`} hx-swap="outerHTML">
			<input type="hidden" name="type" value={type} />
			<table class="w-full">
				<tbody>
					<tr>
						<td width="30%" class="font-semibold text-nowrap pt-2 pr-2 pb-5">
							Pengaturan { type === "batch" ? "Batch" : `Time ${type.split("_")[1]}` }
						</td>
					</tr>
					<tr>
						<td width="30%" class="text-nowrap pt-2 pr-2">
							Tanggal mulai batch
						</td>
						<td class="pt-2 flex gap-3">
							<input disabled required type="date" name="date_start" class="input" min={ new Date().toISOString().split('T')[0] } value={ datetime.date_start ? (datetime.date_start as Date).toISOString().split("T")[0] : undefined } />
							<input disabled required type="time" name="time_start" class="input" min="06:00" max="19:00" value={ datetime.time_start } />
						</td>
					</tr>
					<tr>
						<td width="30%" class="text-nowrap pt-2 pr-2">
							Tanggal berakhir batch
						</td>
						<td class="pt-2 flex gap-3">
							<input disabled required type="date" name="date_end" class="input" min={ new Date().toISOString().split('T')[0] } value={ datetime.date_end ? (datetime.date_end as Date).toISOString().split("T")[0] : undefined } />
							<input disabled required type="time" name="time_end" class="input" min="06:00" max="19:00" value={ datetime.time_end } />
						</td>
					</tr>
				</tbody>
				<tbody class="button-container hidden">
					<tr>
						<td colspan={ 2 } class="border-b border-stone-300 pt-4"></td>
					</tr>
					<tr>
						<td></td>
						<td class="pt-3">
							<div class="flex justify-between w-full">
								<button type="submit" class="button">SUBMIT</button>
								<button type="button" class="bg-transparent text-black active:bg-transparent border border-black px-5 font-semibold button-trigger-hide">CANCEL</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</form>
	)
}

export const NavTabsFormOrg = ({ type, orgId }: { orgId: string, type: TFormOrgType }) => {
	return (
		<nav class="flex flex-col sm:flex-row">
			<button 
				hx-get={ `/orgs/${orgId}/form?type=general` }
				hx-swap="innerHTML"
				hx-target="#update-org-content"
				class={`text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none border-b-2 hover:border-blue-500 sm:w-auto focus:border-blue-500 ${type === "general" ? "border-blue-500" : " border-transparent"}`}
			>
				General
			</button>

			<button 
				hx-get={ `/orgs/${orgId}/form?type=business` }
				hx-swap="innerHTML"
				hx-target="#update-org-content"
				class={`text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none border-b-2 hover:border-blue-500 sm:w-auto focus:border-blue-500 ${type === "business" ? "border-blue-500" : " border-transparent"}`}
			>
				Usaha
			</button>

			<button 
				hx-get={ `/orgs/${orgId}/form?type=npwp` }
				hx-swap="innerHTML"
				hx-target="#update-org-content"
				class={`text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none border-b-2 hover:border-blue-500 sm:w-auto focus:border-blue-500 ${type === "npwp" ? "border-blue-500" : " border-transparent"}`}
			>
				NPWP
			</button>

			<button 
				hx-get={ `/orgs/${orgId}/form?type=contact` }
				hx-swap="innerHTML"
				hx-target="#update-org-content"
				class={`text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none border-b-2 hover:border-blue-500 sm:w-auto focus:border-blue-500 ${type === "contact" ? "border-blue-500" : " border-transparent"}`}
			>
				Contact
			</button>
		</nav>
	)
}

export const FormOrgGeneral = ({ orgs }: { orgs: Organization }) => {
	return (
		<div class="form-update-container border border-gray-600 rounded relative p-8 mt-12">
			<div class="absolute top-[10px] right-[10px]">
				<button
					class="flex items-center justify-center w-5 h-5 text-stone-300 hover:text-stone-500 active:text-stone-700 button-trigger-show"
					hx-swap="outerHTML"
				>
					<LockSVG />
				</button>
			</div>
			<form hx-put={`/orgs/${orgs.id}/update-orgs/general`} hx-target="#update-org-content" hx-swap="innerHTML" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-0">
				<div>
					<label for="nama" class="block text-gray-700">Nama</label>
					<input disabled value={orgs.name} type="text" id="nama" name="name" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="alamat" class="block text-gray-700">Alamat</label>
					<input disabled value={orgs?.address ?? ""} type="text" id="alamat" name="address" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="kota" class="block text-gray-700">Kota</label>
					<input disabled value={orgs?.city ?? ""} type="text" id="kota" name="city" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="provinsi" class="block text-gray-700">Provinsi</label>
					<input disabled value={orgs?.province ?? ""} type="text" id="provinsi" name="province" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="kode-pos" class="block text-gray-700">Kode Pos</label>
					<input disabled value={orgs?.postal_code ?? ""} type="text" id="kode-pos" name="postal_code" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="telepon" class="block text-gray-700">Telepon</label>
					<input disabled value={orgs?.phone ?? ""} type="text" id="telepon" name="phone" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="email" class="block text-gray-700">Email</label>
					<input disabled value={orgs?.email ?? ""} type="email" id="email" name="email" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="website" class="block text-gray-700">Website</label>
					<input disabled value={orgs?.website ?? ""} type="url" id="website" name="website" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div class="md:col-span-2 hidden button-container flex gap-4 mt-5">
					<button type="button" class="w-full bg-zinc-800 text-white py-2 px-4 rounded hover:bg-zinc-900 button-trigger-hide">
						Cancel
					</button>
					<button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
						Submit
					</button>
				</div>
			</form>
		</div>
	)
}

export const FormOrgNpwp = ({ orgs }: { orgs: Organization }) => {
	return (
		<div class="form-update-container border border-gray-600 rounded relative p-8 mt-12">
			<div class="absolute top-[10px] right-[10px]">
				<button
					class="flex items-center justify-center w-5 h-5 text-stone-300 hover:text-stone-500 active:text-stone-700 button-trigger-show"
					hx-swap="outerHTML"
				>
					<LockSVG />
				</button>
			</div>
			<form hx-put={`/orgs/${orgs.id}/update-orgs/npwp`} hx-target="#update-org-content" hx-swap="innerHTML" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-0">
				<div>
					<label for="nomor-npwp" class="block text-gray-700">Nomor NPWP</label>
					<input value={orgs?.npwp_number ?? ""} disabled type="text" id="nomor-npwp" name="npwp_number" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="nama-npwp" class="block text-gray-700">Nama NPWP</label>
					<input value={orgs?.npwp_name ?? ""} disabled type="text" id="nama-npwp" name="npwp_name" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="nik-dalam-npwp" class="block text-gray-700">NIK Dalam NPWP</label>
					<input value={orgs?.npwp_nik ?? ""} disabled type="text" id="nik-dalam-npwp" name="npwp_nik" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="alamat-dalam-npwp" class="block text-gray-700">Alamat Dalam NPWP</label>
					<input value={orgs?.npwp_address ?? ""} disabled type="text" id="alamat-dalam-npwp" name="npwp_address" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="kelurahan-dalam-npwp" class="block text-gray-700">Kelurahan Dalam NPWP</label>
					<input value={orgs?.npwp_village ?? ""} disabled type="text" id="kelurahan-dalam-npwp" name="npwp_village" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="kecamatan-dalam-npwp" class="block text-gray-700">Kecamatan Dalam NPWP</label>
					<input value={orgs?.npwp_district ?? ""} disabled type="text" id="kecamatan-dalam-npwp" name="npwp_district" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="kota" class="block text-gray-700">Kota</label>
					<input value={orgs?.npwp_city ?? ""} disabled type="text" id="kota" name="npwp_city" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="provinsi" class="block text-gray-700">Provinsi</label>
					<input value={orgs?.npwp_province ?? ""} disabled type="text" id="provinsi" name="npwp_province" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div class="md:col-span-2 hidden button-container flex gap-4 mt-5">
					<button type="button" class="w-full bg-zinc-800 text-white py-2 px-4 rounded hover:bg-zinc-900 button-trigger-hide">
						Cancel
					</button>
					<button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
						Submit
					</button>
				</div>
			</form>
		</div>
	)
}

export const FormOrgContact = ({ orgs }: { orgs: Organization }) => {
	return (
		<div class="form-update-container border border-gray-600 rounded relative p-8 mt-12">
			<div class="absolute top-[10px] right-[10px]">
				<button
					class="flex items-center justify-center w-5 h-5 text-stone-300 hover:text-stone-500 active:text-stone-700 button-trigger-show"
					hx-swap="outerHTML"
				>
					<LockSVG />
				</button>
			</div>
			<form hx-put={`/orgs/${orgs.id}/update-orgs/contact`} hx-target="#update-org-content" hx-swap="innerHTML" class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label for="nama" class="block text-gray-700">Nama</label>
					<input value={orgs?.contact_name ?? ""} disabled type="text" id="nama" name="contact_name" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div>
					<label for="nomor-hp" class="block text-gray-700">Nomor HP</label>
					<input value={orgs?.contact_phone ?? ""} disabled type="text" id="nomor-hp" name="contact_phone" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div class="md:col-span-2">
					<label for="email" class="block text-gray-700">Email</label>
					<input value={orgs?.contact_email ?? ""} disabled type="email" id="email" name="contact_email" class="mt-1 block w-full p-2 border border-gray-300 rounded"  disabled:text-gray-800/>
				</div>
				<div class="md:col-span-2 hidden button-container flex gap-4 mt-5">
					<button type="button" class="w-full bg-zinc-800 text-white py-2 px-4 rounded hover:bg-zinc-900 button-trigger-hide">
						Cancel
					</button>
					<button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
						Submit
					</button>
				</div>
			</form>
		</div>
	)
}

export const FormOrgBusiness = ({ orgs }: { orgs: Organization }) => {
	return (
		<div class="form-update-container border border-gray-600 rounded relative p-8 mt-12">
			<div class="absolute top-[10px] right-[10px]">
				<button
					class="flex items-center justify-center w-5 h-5 text-stone-300 hover:text-stone-500 active:text-stone-700 button-trigger-show"
					hx-swap="outerHTML"
				>
					<LockSVG />
				</button>
			</div>
			<form hx-put={`/orgs/${orgs.id}/update-orgs/business`} hx-target="#update-org-content" hx-swap="innerHTML" class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label for="tipe-organisasi" class="block text-gray-700">Tipe Organisasi</label>
					<select disabled id="tipe-organisasi" name="organization_type" class="mt-1 block w-full p-2 border border-gray-300 rounded disabled:text-gray-800">
						{ orgsTypeArray().map(v => (
							<option selected={(orgs?.organization_type ?? "") == v.id} value={ v.id }>{ v.name }</option>
						)) }
					</select>
				</div>
				<div>
					<label for="kelompok-usaha" class="block text-gray-700">Kelompok Usaha</label>
					<select disabled id="kelompok-usaha" name="business_sector" class="mt-1 block w-full p-2 border border-gray-300 rounded disabled:text-gray-800">
						{ businessSectorArray().map(v => (
							<option selected={(orgs?.business_sector ?? "") == v.id} value={ v.id }>{ v.name }</option>
						)) }
					</select>
				</div>
				<div class="md:col-span-2 hidden button-container flex gap-4 mt-5">
					<button type="button" class="w-full bg-zinc-800 text-white py-2 px-4 rounded hover:bg-zinc-900 button-trigger-hide">
						Cancel
					</button>
					<button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
						Submit
					</button>
				</div>
			</form>
		</div>
	)
}

export const FormOrg = ({ orgs, type }: { orgs: Organization, type: TFormOrgType }) => {
	switch (type) {
		case "general":
			return (
				<>
					<NavTabsFormOrg orgId={orgs.id} type={ type } />
					<FormOrgGeneral orgs={ orgs } />
				</>
			)
		case "npwp":
			return (
				<>
					<NavTabsFormOrg orgId={orgs.id} type={ type } />
					<FormOrgNpwp orgs={ orgs } />
				</>
			)
		case "contact":
			return (
				<>
					<NavTabsFormOrg orgId={orgs.id} type={ type } />
					<FormOrgContact orgs={ orgs } />
				</>
			)
		case "business":
			return (
				<>
					<NavTabsFormOrg orgId={orgs.id} type={ type } />
					<FormOrgBusiness orgs={ orgs } />
				</>
			)
		default:
			return (
				<>
					<NavTabsFormOrg orgId={orgs.id} type={ type } />
				</>
			)
	}
}