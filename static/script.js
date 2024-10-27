const shoppingCart = {};

// const calculateItemPrice = (prod) => {
//     return `$${shoppingCart[prod].quantity * shoppingCart[prod].price}`;
// };

/*

TODO: fix the redundant classes and divs in the item showcase button. It's breaking stuff.
* gotta clean the code around productComponent, it's really messy for no reason. (mostly done).
* refactor the item showcase to have its two modes share most of its style properties.
* make item showcase image dynamic instead of static
* Finish styling
* Add finish order screen.
*/

$(document).ready(() => {
    $.getJSON("static/data.json", (data) => {
        data.forEach((product, i) => {
            product.quantity = 0;
            product.card = `product-card-${i}`;
            $("#catalogue").append(new productComponent(product, i));
        });
    });
    $("#container").append(new cartComponent());
});

function productComponent(product, i) {
    const { mobile, desktop, tablet } = product["image"];
    // todo: add script to decide what image is set.

    this.element = $(`<div class="product" id=${product.card}>
            <img class="product-img" src=${desktop} />
            <div class="product-btn"></div>
        </div>`);
    this.element
        .children(".product-btn")
        .replaceWith(new handleProduct(product, i));
    this.element.append(new productInformation(product, i));
    return this.element;
}

function handleProduct(product) {
    const { name } = product;

    function addItemToCart() {
        this.element = $(`
        <div class="product-btn add-to-cart-btn">
            <img src="assets/images/icon-add-to-cart.svg" />
            <p>Add to Cart</p>
        </div>
        `);

        this.element.on("click", () => {
            product.quantity = 1;
            shoppingCart[name] = product;
            this.element.replaceWith(new handleItemAmount());
            refreshCart(name);
        });

        return this.element;
    }

    function handleItemAmount() {
        this.element = $(`
                <div class="product-btn handle-amount">
                    <img src="assets/images/icon-decrement-quantity.svg" alt="" class="operator-btn minus-btn" />
                    <p class="item-amount">${shoppingCart[name].quantity}</p>
                    <img src="assets/images/icon-increment-quantity.svg" class="operator-btn plus-btn" />
                </div>
            `);

        this.element.on("click", ".plus-btn", () => {
            updateAmount(1);
        });

        this.element.on("click", ".minus-btn", () => {
            updateAmount(-1);
        });

        function updateAmount(change) {
            shoppingCart[name].quantity += change;
            $(`#${product.card} > .product-btn`).replaceWith(
                shoppingCart[name].quantity >= 1
                    ? new handleItemAmount()
                    : new addItemToCart()
            );
            refreshCart(name);
        }

        return this.element;
    }

    return new addItemToCart();
}

function refreshCart(name) {
    if (name !== undefined && shoppingCart[name].quantity === 0) {
        $(`#${shoppingCart[name].card} > .product-img`).removeClass(
            "selected-item"
        );
        delete shoppingCart[name];
    } else if (name !== undefined) {
        $(`#${shoppingCart[name].card} > .product-img`).addClass(
            "selected-item"
        );
    }

    $("#shopping-cart").replaceWith(new cartComponent());
}

function productInformation(product) {
    const { category, name, price } = product;
    return $(`
    <div class="product-info">
      <p class="category">${category}</p>
      <p class="name">${name}</p>
      <p class="price">$${product.price.toFixed(2)}</p>
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
        // ! This loop should be made reusable, but that's for future projects.
        Object.keys(shoppingCart).forEach((key) => {
            const { quantity, price } = shoppingCart[key];
            const section = $(`<div class="item-section"}>
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
                </div>`);

            section.append(new removeButton(key));

            this.element.append(section);
        });

        function removeButton(item) {
            this.element = $(
                `<a href="#" class="cart-rm"><img class="remove-btn" src="assets/images/icon-remove-item.svg" /></a>`
            );
            this.element.on("click", () => {
                const itemCard = `#${shoppingCart[item].card}`;
                $(`${itemCard} > .product-img`).removeClass("selected-item");
                $(`${itemCard} > .product-btn`).replaceWith(
                    new handleProduct(shoppingCart[item])
                ); /*
                ! works but should be done better.
                */
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

            this.element.on("click", ".confirm-order-btn", () => {
                $("#container").append(new orderComponent());
                $("body").addClass("no-scroll");
            });

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

function orderComponent() {
    this.element = $(`<div id="order-wrapper">
            <div class="order-confirmed">
                <div class="oc-header">
                    <img src="assets/images/icon-order-confirmed.svg" id="oc-icon" />
                    <h1>Order Confirmed</h1>
                    <p>We hope you enjoy your food!</p>
                </div>
            </div>
        </div>
    `);

    this.element
        .children(".order-confirmed")
        .append(new handleOrderItems())
        .append(
            $(
                `<a href="" class="start-new confirm-order-btn">Start New Order</div>`
            )
        );

    function handleOrderItems() {
        this.element = $(`<div class="oc-items-list"></div>`);
        Object.keys(shoppingCart).forEach((item) => {
            const { name, price, quantity, image } = shoppingCart[item];

            this.element.append(
                $(`
                <div class="order-item">
                    <div class="oi-img">
                        <img src=${image.thumbnail} />
                    </div>
                    <p class="oi-name">${name}</p>
                    <div class="oi-set">
                        <p class="oi-quantity">${quantity}x</p>
                        <p class="oi-price">@ ${price.toFixed(2)}</p>
                    </div>
                    <div class="oi-total">
                      <p>$${(price * quantity).toFixed(2)}</p>
                    </div>
                </div>
                `)
            );
        });
        this.element.append(
            $(`
                <div class='oi-order-total'>
                    <p>Order Total</p>
                    <p class="ot-value">$${calculateOrderTotal()}</p>
                </div>
            `)
        );
        return this.element;
    }

    return this.element;
}

function calculateOrderTotal() {
    return Object.values(shoppingCart)
        .reduce((total, e) => {
            return total + e.quantity * e.price;
        }, 0)
        .toFixed(2);
}
