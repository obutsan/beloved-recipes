//Spoonacular API

const spoonAPI_KEY = "e45feb6b607140ccb6606be1e50094dc";
const spoonURL = "https://api.spoonacular.com/recipes/complexSearch";
const spoonacularURL = "https://api.spoonacular.com/recipes";


// function that gets recipes by type

async function filterRecipes(type) {
  try {
    const response = await fetch(
      `${spoonURL}?number=12&apiKey=${spoonAPI_KEY}&type=${type}`
    );
    const data = await response.json();
    document.getElementById("recipes").innerHTML = ""; // Clear previous results 

    for (const recipe of data.results) {
      const recipeDetails = await fetchRecipeDetails(recipe.id);
      if (recipeDetails) {
        renderCard(recipeDetails, recipeDetails.servings, recipeDetails.id);
      }
    }
    return data.results;
  } catch (error) {
    displayErrorMessage();
  }
}


// function that get random recipes
async function getSpoonacularRandom() {
  console.log('hello');
  try {
    const response = await fetch(
      `${spoonacularURL}/random?number=12&apiKey=${spoonAPI_KEY}`
    );
    const data = await response.json();
    console.log(data.recipes);
    for (const recipe of data.recipes) {
        renderCard(recipe, recipe.servings, recipe.id);
    }
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
    console.log(data);
    return { name: data.title, link: data.sourceUrl };
  } catch (error) {
    displayErrorMessage();
  }
}

const recipesContainer = $("#recipes");
const modal = document.querySelector("dialog");

//function to render cards

function renderCard(recipe, servings, id) {
  let cardCol = $('<div class="col">');
  let cardEl = $('<div class="card h-100">').attr("data-id", id);
  let cardImg = $('<img class="card-img-top" alt="recipe img">').attr(
    "src",
    recipe.image || "./assets/images/icons/placeholder.png" // Default image if none is provided
  );

  let cardBody = $('<div class="card-body">');
  let cardTitle = $('<h5 class="card-title">').text(recipe.title);
  let bottomRow = $('<div class="row align-items-center">');
  
  let timeColumn = $('<div class="col">');
  if (recipe.readyInMinutes) {
    let clockIcon = $('<img width="25" height="25" src="./assets/images/icons/clock.png" alt="clock icon"/>');
    let cookingTime = $('<p class="card-text time">').text(`${recipe.readyInMinutes} min`);
    timeColumn.append(clockIcon, cookingTime);
  }

  // Servings column
  let servingsColumn = $('<div class="col">');
  if (servings) {
    servingsColumn.append(
      $(
        '<img width="25" height="25" src="./assets/images/icons/waiter.png" alt="servings icon"/>'
      ),
      $('<p class="card-text servings">').text(`${servings} pers.`)
    );
  }

  // Favourites column
  let favoriteColumn = $('<div class="col-auto">');
  let favouriteIcon = $(
    '<img class="favouriteIcon" width="25" height="25" src="./assets/images/icons/cookbookNotAdded.png" style="margin-bottom:20px" alt="Not Favorite Icon"/>'
  );
  favoriteColumn.append(favouriteIcon);

   // delete column
   let deleteColumn = $('<div class="col-auto">');
   let deleteIcon = $(
     '<img class="deleteIcon" width="25" height="25" src="./assets/images/icons/delete.png" style="margin-bottom:20px" alt="Not Favorite Icon"/>'
   );
   deleteColumn.append(deleteIcon);

  // add all elements to recipe card
  if(recipe.status) {
    console.log('1');
    bottomRow.append(timeColumn, servingsColumn, deleteColumn);
  } else {
    console.log('2');
  bottomRow.append(timeColumn, servingsColumn, favoriteColumn);
  }
  cardBody.append(cardTitle, bottomRow);
  cardEl.append(cardImg, cardBody);

  cardCol.append(cardEl);

if(recipe.status) {
  $(".offcanvas-body").append(cardCol);
} else {
 $(".card-deck").append(cardCol);
}
}


// function to show notification
function showNotification(message, favouriteIcon, isError = false) {
       const notification = $("<div>")
      .addClass("notification")
      .toggleClass("error", isError)
      .text(message);
  
    $("body").append(notification);
  
    const iconOffset = favouriteIcon.offset();
    notification.css({
      top: iconOffset.top - 10, 
      left: iconOffset.left + favouriteIcon.outerWidth() + 10, 
      position: "absolute",
    });
  
    notification.fadeIn();

    setTimeout(() => {
      notification.fadeOut(() => notification.remove());
    }, 1500);
  }


