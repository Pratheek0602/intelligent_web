document.getElementById("add_plant").addEventListener("submit", function(e) {
	e.preventDefault();
	let imageUpload = document.getElementById("upload_photo");
	image = imageUpload.files[0];

	if (image) {
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = () => {
			let base64 = reader.result;
			console.log(base64)
			let base64Input = document.createElement("input");
			base64Input.setAttribute("type", "hidden");
			base64Input.setAttribute("name", "base64Image");
			base64Input.setAttribute("id", "base64Image");
			base64Input.setAttribute("value", base64);
			document.getElementById("add_plant").appendChild(base64Input);

			document.getElementById("add_plant").submit();
		};
		reader.onerror = () => {
			console.log("Error converting image");
		};
	};
});
//
