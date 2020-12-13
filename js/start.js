class Recipe {
    constructor(recipeId, name, publisher, imgURL, source) {
        this.name = name;
        this.publisher = publisher;
        this.image = imgURL;
        this.source = source
        this.recipeId = recipeId
    }

    static parseRecipe(recipeObj) {
        let recipe = new Recipe(recipeObj.recipe_id, recipeObj.title, recipeObj.publisher, recipeObj.image_url, recipeObj.source_url)
        return recipe
    }

    // calcTime() {
    //     // Assuming that we need 15 min for each 3 ingredients
    //     const numIng = this.ingredients.length ?? 0;
    //     const periods = Math.ceil(numIng / 3);
    //     this.time = periods * 15 * this.servings
    // }

    createListItem() {
        let li = document.createElement('li')
        let a = document.createElement('a')
        let div = document.createElement('div')
        let img = document.createElement('img')
        let figure = document.createElement('figure')
        let h4 = document.createElement('h4')
        let p = document.createElement('p')

        a.classList.add('results__link')
        a.href = `#${this.recipeId}`

        div.classList.add('results__data')

        figure.classList.add('results__fig')
        img.src = this.image

        h4.classList.add('results__name')
        h4.innerHTML = this.name

        p.classList.add('results__author')
        p.innerHTML = this.publisher

        figure.appendChild(img)
        div.appendChild(h4)
        div.appendChild(p)

        a.appendChild(figure)
        a.appendChild(div)

        li.appendChild(a)
        this.itemElement = li
    }
}

class Ingredient {
    constructor(name, amount, unit) {
        this.name = name;
        this.baseAmount = amount;
        this.unit = unit.toLowerCase()
        this.currentAmount = amount
    }

    static parseIngredient(str) {
        let strArr = str.replace().replace(/ \([\s\S]*?\)/g, "").replace('-', ' ').split(' ')
        let name = ''
        let baseAmount = ''
        let unit = ''
        let wholeNumber = strArr[0]
        if (!isNaN(wholeNumber[0])) {
            let fraction = strArr[1]
            if (!isNaN(fraction[0])) {
                baseAmount = `${wholeNumber} ${fraction}`
                unit = strArr[2]
                name = strArr.slice(3).join(' ')
            } else {
                baseAmount = wholeNumber
                unit = fraction
                name = strArr.slice(2).join(' ')
            }
        } else {
            name = str
        }

        return new Ingredient(name, baseAmount, unit)

    }
    editAmount(mode) {
        if (this.baseAmount) {
            let newAmount = math[mode](math.fraction(this.currentAmount), math.fraction(this.baseAmount))
            this.currentAmount = newAmount.toFraction(1)
        }
    }
}

class ShopItem {
    constructor(name, amount, unit) {
        this.name = name;
        this.amount = amount;
        this.unit = ShopItem.unitDictionary[unit] ? unit
    }

    createItemElement(deleteCb) {
        let li = document.createElement('li')
        let div = document.createElement('div')
        let input = document.createElement('input')
        let pUnit = document.createElement('p')
        let p = document.createElement('p')
        let button = document.createElement('button')

        li.classList.add('shopping__item')
        div.classList.add('shopping__count')
        p.classList.add('shopping__description')
        button.classList.add('shopping__delete', 'btn-tiny')

        input.type = 'number'
        input.step = '0.1'
        if (this.amount) {
            input.value = this.amount
        } else {
            input.value = ''
            input.disabled = 'true'
        }
        input.onchange = (e) => {
            this.amount = input.value
        }

        pUnit.innerHTML = this.unit
        p.innerHTML = this.name

        button.innerHTML = '<svg><use href="../dist/img/icons.svg#icon-circle-with-cross"></use>/svg>'
        button.onclick = (e) => {
            button.parentElement.remove()
            deleteCb(this)

        }

        div.appendChild(input)
        div.appendChild(pUnit)

        li.appendChild(div)
        li.appendChild(p)
        li.appendChild(button)

        this.itemElement = li
    }
    updateElement() {
        this.itemElement.querySelector('input').value = this.amount ? this.amount : ''
    }

