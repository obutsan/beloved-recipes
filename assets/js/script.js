//Spoonacular API

const spoonAPI_KEY = "e45feb6b607140ccb6606be1e50094dc";
const spoonURL = "https://api.spoonacular.com/recipes/complexSearch";
const spoonacularURL = "https://api.spoonacular.com/recipes";

// Ninja Nutrition API
const nutritionAPI_KEY = "cdNqZImiN0YKg9Zkpdz3ow==7vSXmA0YWuPePX5J";

// function that gets recipes by type

async function getSpoonacularRecipe(type) {
  try {
    const response = await fetch(
      `${spoonURL}?number=4&apiKey=${spoonAPI_KEY}&type=${type}`
    );
    const data = await response.json();
    cleanRenderCard();
    console.log(data.results);
    for (const recipe of data.results) {
        // Render the card with the obtained nutrition information
        renderCard(recipe, recipe.servings, recipe.id);
    }
    //addCardEventListener();
    return data.results;
  } catch (error) {
    displayErrorMessage();
  }
}


// function that get random recipes
async function getSpoonacularRandom() {
  try {
    const response = await fetch(
      `${spoonacularURL}/random?number=4&apiKey=${spoonAPI_KEY}`
    );
    const data = await response.json();
    console.log(data.recipes);
    for (const recipe of data.recipes) {
        // Render the card with the obtained nutrition information
        renderCard(recipe, recipe.servings, recipe.id);
    }
    //addCardEventListener();
  } catch (error) {
    displayErrorMessage();
  }
}

//Get the recipe details by the Id

async function getDetailsById(recipeId) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${spoonAPI_KEY}`
    );
    const data = await response.json();
    return { name: data.title, link: data.sourceUrl };
  } catch (error) {
    displayErrorMessage();
  }
}

// function that render recipe description

async function renderDescriptionCard(id) {
  try {
    const response = await fetch(
      `${spoonacularURL}/${id}/card?apiKey=${spoonAPI_KEY}`
    );
    const data = await response.json();
    let recipeCardDiscreption = $("<img>", {
      class: "modalImg",
      src: data.url,
      alt: "Recipe description",
    });
    $(".modal-body").append(recipeCardDiscreption);
  } catch (error) {
    displayErrorMessage();
  }
}


// function that render recipes cards

const recipesContainer = $("#recipes");
const modal = document.querySelector("dialog");

function renderCard(recipe, servings, id) {
  let cardEl = $('<div class="card" style="width: 15rem;">').attr("data-id", id);
  let cardImg = $('<img class="card-img-top" alt="recipe img">').attr("src", recipe.image);
  let cardBody = $('<div class="card-body">');
  let cardTitle = $('<h5 class="card-title">').text(recipe.title);

  // row to hold card-text and favorite icon
  let bottomRow = $('<div class="row align-items-center">');

  // Cooking time column
  let timeColumn = $('<div class="col">');
  if (recipe.readyInMinutes) {
    let clockIcon = $('<span class="material-symbols-outlined">timer</span>');
    let cookingTime = $('<p class="card-text">').text(`${recipe.readyInMinutes} min`);
    timeColumn.append(clockIcon, cookingTime);
  }

  // Servings column
  let servingsColumn = $('<div class="col">');
  if (servings) {
    servingsColumn.append(
      $(
        '<img width="25" height="25" src="./assets/images/icons/persons.png" alt="servings icon"/>'
      ),
      $('<p class="card-text">').text(`${servings} pers.`)
    );
  }

  // Favorite icon column
  let favoriteColumn = $('<div class="col-auto">');
  let favouriteIcon = $(
    '<img class="favouriteIcon" width="25" height="25" style="margin-bottom:20px" src="./assets/images/icons/notfavourite.png" alt="Not Favorite Icon"/>'
  );
  favoriteColumn.append(favouriteIcon);

  bottomRow.append(timeColumn, servingsColumn, favoriteColumn);
  cardBody.append(cardTitle, bottomRow);
  cardEl.append(cardImg, cardBody);

  // Append each card to the card deck
  $(".card-deck").append(cardEl);

}

// toggle function to handle favourites

function toggleFavourite(recipeID, favouriteIcon) {
    let fav = JSON.parse(localStorage.getItem("favouriteRecipes")) || [];
  
    // Check if recipeID is already in favorites
    if (fav.includes(recipeID)) {
      // Remove the recipeID from favorites
      fav = fav.filter(id => id !== recipeID);
      favouriteIcon.attr("src", "./assets/images/icons/notfavourite.png");
    } else {
      // Add the recipeID to favorites
      fav.push(recipeID);
      favouriteIcon.attr("src", "./assets/images/icons/favourite.png");
    }
  
    // Save updated favorites back to localStorage
    localStorage.setItem("favouriteRecipes", JSON.stringify(fav));
  }

 // Card click event listener to open modal or toggle favorite
 $(".card-deck").on("click", ".card", function (e) {
    const card = e.currentTarget;
    const cardId = card.getAttribute("data-id");
    const target = $(e.target);
    
    if (target.hasClass("favouriteIcon")) {
      // Toggle favorite if the favorite icon is clicked
      toggleFavourite(cardId, target);
    } else {
      // Otherwise, render card description
      renderDescriptionCard(cardId);
      modal.showModal();
      $(".modal-body").text("");
    }
  });


// Handle the clicking on close button

$(".close").on("click", (e) => {
  e.preventDefault();
  modal.close();
});

// Function to inform the user of a error while fetching the data.

function displayErrorMessage() {
  if (bootstrap == undefined) {
    document
      .getElementById("browser-not-supported-container")
      .classList.remove("d-none");
  } else {
    let modal1 = bootstrap.Modal.getOrCreateInstance("#modal1");
    modal1.show();
  }
}

// Filter button event listener
  $(".filter").on("click", function (e) {
    getSpoonacularRecipe(e.target.id);
  });

function cleanRenderCard() {
  const recipeSection = $("#recipes");
  recipeSection.empty();
}

function displayFavourites() {
  const fav = JSON.parse(localStorage.getItem("favouriteRecipes")) || [];
  const offcanvasBody = $(".offcanvas-body");

  offcanvasBody.empty();

  // Loop through each favorite recipe ID and render details
  fav.forEach(async (recipeId) => {
    const recipeDetails = await getDetailsById(recipeId);
    if (recipeDetails) {
      const favoriteItem = $(
        `<p>${recipeDetails.name}</p><a href="${recipeDetails.link}" target="_blank">View Recipe</a><hr>`
      );
      offcanvasBody.append(favoriteItem);
    }
  });
}

// Display favorite recipes in the offcanvas
$(document).on("click", ".material-icons", function () {
    displayFavourites();
  });

// Clear all favorites
$("#clearLocalStorageBtn").on("click", function () {
    localStorage.clear();
    displayFavourites();
  });

// Function to handle search 


// Search button functionality
  $("#searchButton").on("click", function () {
    const selectedMealType = $("#searchInput").val().toLowerCase();
    getSpoonacularRandom(selectedMealType);
  });


// Initial random recipes fetch
getSpoonacularRandom();


