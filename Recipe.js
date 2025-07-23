const Searchinput = document.getElementById("search-input");
const Searchbtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const resultHeading = document.getElementById("result-heading");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

Searchbtn.addEventListener("click", searchmeal);

mealsContainer.addEventListener("click", handlemealClick);

backBtn.addEventListener("click", () => mealDetails.classList.add("hidden"));

Searchinput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchmeal();
});

async function searchmeal() {
  const searchTerm = Searchinput.value.trim();

  if (!searchTerm) {
    errorContainer.textContent = "Please enter a search term";
    errorContainer.classList.remove("hidden");
    return;
  }

  try {
    resultHeading.textContent = `Searching for ${searchTerm}...`;
    mealsContainer.innerHTML = "";
    errorContainer.classList.add("hidden");

    const response = await fetch(`${SEARCH_URL}${searchTerm}`);
    const data = await response.json();

    console.log("data is here:", data);

    if (data.meals == null) {
      resultHeading.textContent = ``;
      mealsContainer.innerHTML = "";
      errorContainer.textContent = `No recipes found for ${searchTerm} Try another search term!`;
      errorContainer.classList.remove("hidden");
    } else {
      resultHeading.textContent = `Search result for "${searchTerm}"`;
      dispalymeals(data.meals);
      Searchinput.value = "";
    }
  } catch (error) {
    errorContainer.textContent = "Someting went wrong. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}

function dispalymeals(meals) {
  mealsContainer.innerHTML = "";
  meals.forEach((meal) => {
    mealsContainer.innerHTML += `
       <div class="meal" data-meal-id="${meal.idMeal}">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="meal-info">
        <h3 class="meal-title">${meal.strMeal}</h3>
        ${
          meal.strCategory
            ? `<div class="meal-category">${meal.strCategory}</div>`
            : ""
        }
      </div>
    </div>
    `;
  });
}

async function handlemealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.getAttribute("data-meal-id");

  try {
    const response = await fetch(`${LOOKUP_URL}${mealId}`);
    const data = await response.json();

    if (data.meals && data.meals[0]) {
      const meal = data.meals[0];

      const ingredients = [];

      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== "") {
          ingredients.push({
            ingredient,
            measure,
          });
        }
      }

      mealDetailsContent.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${
        meal.strMeal
      }" class="meal-details-img" />
        <h2 class="meal-details-title">${meal.strMeal}</h2>
        <h4 class="meal-details-category">
          <span>${meal.strCategory || "Uncategorized"}</span>
        </h4>
        <div class="meal-details-instructions">
          <h3>Instructions</h3>
          <p>${meal.strInstructions}</p>
        </div>
        <div class="meal-details-ingredients">
          <h3>Ingredients</h3>
          <ul class="ingredients-list">
            ${ingredients
              .map(
                (item) =>
                  `<li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>`
              )
              .join("")}
          </ul>
        </div>
        ${
          meal.strYoutube
            ? `<a href="${meal.strYoutube}" target="_blank" class="youtube-link">
                 <i class="fab fa-youtube"></i> Watch Video
               </a>`
            : ""
        }
      `;

      mealDetails.classList.remove("hidden");
      mealDetails.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    console.error("Error fetching meal details:", error);
    errorContainer.textContent =
      "Failed to load meal details. Please try again.";
    errorContainer.classList.remove("hidden");
  }
}