    static unitDictionary = {
        'gram': 'g',
        'grams': 'g',
        'tablespoon': 'tbsp',
        'tablespoons': 'tbsp',
        'tablespoons': 'tbsp',
        'teaspoon': 'tsp',
        'teaspoons': 'tsp',
        'ounce': 'oz',
        'ounces': 'oz',
        'pound': 'lbs',
        'pounds': 'lbs',
    }
}


class App {
    constructor() {}
    start() {
        RecipeListController.hideElements()
        RecipeController.hideElements()
        let searchCtrl = new SearchController()
        searchCtrl.addFormListener(this.searchCallback)
    }
    searchCallback(q) {
        let recipeListCtrl = new RecipeListController(10)
        recipeListCtrl.startRecipeList(q)
    }
}

class SearchController {
    constructor() {
        this.searchForm = document.querySelector('.search')
        this.input = document.querySelector('.search__field')
    }
    addFormListener(callback) {
        this.searchForm.addEventListener("submit", (e) => {
            e.preventDefault()
            callback(this.input.value)
            this.input.value = ''
        })
    }
}

class RecipeListController {
    constructor(pageSize) {
        this.recipeListEl = document.querySelector('.results__list')
        this.pagingEl = document.querySelector('.results__pages')
        this.loader = document.querySelector('.results .loader')
        this.prevBtn = document.querySelector('.results__pages > button.results__btn--prev')
        this.nextBtn = document.querySelector('.results__pages > button.results__btn--next')
        this.pageSize = pageSize
        this.recipeListURL = 'https://forkify-api.herokuapp.com/api/search?q='
    }
    startRecipeList(q) {
        this.currentQuery = q
        this.currentPage = 1
        this.addPagingListeners()
        this.getRecipeList()
    }
    getRecipeList() {
        this.showLoader()
        getJSON(this.recipeListURL + this.currentQuery)
            .then(data => {
                if (!data.error) {
                    this.totalPage = Math.ceil(parseInt(data.count) / this.pageSize)
                    let pageStart = (this.currentPage - 1) * this.pageSize
                    this.recipeList = data.recipes.slice(pageStart, pageStart + this.pageSize)
                        .map(current => Recipe.parseRecipe(current))
                    this.updateRecipeList()
                    this.updatePagingDisplay()
                    this.hideLoader()
                } else {
                    throw new Error('Could not find recipes');
                }
            }).catch(error => {
                alert(error.message)
                RecipeListController.hideElements()
            })
    }
    updateRecipeList() {
        this.recipeListEl.innerHTML = ''
        this.recipeList.forEach(current => {
            current.createListItem()
            this.recipeListEl.appendChild(current.itemElement)
            current.itemElement.onclick = this.recipeCallback(current)
        })

    }
    recipeCallback(recipe) {
        let recipeList = this.recipeListEl
        return function(e) {

            let prevActive = recipeList.querySelector('.results__link--active')
            if (prevActive) {
                prevActive.classList.remove('results__link--active')
            }
            recipe.itemElement.classList.add('results__link--active')

            let recipeCtrl = new RecipeController(recipe)
            recipeCtrl.showRecipe()
        }

    }
    addPagingListeners() {
        this.prevBtn.onclick = () => {
            this.currentPage--
                this.getRecipeList()
        }

        this.nextBtn.onclick = () => {
            this.currentPage++
                this.getRecipeList()
        }
    }
    updatePagingDisplay() {
        if (this.totalPage > 1) {
            if (this.currentPage > 1) {
                this.prevBtn.querySelector('span').innerHTML = `Page ${this.currentPage - 1}`
                show(this.prevBtn)
            } else {
                hide(this.prevBtn)
            }
            if (this.currentPage < this.totalPage) {
                this.nextBtn.querySelector('span').innerHTML = `Page ${this.currentPage + 1}`
                show(this.nextBtn)
            } else {
                hide(this.nextBtn)
            }
        } else {
            hide(this.prevBtn)
            hide(this.nextBtn)
        }
    }
    showLoader() {
        hide(this.recipeListEl)
        hide(this.pagingEl)
        show(this.loader)
    }
    hideLoader() {
        hide(this.loader)
        show(this.recipeListEl)
        show(this.pagingEl)
    }

