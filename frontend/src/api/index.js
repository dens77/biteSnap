class Api {
  constructor(url, headers) {
    this._url = url;
    this._headers = headers;
  }

  checkResponse = (res) => {
    return new Promise((resolve, reject) => {
      if (res.status === 204) {
        return resolve(res);
      }
      const func = res.status < 400 ? resolve : reject;
      res.json()
        .then((data) => func(data))
        .catch(() => func(res)); // If JSON parsing fails, return the response object
    });
  }

  signin({ email, password }) {
    return fetch(`${this._url}/api/auth/token/login/`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({
        email,
        password,
      }),
    }).then(this.checkResponse);
  }

  signout() {
    const token = localStorage.getItem("token");
    return fetch(`${this._url}/api/auth/token/logout/`, {
      method: "POST",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  signup({ email, password, username, first_name, last_name }) {
    return fetch(`${this._url}/api/users/`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({
        email,
        password,
        username,
        first_name,
        last_name,
      }),
    }).then(this.checkResponse);
  }

  getUserData() {
    const token = localStorage.getItem("token");
    return fetch(`${this._url}/api/users/me/`, {
      method: "GET",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  changePassword({ current_password, new_password }) {
    const token = localStorage.getItem("token");
    return fetch(`${this._url}/api/users/set_password/`, {
      method: "POST",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
      body: JSON.stringify({ current_password, new_password }),
    }).then(this.checkResponse);
  }

  resetPassword({ email }) {
    return fetch(`${this._url}/api/users/reset_password/`, {
      method: "POST",
      headers: {
        ...this._headers,
      },
      body: JSON.stringify({ email }),
    }).then(this.checkResponse);
  }

  // recipes

  getRecipes({
    page = 1,
    limit = 6,
    is_favorited = 0,
    author,
    tags,
  } = {}) {
    const token = localStorage.getItem("token");
    const authorization = token ? { authorization: `Token ${token}` } : {};
    const tagsString = tags
      ? tags
          .filter((tag) => tag.value)
          .map((tag) => `&tags=${tag.slug}`)
          .join("")
      : "";
    return fetch(
      `${this._url}/api/recipes/?page=${page}&limit=${limit}${
        author ? `&author=${author}` : ""
      }${is_favorited ? `&is_favorited=${is_favorited}` : ""}${tagsString}`,
      {
        method: "GET",
        headers: {
          ...this._headers,
          ...authorization,
        },
      }
    ).then(this.checkResponse);
  }

  getRecipe({ recipe_id }) {
    const token = localStorage.getItem("token");
    const authorization = token ? { authorization: `Token ${token}` } : {};
    return fetch(`${this._url}/api/recipes/${recipe_id}/`, {
      method: "GET",
      headers: {
        ...this._headers,
        ...authorization,
      },
    }).then(this.checkResponse);
  }

  createRecipe({
    name = "",
    image,
    tags = [],
    cooking_time = 0,
    text = "",
    ingredients = [],
  }) {
    const token = localStorage.getItem("token");
    return fetch(`${this._url}/api/recipes/`, {
      method: "POST",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        name,
        image,
        tags,
        cooking_time,
        text,
        ingredients,
      }),
    }).then(this.checkResponse);
  }

  updateRecipe(
    { name, recipe_id, image, tags, cooking_time, text, ingredients },
    wasImageUpdated
  ) {
    // image was changed
    const token = localStorage.getItem("token");
    return fetch(`${this._url}/api/recipes/${recipe_id}/`, {
      method: "PATCH",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        name,
        id: recipe_id,
        image: wasImageUpdated ? image : undefined,
        tags,
        cooking_time: Number(cooking_time),
        text,
        ingredients,
      }),
    }).then(this.checkResponse);
  }

  addToFavorites = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`${this._url}/api/recipes/${id}/favorite/`, {
      method: "POST",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  removeFromFavorites = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`${this._url}/api/recipes/${id}/favorite/`, {
      method: "DELETE",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  // ingredients
  getIngredients({ name }) {
    const token = localStorage.getItem("token");
    return fetch(`${this._url}/api/ingredients/?name=${name}`, {
      method: "GET",
      headers: {
        ...this._headers,
      },
    }).then(this.checkResponse);
  }

  // tags
  getTags() {
    return fetch(`${this._url}/api/tags/`, {
      method: "GET",
      headers: {
        ...this._headers,
      },
    }).then(this.checkResponse);
  }

  deleteRecipe({ recipe_id }) {
    const token = localStorage.getItem("token");
    return fetch(`${this._url}/api/recipes/${recipe_id}/`, {
      method: "DELETE",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

}

export default new Api(process.env.API_URL || "https://bitesnap-backend.salmonwave-3869e9d3.westeurope.azurecontainerapps.io", {
  "content-type": "application/json",
});
