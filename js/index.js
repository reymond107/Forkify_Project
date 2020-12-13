const searchField = document.querySelector('.search__field');
const searchBtn = document.querySelector(".search__btn");
const recipeList = document.querySelector('.results__list');
const recipes = document.querySelector('.recipe');



class Ingredient {
    constructor(portion, name) {
        this.portion = portion;
        this.name = name;
        this.currentAmount = portion;
    }
}

function parseIngredients(ingredients) {
    let ingredientArray = [];
    ingredients.forEach(element => {
        let str = element.split(" ");
        let portionSize = str[0];
        let ingredientName = str.slice(1).join(" ");
        let ingredientObject = new Ingredient(portionSize, ingredientName);
        ingredientArray.push(ingredientObject)
    });
    return ingredientArray;
}





searchBtn.addEventListener('click', e => {
    e.preventDefault();

    let url = `https://forkify-api.herokuapp.com/api/search?q=${searchField.value}`
    fetch(url)
        .then(res => res.json())
        .then(data => {
            recipeList.innerHTML = "";
            let result = data.recipes;

            for (let i = 0; i < result.length; i++) {

                let liTemplate =
                    `<li recipe_id="${result[i].recipe_id}" onclick="getId(this)">
                    <a class="results__link onclick="getId" results__link--active"  href="javascript:void(0);">
                        <figure class="results__fig">
                            <img src="${result[i].image_url}" alt="Test">
                        </figure>
                    <div class="results__data">
                        <h4 class="results__name">${result[i].title}</h4>
                        <p class="results__author">${result[i].publisher}</p>
                    </div>
                    </a>
                </li>`

                recipeList.innerHTML += liTemplate;
                search();
            }
            return data;
        })
        .catch(err => console.log(err))

});


let getId = target => {
    console.log(target.getAttribute("recipe_id"));
    let pickedRecipe = target.getAttribute("recipe_id");
    let pickedRecipeUrl = `https://forkify-api.herokuapp.com/api/get?rId= ${pickedRecipe}`;


    console.log();

    fetch(pickedRecipeUrl)
        .then(res => res.json())
        .then(data => {
            let result = data.recipe;
            console.log(result);
            console.log(result.title);
            console.log(result.ingredients);
            let servingTime = 15;

            let recipeTemplate =
                `<figure class="recipe__fig" >
                <img src="${result.image_url}" alt="Tomato" class="recipe__img">
                    <h1 class="recipe__title">
                        <span>${result.title}</span>
                    </h1>
                </figure>
                <div class="recipe__details">
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="img/icons.svg#icon-stopwatch"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--minutes">15</span>
                    <span class="recipe__info-text"> minutes</span>
                </div>
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="img/icons.svg#icon-man"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--people"></span>
                    <span class="recipe__info-text"> servings</span>

                    <div class="recipe__info-buttons">
                        <button class="btn-tiny" onclick="minus()">
                            <svg>
                                <use href="img/icons.svg#icon-circle-with-minus"></use>
                            </svg>
                        </button>
                        <button class="btn-tiny" onclick="plus()">
                            <svg>
                                <use href="img/icons.svg#icon-circle-with-plus"></use>
                            </svg>
                        </button>
                    </div>
                </div>
                    <button class="recipe__love">
                        <svg class="header__likes">
                            <use href="img/icons.svg#icon-heart-outlined"></use>
                        </svg>
                    </button>
                </div>
                <div class="recipe__ingredients">
                <ul class="recipe__ingredient-list">



            </ul>
                
                    <button class="btn-small recipe__btn">
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-shopping-cart"></use>
                    </svg>
                    <span>Add to shopping list</span>
                    </button>
                </div>
                <div class="recipe__directions">
                    <h2 class="heading-2">How to cook it</h2>
                    <p class="recipe__directions-text">
                        This recipe was carefully designed and tested by
                        <span class="recipe__by">${result.publisher}</span>. Please check out directions at their website.
                    </p>
                    <a class="btn-small recipe__btn" href="${result.source_url}" target="_blank">
                        <span>Directions</span>
                        <svg class="search__icon">
                            <use href="img/icons.svg#icon-triangle-right"></use>
                        </svg>
                    </a>
                </div>`

            recipes.innerHTML = recipeTemplate;
            return data;
        })
        .then(data => {
            let list = data.recipe.ingredients;

            parseIngredients(list).forEach(element => {
                let list1 =
                    `<li class="recipe__item">
                <svg class="recipe__icon">
                <use href="img/icons.svg#icon-check"></use>
                </svg>
                <div class="recipe__count">${element.portion}</div>
                <div class="recipe__ingredient">
                <span class="recipe__unit"></span>
                ${element.name}
                </div>
                </li>`
                document.querySelector('.recipe__ingredient-list').innerHTML += list1;
            });

            return data;
        })
        .then(data => {
            let list = data.recipe.ingredients;
            const addToShop = document.querySelector('.recipe__btn')
                //     // console.log(addToShop);
            addToShop.addEventListener('click', () => {
                // console.log(parseIngredients(list));
                console.log('clicked');
                const shopList = document.querySelector('.shopping__list')


                parseIngredients(list).forEach(element => {

                    let shopItem =
                        `<li class="shopping__item" id="list" >
                        <div class="shopping__count">
                            <input type="number" value="${element.portion}" step="100">
                            <p></p>
                        </div>
                        <p class="shopping__description">${element.name}</p>
                        <button class="shopping__delete btn-tiny" onclick="hide(this)">
                            <svg>
                                <use href="img/icons.svg#icon-circle-with-cross"></use>
                            </svg>
                        </button>
                        </li>`

                    shopList.innerHTML += shopItem;
                });

            })
            return data;
        })
        .then(data => {
            let result = data.recipe;
            const heartBtn = document.querySelector('.recipe__love');
            let count = 0;


            heartBtn.addEventListener('click', () => {
                console.log('clicked');
                count += 1;

                // console.log(count);

                let likedList = [];
                let likedItem =
                    `<li>
                        <a class="likes__link" onclick="getId" href="javascript:void(0)">
                            <figure class="likes__fig">

                                <img src="${result.image_url}" alt="${result.title}">
                            </figure>
                            <div class="likes__data">
                                <h4 class="likes__name">${result.title}...</h4>
                                <p class="likes__author">${result.publisher}</p>
                            </div>
                        </a>
                    </li>`

                if (count % 2 !== 0) {
                    likedList.push(likedItem);
                    document.querySelector('.likes__list').innerHTML += likedItem;
                } else {
                    likedList.pop(likedItem)
                    document.querySelector('.likes__list').innerHTML = "";
                }
            })
            return data;
        })
        .then(data => {
            let result = data.recipe;
            const addOrMinus = document.querySelector('.recipe__info-buttons');
            addOrMinus.addEventListener('click', () => {
                console.log('clicked');
            })
            return data;
        })
}


// FUNCTIONS

let search = () => {
    searchField.value = "";
}