// toggle function to handle favourites
function toggleFavourite(recipe, favouriteIcon) {
  let favorites = JSON.parse(localStorage.getItem("favouriteRecipes")) || [];
  
  // Check if the recipe is already in favorites

  const existingRecipeIndex = favorites.findIndex((fav) => fav.id === recipe.id);

if (existingRecipeIndex !== -1) {
  // Recipe exists, remove it from favorites
  favorites.splice(existingRecipeIndex, 1);
  favouriteIcon.attr("src", "./assets/images/icons/cookbookNotAdded.png");
  showNotification("Recipe removed from favourites", favouriteIcon, true);
} else {
  // Recipe does not exist, add it to favorites
  favorites.push(recipe);
  favouriteIcon.attr("src", "./assets/images/icons/cookbookAdded.png");
  showNotification("Recipe added to favourites", favouriteIcon);
}

// Save updated favorites back to localStorage
localStorage.setItem("favouriteRecipes", JSON.stringify(favorites));
  
}

 // Card click event listener to open modal or toggle favorite
 $(".card-deck").on("click", ".card", function (e) {
    const card = e.currentTarget;
    const cardId = card.getAttribute("data-id");
    const target = $(e.target);
    console.log(e.currentTarget);
    console.log(target);
    
    if (target.hasClass("favouriteIcon")) {
            // Extract the recipe ID
            const id = card.getAttribute("data-id");
  
            // Extract the recipe title
            const title = card.querySelector(".card-title").textContent;
        
            // Extract the recipe image URL
            const image = card.querySelector(".card-img-top").getAttribute("src");
        
            // Extract the ready in minutes
            const readyInMinutes = card.querySelector(".time").textContent.replace(" min", "");
        
            // Extract the servings
            const servings = card.querySelector(".servings").textContent.replace(" pers.", "");
        
            // Create the recipeData object
            const recipeData = {
              id: id,
              title: title,
              image: image,
              readyInMinutes: parseInt(readyInMinutes, 10),
              servings: parseInt(servings, 10),
              status: 'favourite',
            };
        
            console.log("Extracted Recipe Data:", recipeData);
      // Toggle favorite if the favorite icon is clicked
      toggleFavourite(recipeData, target);
    } else {
      // Otherwise, render card description
      modal.showModal();
      renderRecipePage(cardId);
      $(".modal-body").text("");
    }
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

// Handle the clicking on close button
$(".close").on("click", (e) => {
  e.preventDefault();
  modal.close();
});

// Filter button event listener
  $(".filter").on("click", function (e) {
    filterRecipes(e.target.id);
  });


// function to display favourites

function displayFavourites() {
  const fav = JSON.parse(localStorage.getItem("favouriteRecipes")) || [];
  const offcanvasBody = $(".offcanvas-body");
  console.log(fav);
  offcanvasBody.empty();
  fav.forEach(recipe => renderCard(recipe, recipe.servings, recipe.id));
}

// add listener to favourite button
$(document).on("click", ".cookbook", function () {
    displayFavourites();
  });

// Clear all favorites
$("#clearLocalStorageBtn").on("click", function () {
    localStorage.clear();
    displayFavourites();
  });

//function to delete from favourites

function deleteFromFavourites(id) {
  let favorites = JSON.parse(localStorage.getItem("favouriteRecipes")) || [];
  const existingRecipeIndex = favorites.findIndex((fav) => fav.id === id);
  console.log(id);
  console.log(existingRecipeIndex);
  favorites.splice(existingRecipeIndex, 1);
  localStorage.setItem("favouriteRecipes", JSON.stringify(favorites));
}

// add listener to delete button

$(".offcanvas-body").on("click", ".card", function (e) {
    const card = e.currentTarget;
    const cardId = card.getAttribute("data-id");
    const target = $(e.target);
    console.log(e.currentTarget);
    console.log(target);
    
    if (target.hasClass("deleteIcon")) {
      deleteFromFavourites(cardId); 
      displayFavourites();    
    } else {
      // Otherwise, render card description
      modal.showModal();
      renderRecipePage(cardId);
      $(".modal-body").text("");
    }
  });


// Function to handle search 

async function searchRecipes(query) {
  if (!query || query.trim() === "") {
    alert("Please enter a valid recipe name.");
    return;
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://api.spoonacular.com/recipes/autocomplete?number=12&query=${encodedQuery}&apiKey=${spoonAPI_KEY}`;

  console.log(`Searching for: ${query}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    document.getElementById("recipes").innerHTML = ""; // Clear previous results
    console.log("Fetched recipes:", data);

    for (const recipe of data) {
      const recipeDetails = await fetchRecipeDetails(recipe.id);
      if (recipeDetails) {
        renderCard(recipeDetails, recipeDetails.servings, recipeDetails.id);
      }
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
    alert("An error occurred while fetching recipes. Please check your internet connection or try again later.");
  }
}

// Helper function to fetch detailed recipe data

async function fetchRecipeDetails(id) {
  const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${spoonAPI_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching details for recipe ID ${id}:`, error);
    return null;
  }
}

// add event listenet to search form
  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const query = document.getElementById("query").value.trim();
    searchRecipes(query);
  });

