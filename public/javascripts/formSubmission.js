import { addPlantToSync, getAllAddedPlantsToSync, deleteSyncedPlants, syncPlants } from './idb-utility.js';

document.getElementById("add_plant").addEventListener("submit", function(e) {
    e.preventDefault();
    let imageUpload = document.getElementById("upload_photo");
    let image = imageUpload.files[0];

    if (image) {
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
            let base64 = reader.result;
            console.log(base64);
            let base64Input = document.createElement("input");
            base64Input.setAttribute("type", "hidden");
            base64Input.setAttribute("name", "base64Image");
            base64Input.setAttribute("id", "base64Image");
            base64Input.setAttribute("value", base64);
            document.getElementById("add_plant").appendChild(base64Input);

            // Check if the user is online
            if (navigator.onLine) {
				syncPlants()
                //  If online, submit the form to the server
                // getAllAddedPlantsToSync().then((plantsToSync) => {
				// 	for (const plantData of plantsToSync) {

                //         const formData = new URLSearchParams();
                //         formData.append("date_time_seen", plantData.date);
                //         formData.append("location", plantData.location);
                //         formData.append("description", plantData.description);
                //         formData.append("plant_height", plantData.size.height);
                //         formData.append("plant_spread", plantData.size.spread);
                //         formData.append("checkbox1", plantData.characteristics.flowers);
                //         formData.append("checkbox2", plantData.characteristics.leaves);
                //         formData.append("checkbox3", plantData.characteristics.fruits);
                //         formData.append("checkbox4", plantData.characteristics.thorns);
                //         formData.append("checkbox5", plantData.characteristics.seeds);
                //         formData.append("sun_exposure", plantData.sunExposure);
                //         formData.append("identification_name", plantData.identification.name);
                //         formData.append("base64Image", plantData.photo);
                //         formData.append("user_nickname", plantData.user);

                //         fetch('http://localhost:3000/add-plant', {
                //             method: 'POST',
                //             body: formData,
                //             headers: {
                //                 'Content-Type': 'application/x-www-form-urlencoded'
                //             },
                //         }).then(() => {
                //             console.log('Service Worker: Syncing new Todo: ', formData, ' done');
                //         }).catch((err) => {
                //             console.log('Service Worker: Syncing new Todo: ', formData, ' failed');
                //         });
                //     };
                // },
				document.getElementById("add_plant").submit()
            } else {
                // If offline, store the data in IndexedDB
                console.log("offline submit", document.getElementById("add_plant"))
                storePlantInIDB();
            }
        };
        reader.onerror = () => {
            console.log("Error converting image");
        };
    }
});

function storePlantInIDB() {
    let plantData = {
        date: document.getElementById('date_time_seen').value,
        location:  document.getElementById('location').value,
        description: document.getElementById('description').value,
        size: {
            height: document.getElementById('plant_height').value,
            spread: document.getElementById('plant_spread').value
        },
        characteristics: {
            flowers: document.querySelector('[name="flowers"]').checked,
            leaves: document.querySelector('[name="leaves"]').checked,
            fruits: document.querySelector('[name="fruits"]').checked,
            thorns: document.querySelector('[name="thorns"]').checked,
            seeds: document.querySelector('[name="seeds"]').checked
        },
        sunExposure: document.getElementById('sun_exposure').value,
		identification: {
			name: document.getElementById('identification_name').value,
			status: "In Progress",
		},
		photo: document.getElementById('base64Image').value,
		user: document.getElementById('user_nickname').value,
		chatMessages: [] 
    };

    // Use the IndexedDB utility to store the plant
    addPlantToSync(plantData);
}