    static hideElements() {
        let el = document.querySelectorAll('.results > *')
        Array.from(el).forEach(current => current.classList.add('hidden'))
    }

}

class RecipeController {
    constructor(recipe) {
        this.recipe = recipe
        this.recipeEl = document.querySelector('.recipe')
        this.figureEl = document.querySelector('.recipe__fig')
        this.detailsEl = document.querySelector('.recipe__details')
        this.ingredientsEl = document.querySelector('.recipe__ingredients')
        this.directionsEl = document.querySelector('.recipe__directions')
        this.likeBtn = document.querySelector('.recipe__love')
        this.loader = document.querySelector('.recipe .loader')
        this.recipeURL = 'https://forkify-api.herokuapp.com/api/get?rId='
    }
    static recipes = []
    showRecipe() {
        this.showLoader()

        let recipe = RecipeController.recipes.find(current => current.recipeId === this.recipe.recipeId)

        if (recipe) {
            this.addServingListener()
            this.addShoppingListener()
            this.addLikeListener()
            this.updateElements()
            this.hideLoader()
        } else {
            getJSON(this.recipeURL + this.recipe.recipeId)
                .then(data => {
                    if (!data.error) {
                        this.recipe.ingredients = []
                        data.recipe.ingredients.forEach(current => {
                            this.recipe.ingredients.push(Ingredient.parseIngredient(current))
                        })
                        this.recipe.servings = 1
                        this.recipe.calcTime()
                        this.addServingListener()
                        this.addShoppingListener()
                        this.addLikeListener()
                        this.updateElements()
                        RecipeController.recipes.push(this.recipe)
                        this.hideLoader()
                    } else {
                        throw new Error('Could not find recipe')
                    }
                })
                .catch(error => {
                    alert(error.message)
                    RecipeController.hideElements()
                })
        }

    }
    updateElements() {
        this.updateFigure()
        this.updateDetails()
        this.updateIngredients()
        this.updateDirections()
    }
    updateFigure() {
        this.figureEl.querySelector('img').src = this.recipe.image
        this.figureEl.querySelector('.recipe__title > span').innerHTML = this.recipe.name
    }
    updateDetails() {
        this.detailsEl.querySelector('.recipe__info-data--people').innerHTML = this.recipe.servings
        this.detailsEl.querySelector('.recipe__info-data--minutes').innerHTML = this.recipe.time
    }
    updateIngredients() {
        let list = this.ingredientsEl.querySelector('.recipe__ingredient-list')
        list.innerHTML = ''
        this.recipe.ingredients.forEach(current => {
            let li = document.createElement('li')
            let amount = document.createElement('div')
            let name = document.createElement('div')
            let span = document.createElement('span')
            let svg = '<svg class="recipe__icon"><use href="../dist/img/icons.svg#icon-check"></use></svg>'


            li.classList.add('recipe__item')
            amount.classList.add('recipe__count')
            name.classList.add('recipe__ingredient')
            span.classList.add('recipe__unit')

            amount.innerHTML = current.currentAmount
            span.innerHTML = current.unit + ' '
            name.appendChild(span)
            name.innerHTML = name.innerHTML + current.name


            li.innerHTML = svg
            li.appendChild(amount)
            li.appendChild(name)

            list.appendChild(li)
        })
    }
    updateDirections() {
        this.directionsEl.querySelector('.recipe__by').innerHTML = this.recipe.publisher
        this.directionsEl.querySelector('.recipe__btn').href = this.recipe.source
    }
    addServingListener() {
        let increaseButton = this.detailsEl.querySelector('.increase-serving')
        let decreaseButton = this.detailsEl.querySelector('.decrease-serving')

        increaseButton.onclick = () => {
            this.editServing('add')
        }
        decreaseButton.onclick = () => {
            this.editServing('subtract')
        }
    }
    editServing(mode) {
        let add = mode === 'add' ? 1 : -1
        let newServing = this.recipe.servings + add
        if (newServing > 0) {
            this.recipe.servings = newServing
            this.recipe.ingredients.forEach((current, index) => {
                this.recipe.ingredients[index].editAmount(mode)
            })
            this.recipe.calcTime();
            this.updateDetails()
            this.updateIngredients()
        }
    }
    addShoppingListener() {
        this.ingredientsEl.querySelector('.recipe__btn').onclick = this.shoppingListCb()
    }
    addLikeListener() {
        this.likeBtn.onclick = this.likeCb()
    }
    likeCb() {
        let recipe = this.recipe
        return function(e) {
            let likeCtrl = new LikesController()
            likeCtrl.addToLikes(recipe)
        }
    }
    shoppingListCb() {
        let list = this.recipe.ingredients
        return function(e) {
            let shopCtrl = new ShopController()
            shopCtrl.addItems(list)
        }
    }
    showLoader() {
        hide(this.figureEl)
        hide(this.directionsEl)
        hide(this.detailsEl)
        hide(this.ingredientsEl)
        show(this.loader)
    }
    hideLoader() {
        hide(this.loader)
        show(this.figureEl)
        show(this.directionsEl)
        show(this.detailsEl)
        show(this.ingredientsEl)
    }
    static hideElements() {
        let el = document.querySelectorAll('.recipe > *')
        Array.from(el).forEach(current => current.classList.add('hidden'))
    }

}

