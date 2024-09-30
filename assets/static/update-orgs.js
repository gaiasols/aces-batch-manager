document.addEventListener("DOMContentLoaded", () => {
	function handleFormState(el) {
		let buttonTriggerShow = el.querySelector(".button-trigger-show")
		let buttonTriggerHide = el.querySelector(".button-trigger-hide")

		const onHide = () => {
			buttonTriggerShow = el.querySelector(".button-trigger-show")
			const form = el.querySelector("form")
			const buttonContainer = el.querySelector(".button-container")
			form.querySelectorAll("input").forEach(el => el.disabled = true)
			form.querySelectorAll("select").forEach(el => el.disabled = true)
			buttonContainer.classList.add("hidden")
			if (!buttonTriggerShow?.onclick) buttonTriggerShow.onclick = onShow
		}

		const onShow = () => {
			buttonTriggerHide = el.querySelector(".button-trigger-hide")
			const form = el.querySelector("form")
			const buttonContainer = el.querySelector(".button-container")
			form.querySelectorAll("input").forEach(el => el.disabled = false)
			form.querySelectorAll("select").forEach(el => el.disabled = false)
			buttonContainer.classList.remove("hidden")
			if (!buttonTriggerHide?.onclick) buttonTriggerHide.onclick = onHide
		}

		buttonTriggerShow.onclick = onShow
		buttonTriggerHide.onclick = onHide
	}

	document.querySelectorAll(".form-update-container").forEach(handleFormState)
	document.body.addEventListener("reload-event", () => setTimeout(() => {
		document.querySelectorAll(".form-update-container").forEach(handleFormState)
	}, 100))
})