// function to render recipe description
async function renderRecipePage(recipeId) {
  const recipeDetailsUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${spoonAPI_KEY}`;

  try {
    const response = await fetch(recipeDetailsUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const recipe = await response.json();

    // Container for recipe details
    const recipeContainer = document.createElement("div");
    recipeContainer.className = "recipe-page";

    // Recipe content
    recipeContainer.innerHTML = `
      <div class="recipe-header">
        <h2>${recipe.title}</h2>
      </div>
      <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" />
      <h3 class='subtitle'>Ingredients</h3>
        <ul class="ingredients-list">
          ${recipe.extendedIngredients
            .map(
              (ingredient) =>
                `<li>${ingredient.original}</li>`
            )
            .join("")}
        </ul>    
      <h3 class='subtitle'>Instructions</h3>
      <ol class="recipe-instructions">
        ${recipe.analyzedInstructions.length
          ? recipe.analyzedInstructions[0].steps
              .map((step) => `<li>${step.step}</li>`)
              .join("")
          : "<p>No instructions available</p>"}
      </ol>
      <div class="recipe-actions">
        <button id="addToFavorites" class="btn-action" type='button'>
          <img src="./assets/images/icons/cookbook.png" alt="add to book" class="cookbook" width="35" height="35"/>
          <span class="tooltip">Add to Book</span>
        </button>
        <button id="printRecipe" class="btn-action" type='button'>
          <img src="./assets/images/icons/print.png" alt="print" class="print" width="35" height="35"/>
          <span class="tooltip">Print Recipe</span>  
        </button>
        <button id="shareButton" class="btn-action" type='button'>
          <img src="./assets/images/icons/share.png" alt="share" class="share" width="35" height="35"/>
          <span class="tooltip">Share Recipe</span>
        </button>
      </div>
    `;

    // Append to the body or a main container
    document.querySelector(".modal-body").appendChild(recipeContainer);
    //$(".modal-body").append(recipeCardDiscreption);

    // Add Event Listeners
    document.getElementById("printRecipe").addEventListener("click", () => window.print());

  } catch (error) {
    console.error("Error fetching recipe details:", error);
    alert("An error occurred while fetching the recipe details. Please try again.");
  }
}

/*// Створення елемента пагінації
const paginationElement = document.createElement("div");
paginationElement.id = "pagination";
document.body.appendChild(paginationElement); // Додаємо до DOM

// Тепер можна ініціалізувати обсервер
const observer = new IntersectionObserver(
  async (entries) => {
    if (entries[0].isIntersecting) {
      currentPage++;
      await filterRecipes("main course", currentPage); // Замініть "main course" на бажаний тип
    }
  },
  { threshold: 1.0 }
);
observer.observe(paginationElement);




observer.observe(document.getElementById("pagination")); // Спостерігаємо за контейнером пагінації
*/

// Initial random recipes fetch

getSpoonacularRandom();


async function testRandomRecipes() {
    try {
        const response = await fetch(`${spoonacularURL}/random?number=1&apiKey=${spoonAPI_KEY}`);
        const data = await response.json();
        console.log("Random recipe:", data);
        if (!data.recipes || !data.recipes.length) {
            console.error("No recipes returned");
        }
    } catch (error) {
        console.error("Test failed:", error);
    }
}
testRandomRecipes();
