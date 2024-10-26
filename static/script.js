const shoppingCart = {};

// const calculateItemPrice = (prod) => {
//     return `$${shoppingCart[prod].quantity * shoppingCart[prod].price}`;
// };

/*

TODO: fix the redundant classes and divs in the item showcase button. It's breaking stuff.
* gotta clean the code around productComponent, it's really messy for no reason.
* refactor the item showcase to have its two modes share most of its style properties.
* make item showcase image dynamic instead of static.
* Add decimals to the prices and total.
* Finish styling
* Add finish order screen.
*/

$(document).ready(() => {
    $.getJSON("static/data.json", (data) => {
        data.forEach((object, i) => {
            $("#catalogue").append(new productComponent(object, i));
        });
    });
    $("#container").append(new cartComponent());
});

function calculateItemPrice(name, defaultValue) {
    this.element(`
        <p>${name}</p>
        `);
    return this.element;
}

function productComponent(productObject, i) {
    this.component = $("<div>")
        .addClass("product")
        .append(new productImage(productObject, i))
        .append(new productInformation(productObject, i));

    return this.component;
}

function productImage(productObject, i) {
    this.component = $(`
    <div class="item-showcase">
      <img id=${`thumbnail-${i}`} src=${productObject.image["desktop"]} />
    </div>
    `);
    this.component.append(new productButton(productObject, i));
    return this.component;
}

function productButton({ name, price }, i) {
    function addItemToCart() {
        const elementId = `add-btn-${i}`;
        this.element = $(`
        <div id=${elementId} class="add-to-cart-btn">
            <img src="assets/images/icon-add-to-cart.svg" />
            <p>Add to Cart</p>
        </div>
        `);

        this.element.on("click", () => {
            shoppingCart[name] = {
                price: price,
                quantity: 1,
            };
            $(`#${elementId}`).replaceWith(new changeItemQuantity());
            $(`#thumbnail-${i}`).addClass("selected-item");
            handleCartChanges();
        });

        return this.element;
    }

    function changeItemQuantity() {
        const elementId = `quantity-${i}`;
        const incrementButtonId = `add-item-${i}`;
        const decrementButtonId = `remove-item-${i}`;

        const updateQuantity = (change) => {
            shoppingCart[name].quantity += change;
            handleCartChanges();
        };

        this.element = $(`
          <div id=${elementId} class="set-amount-btn">
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

    this.component = $(`<div class="product-thumbnail-btn"></div>`).append(
        new addItemToCart()
    );

    function handleCartChanges() {
        if (shoppingCart[name].quantity === 0) {
            delete shoppingCart[name];
            $(`#quantity-${i}`).replaceWith(new addItemToCart());
            $(`#thumbnail-${i}`).removeClass("selected-item");
        } else {
            $(`#item-quantity-${i}`).text(shoppingCart[name].quantity);
        }
        $("#shopping-cart").replaceWith(new cartComponent());
    }

    return this.component;
}

function productInformation({ category, name, price }, i) {
    return $(`
    <div class="product-info">
      <p class="category">${category}</p>
      <p class="name">${name}</p>
      <p id=${`price-tag-${i}`} class="price">$${price.toFixed(2)}</p>
    </div>
  `);
}

function cartComponent() {
    this.component = $(`<div id="shopping-cart"></div`);

    function emptyCart() {
        this.element = $(`
        <div id="empty-cart">
          <h1 class="item-count">Your Cart (0)</h1>
          <img src="assets/images/illustration-empty-cart.svg" alt="" />
          <p>Your added items will appear here</p>
        </div>
      `);
        return this.element;
    }

    function listItems() {
        this.element = $(`<div id="items-list">
                <h1 class="item-count">Your Cart (${Object.values(
                    shoppingCart
                ).reduce((total, value) => {
                    return total + value.quantity;
                }, 0)})</h1>
            </div>`);
        Object.keys(shoppingCart).forEach((key, itemId) => {
            const { quantity, price } = shoppingCart[key];
            const section =
                $(`<div class="item-section" id=${`transaction-id-${itemId}`}>
                        <div class="item-name">
                            <p>${key}</p>
                        </div>
                        <div class="cost-breakdown">
                            <p class="cart-item-quantity">${quantity}x</p>
                            <p class="cart-item-price">@ $${price.toFixed(
                                2
                            )}</p>
                            <p class="cart-item-total">$${(
                                quantity * price
                            ).toFixed(2)}</p>
                        </div>
                        <a href="#" id=${`remove-transaction-${itemId}`} class="cart-rm"><img class="remove-btn" src="assets/images/icon-remove-item.svg" /></a>
                </div>`);

            section.append(new removeButton(key, itemId));

            this.element.append(section);
        });

        function removeButton(item, id) {
            this.element = $(
                `<a href="#" class="cart-rm"><img class="remove-btn" src="assets/images/icon-remove-item.svg" /></a>`
            );
            this.element.on("click", () => {
                delete shoppingCart[item];
                $("#shopping-cart").replaceWith(new cartComponent());
            });
            return this.element;
        }

        function finishOrder() {
            this.element = $(`
            <div id="cart-confirm-order">
              <div id="price-calc">
                <p>Order Total</p>
                <p class="order-total"> $${Object.values(shoppingCart)
                    .reduce((total, e) => {
                        return total + e.quantity * e.price;
                    }, 0)
                    .toFixed(2)}
                </p>
                <p id="end-price"></>
              </div>
              <a href="#" id="confirm-order" class="confirm-order-btn">Confirm Order</button>
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
