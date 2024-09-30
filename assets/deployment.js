document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll(".card-time-settings").forEach(el => {
		let buttonTriggerShow = el.querySelector(".button-trigger-show")
		let buttonTriggerHide = el.querySelector(".button-trigger-hide")

		const onHide = () => {
			buttonTriggerShow = el.querySelector(".button-trigger-show")
			const form = el.querySelector("form")
			const buttonContainer = el.querySelector(".button-container")
			form.querySelectorAll("input.input").forEach(el => el.disabled = true)
			buttonContainer.classList.add("hidden")
			if(!buttonTriggerShow?.onclick) buttonTriggerShow.onclick = onShow
		}

		const onShow = () => {
			buttonTriggerHide = el.querySelector(".button-trigger-hide")
			const form = el.querySelector("form")
			const buttonContainer = el.querySelector(".button-container")
			form.querySelectorAll("input.input").forEach(el => el.disabled = false)
			buttonContainer.classList.remove("hidden")
			if(!buttonTriggerHide?.onclick) buttonTriggerHide.onclick = onHide
		}
		
		buttonTriggerShow.onclick = onShow
		buttonTriggerHide.onclick = onHide
	})
})