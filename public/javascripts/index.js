const addPlantListings = () => {
    fetch("http://localhost:3000/plants")
        .then(function(res) {
            return res.json();
        }).then(function(data) {
            const plants = data;
            const element = document.getElementById("plant-cards-container");

            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }

            for (const plant of plants) {
                element.appendChild(createPlantCard(plant));
            }
        });
}

const createPlantCard = (plant) => {
    console.log(plant)
    const newDiv = document.createElement("div");
    newDiv.setAttribute("class", "plant-card");

    newDiv.addEventListener("onclick", () => {
        location.href = `plant?id=${plant._id}`;
    });

    const img = document.createElement("img");
    img.setAttribute("src", plant.photo);

    const caption = document.createElement("figcaption");
    caption.innerHTML = plant.identification.name;

    newDiv.appendChild(img);
    newDiv.appendChild(caption);

    return newDiv;
}

addPlantListings();

