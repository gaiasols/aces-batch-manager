function setValueLocalGmtInput() {
	document.querySelectorAll('input[type="hidden"][name="gmt"]').forEach(el => {
		el.value = new Date().toString().split(" ")[5]
	})
}

document.addEventListener('DOMContentLoaded', function() {
	setValueLocalGmtInput()
})