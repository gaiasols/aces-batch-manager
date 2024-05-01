(function(){
	const LDG_BUCKET = document.getElementById("disc-assessors-bucket");
	const DISC_LOADER = document.getElementById("disc-load-bucket");
	const DISC_LOADER_BTN = document.getElementById("btn-disc-load-bucket");
	const F2F_BUCKET = document.getElementById("face-assessors-bucket");
	const F2F_LOADER = document.getElementById("face-load-bucket");
	const F2F_LOADER_BTN = document.getElementById("btn-face-load-bucket");

	let DISC_IDS = [...DISC_ASS_IDS];
	let F2F_IDS = [...F2F_ASS_IDS];
	let CURRENT_TYPE = "";

	console.log("DISC_IDS", DISC_IDS);
	console.log("F2F_IDS", F2F_IDS);

	if (DISC_IDS.length < MAX_DISC) DISC_LOADER.style.display = "block";
	if (F2F_IDS.length < MAX_F2F) F2F_LOADER.style.display = "block";


	// SSE "bucket-loaded"
	document.body.addEventListener('bucket-loaded', function (ev) {
		const detail = ev.detail
		const loader = detail.loader;
		const type = detail.type;
		CURRENT_TYPE = type;
		const filter = type == "disc" ? DISC_IDS : F2F_IDS;
		console.log("filter", filter);
		console.log(loader, CURRENT_TYPE);
		document.getElementById(loader).style.display="none";
		document.querySelectorAll(".bucket-loader").forEach((b) => b.setAttribute("disabled", true));

		// Add delay before activating bucket items
		setTimeout(() => {
			console.log(F2F_IDS)
			console.log(DISC_IDS)
			document.querySelectorAll(".bucket-item").forEach(elm => {
				const id = parseInt(elm.getAttribute("ass_id"));
				// filter
				if (filter.includes(id)) {
					console.log("Filter:", id)
					elm.classList.add("text-red-600")
				}
				elm.addEventListener("click", bucketItemClick)
			});
		}, 200);
	});

	// SSE "assessor-saved"
	document.body.addEventListener("assessor-saved", function (ev){
		const type = ev.detail.type;
		const ass_id = ev.detail.ass_id;
		if (type == 'face') {
			F2F_IDS.push(ass_id);
			if (F2F_IDS.length == MAX_F2F) {
				F2F_LOADER.style.display = "none";
				F2F_BUCKET.innerHTML = "";
				DISC_LOADER_BTN.removeAttribute("disabled");
			}
		} else {
			DISC_IDS.push(ass_id);
			if (DISC_IDS.length == MAX_DISC) {
				DISC_LOADER.style.display = "none";
				LDG_BUCKET.innerHTML = "";
				F2F_LOADER_BTN.removeAttribute("disabled");
			}
		}
		console.log("ev.detail", ev.detail);
		console.log("face", F2F_IDS)
		console.log("disc", DISC_IDS)
		const elm = document.getElementById('A-' + ev.detail.ass_id)
		if (elm) elm.classList.add('text-red-600');
		// minmax();
	})

	// SSE "assessor-dropped"
	document.body.addEventListener("assessor-dropped", function (ev){
		console.log(ev.detail);
		const { ass_id, type } = ev.detail;
		// Update array and check max
		if (type == "disc") {
			DISC_IDS = DISC_IDS.filter(x => x != ass_id);
			if (DISC_IDS.length < MAX_DISC && LDG_BUCKET.innerHTML == "") {
				DISC_LOADER.style.display = "block";
				DISC_LOADER_BTN.removeAttribute("disabled");
			}
		} else {
			F2F_IDS = F2F_IDS.filter(x => x != ass_id);
			if (F2F_IDS.length < MAX_F2F && F2F_BUCKET.innerHTML == "") {
				F2F_LOADER.style.display = "block";
				F2F_LOADER_BTN.removeAttribute("disabled");
			}
		}

		console.log("assessor-dropped", ev.detail)
		console.log("Current type", CURRENT_TYPE);
		console.log(DISC_IDS)
		console.log(F2F_IDS)

		// No need to check max

		// Update bucket item if bucket exists
		const elm = document.getElementById('A-' + ev.detail.ass_id);
		if (elm) elm.classList.remove('text-red-600');
	})

	function minmax() {
		if (CURRENT_TYPE == "disc") {
			const display = DISC_IDS.length == MAX_DISC ? "none" : "block";
			document.getElementById("disc-load-bucket").style.display = display;
		} else if (CURRENT_TYPE == "face") {
			const display = F2F_IDS.length == MAX_F2F ? "none" : "block";
			document.getElementById("face-load-bucket").style.display = display;
		}
	}

	function bucketItemClick(event) {
		const src = event.target;
		const id = src.getAttribute("ass_id");
		const name = src.innerText;
		if (src.classList.contains("text-red-600")) return;
		console.log("bucketItemClick()", id, name);
		console.log(src.nextSibling)
		src.nextSibling.click();
	}

	// minmax();
	/* EOF */
}())