class ShopController {
    constructor() {
        this.shoppingEl = document.querySelector('.shopping__list')
    }
    static shoppingList = []
    addItems(ingredients) {
        ingredients.forEach(current => {
            let item = ShopController.shoppingList.find(i => current.name === i.name)
            let currentAmount = (current.currentAmount) ? math.number(math.fraction(current.currentAmount)) : 0
            if (item) {
                item.amount = parseFloat(item.amount) + currentAmount
            } else {
                ShopController.shoppingList.push(new ShopItem(current.name, currentAmount, current.unit))
            }
        })
        this.updateList();
    }
    updateList() {
        ShopController.shoppingList.forEach(current => {
            if (current.itemElement) {
                current.updateElement()
            } else {
                current.createItemElement(this.deleteCb);
                this.shoppingEl.appendChild(current.itemElement)
            }
        })
    }
    deleteCb(item) {
        let itemIndex = ShopController.shoppingList.findIndex(i => i === item)
        ShopController.shoppingList.splice(itemIndex, 1);
    }
}

class LikesController {
    constructor() {
        this.likesEl = document.querySelector('.likes__list')
    }
    static likesList = []
    addToLikes(recipe) {
        let index = LikesController.likesList.findIndex(i => i.recipeId === recipe.recipeId)
        if (index === -1) {
            LikesController.likesList.push(recipe)
            this.likesEl.appendChild(this.createLikeItem(recipe))
        }
    }
    createLikeItem(recipe) {
        let li = document.createElement('li')
        let a = document.createElement('a')
        let fig = document.createElement('figure')
        let img = document.createElement('img')
        let div = document.createElement('div')
        let p = document.createElement('p')
        let h4 = document.createElement('h4')

        a.classList.add('likes__link')
        fig.classList.add('likes__fig')
        div.classList.add('likes__data')
        h4.classList.add('likes__name')
        p.classList.add('likes__author')

        a.href = `#${recipe.recipeId}`
        img.src = recipe.image
        h4.innerHTML = recipe.name
        p.innerHTML = recipe.publisher

        fig.appendChild(img)
        div.appendChild(h4)
        div.appendChild(p)

        a.appendChild(fig)
        a.appendChild(div)

        li.appendChild(a)


        li.onclick = this.recipeCb(recipe)
        return li
    }
    recipeCb(recipe) {
        return function(e) {
            let recipeCtrl = new RecipeController(recipe)
            recipeCtrl.showRecipe()
        }
    }
}


function show(el) {
    el.classList.remove('hidden')
}

function hide(el) {
    el.classList.add('hidden')
}

function getJSON(url) {
    return result = fetch(url)
        .then(result => result.json())
        .catch(() => {
            throw new Error('Could not load data. Please reload page.')
        })
}

const app = new App()
app.start()