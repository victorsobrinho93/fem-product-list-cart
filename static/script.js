const shoppingCart = {};

$.getJSON("static/data.json", (data) => {
    data.forEach((object, i) => {
        $("#catalogue").append(new productComponent(object, i));
    });
});

$(document).ready(() => {
    $("#container").append(new cart());
});

function productComponent(productObject, i) {
    this.component = $("<div>").addClass("product");
    this.component.append(new addToCart(productObject, i));
    this.component.append(new productInformation(productObject, i));

    return this.component;
}

function addToCart(productObject, i) {
    this.component = $(`
    <div class="item-showcase">
      <img src=${productObject.image["desktop"]} />
    </div>
    `);
    this.component.append(new cartButton(productObject, i));
    return this.component;
}

function cartButton({ name, price }, i) {
    function addItemToCart() {
        const elementId = `add-btn-${i}`;

        this.element = $(`
        <div id=${elementId} class="btn-frame alt-btn">
            <img src="assets/images/icon-add-to-cart.svg" />
            <p>Add to Cart</p>
        </div>
        `);

        this.element.on("click", () => {
            shoppingCart[name] = {
                price: price,
                quantity: 1,
            };
            $(`#${elementId}`).replaceWith(new adjustQuantity());
            handleQuantity();
        });

        return this.element;
    }
    function adjustQuantity() {
        const elementId = `quantity-${i}`;
        const incrementButtonId = `add-item-${i}`;
        const decrementButtonId = `remove-item-${i}`;

        const updateQuantity = (change) => {
            shoppingCart[name].quantity += change;
            handleQuantity();
        };

        this.element = $(`
          <div id=${elementId} class="comp-btn qty-frame">
            <img src="assets/images/icon-decrement-quantity.svg" alt="" id=${decrementButtonId} class="operator-btn" />
            <p id=${`item-quantity-${i}`}></p>
            <img src="assets/images/icon-increment-quantity.svg" alt="" id=${incrementButtonId} class="operator-btn" />
          </div>
        `);

        this.element.on("click", `#${incrementButtonId}`, () =>
            updateQuantity(1)
        );
        this.element.on("click", `#${decrementButtonId}`, () =>
            updateQuantity(-1)
        );

        return this.element;
    }

    this.component = $(`<div id=${`cart-btn-${i}`}></div>`).append(
        new addItemToCart()
    );

    function handleQuantity() {
        if (shoppingCart[name].quantity === 0) {
            delete shoppingCart[name];
            $(`#quantity-${i}`).replaceWith(new addItemToCart());
        } else {
            $(`#item-quantity-${i}`).text(shoppingCart[name].quantity);
        }
        // $("#item-count").text(
        //     `Your Cart (${Object.values(shoppingCart).reduce((total, value) => {
        //         return total + value.quantity;
        //     }, 0)})`
        // );
        $("#shopping-cart").replaceWith(new cart());
    }

    // this.component.

    return this.component;
}

function productInformation({ category, name, price }) {
    return $(`
    <div class="product-info">
      <p class="category">${category}</p>
      <p class="name">${name}</p>
      <p class="price">${price}</p>
    </div>
  `);
}

function cart() {
    this.component = $(`
      <div id="shopping-cart">
        <h1 id="item-count">Your Cart (${Object.values(shoppingCart).reduce(
            (total, value) => {
                return total + value.quantity;
            },
            0
        )})</h1>
      </div>
    `);

    function emptyCart() {
        this.element = $(`
        <div id="empty-cart">
          <img src="assets/images/illustration-empty-cart.svg" alt="" />
          <p> Your added items will appear here</p>
        </div>
      `);
        return this.element;
    }

    function listItems() {
        this.element = $(`<div id="items-list"></div>`);
        Object.keys(shoppingCart).forEach((key) => {
            const { quantity, price } = shoppingCart[key];
            const section = $(`<div class="item-section">
                <div class="item-info">
                  <div class="item-name">
                    <p>${key}</p>
                  </div>
                  <div class="cost-breakdown">
                    <p class="cart-item-quantity">${quantity}x</p>
                    <p class="cart-item-price">@ ${price}</p>
                    <p class="cart-item-total">$${quantity * price}</p>
                  </div>
                </div>
            </div>`);
            this.element.append(section);
        });

        function finishOrder() {
            this.element = $(`
            <div id="cart-confirm-order">
              <div id="total-cost">
                <p>Total $${Object.values(shoppingCart).reduce((total, e) => {
                    return total + e.quantity * e.price;
                }, 0)}
                </p>
                <p id="end-price"></>
              </div>
              <button>Confirm Order</button>
            </div>
            `);
            return this.element;
        }

        this.element.append(new finishOrder());

        return this.element;
    }

    if (Object.keys(shoppingCart).length === 0) {
        this.component.append(new emptyCart());
    } else {
        this.component.append(new listItems());
    }

    return this.component;
}
