const fs = require('fs');
const args = process.argv.slice(2);
const arr = args[1] ? args[1].split(",") : null;
const obj = JSON.parse(fs.readFileSync('./' + args[0], 'utf8'));

class PurchaseOrder{
    constructor(product){
        this.data = product;
        this.orderNumber = null;
        this.product = null;
    }

    create(){
        this.product = this.data;
        this.orderNumber = Math.floor(Math.random()*90000) + 10000;
        delete this.product.reorderThreshold;
        delete this.product.quantityOnHand;
        this.purchaseOrder = {orderNumber: this.orderNumber, ...this.product};
        // console.log("Created Purchase Order (", "\x1b[32m", this.orderNumber , "):", JSON.stringify(this.purchaseOrder, null, 2));
    }

    send(){
        console.log("Sending Purchase Order (", "\x1b[32m", this.purchaseOrder.orderNumber,"\x1b[0m", "): ", JSON.stringify(this.purchaseOrder, null, 2));
        console.log("");

    }
}


//1. Provide a class or set of classes that can be used to perform order fulfilment, along with some basic instructions on how to use
class Fulfilment{
    constructor(obj){
        this.data = obj;
    }

    isArr(array){
        if(Array.isArray(array) && (array.length > 0))
            return true;
        return null;
    }

    getDataOrders(){
        const orders = this?.data?.orders || [];
        if(this.isArr(orders))
            return orders;
        return null;
    }

    getOrders(orders){
        const retOrders = [];
        const dataOrders = this.getDataOrders();
        if(this.isArr(orders)){
            if(dataOrders){
                orders.forEach((order)=>{
                    const orderMatch = dataOrders.find((dataOrder)=>{
                        return dataOrder.orderId === parseInt(order);
                    });
                    // console.log("match",orderMatch)
                    if(orderMatch){
                        retOrders.push(orderMatch);
                    }
                });
            }
        } else {
            if(dataOrders){
                retOrders.push(...dataOrders);
            }
        }
        if(this.isArr(retOrders))
            return retOrders;
        return null;
    }

    getProducts(){
        const products = this?.data?.products || [];
        if(this.isArr(products))
            return products
        return null;
    }

    getProduct(item){
        const dataProducts = this.getProducts();

        if(this.isArr(dataProducts)){
            const product = dataProducts.find((prod)=> {
                // console.log('item', JSON.stringify(item))
                return prod.productId === item.productId;
            });
            if(product)
                return product
        }
        return null;
    }

    getItems(order){
        if(this.isArr(order.items)){
            return order.items;
        }
        return null;
    }

    processOrders(ordersToProcess){
        const ordersThatCannotBeFulfilled = [];
        const purchaseOrdersCreated = [];
        let orders;

        if(this.isArr(ordersToProcess)){
            orders =this.getOrders(ordersToProcess);
            // console.log("Orders", JSON.stringify(orders));
        } else {
            orders =this.getOrders();
        }

 //2. (b) If an order cannot be fulfilled due to low stock levels, it should not be fulfilled.
        orders.forEach((order)=>{
            const items = this.getItems(order);
            // console.log("Items", JSON.stringify(items));
            if(items){
                const itemsThatCanBeFulfilled = [];
                const itemsThatCantFulfilled = [];

                items.forEach((item)=>{
                    const product = this.getProduct(item);
                    if(item.quantity <= product.quantityOnHand){
                        itemsThatCanBeFulfilled.push(item);
                        //create purchase orders
                        if((product.quantityOnHand - item.quantity) < product.reorderThreshold){

                            const purchaseOrder = new PurchaseOrder({...product});
                            purchaseOrder.create();
                            if(!purchaseOrdersCreated.find((order)=>{
                                return order.product.productId === purchaseOrder.product.productId
                            })) {
                                purchaseOrdersCreated.push(purchaseOrder);
                                purchaseOrder.send();
                            }
                        }
                    }
                    else
                        itemsThatCantFulfilled.push(item);
                });

                const retOrder = this.getOrders().find((ord)=>{
                    return ord.orderId === order.orderId;
                });

                if(items.length === itemsThatCanBeFulfilled.length) {
                    // console.log(`Order ${order.orderId} is fulfilled`, items);

                    //update Quantity
                    itemsThatCanBeFulfilled.forEach((item)=>{
                        const product = this.getProduct(item);
                        product.quantityOnHand = product.quantityOnHand - item.quantity;
                    });

                    //update status
                    retOrder.status = "Fulfilled";
                } else {
                    // console.log(`Order ${order.orderId} cannot be fulfilled`, items);
        
                    //update status
                    ordersThatCannotBeFulfilled.push(order.orderId);
                    retOrder.status = "Unfulfillable";
                }
            }
        });

 //2. (c) It should return an array of order ids that were unfulfillable
        fs.writeFile("data " + Date.now() + ".json", JSON.stringify(this.data,null,2), (err) => {
            if (err) console.error(error);
            console.log('File is created successfully.');
        })

        console.log("");
        console.log('\x1b[41m', "Unfulfillable Orders", JSON.stringify(ordersThatCannotBeFulfilled), "\x1b[0m");
        console.log("");

        return ordersThatCannotBeFulfilled || [];
    }
}

if(obj)
    fulfillment = new Fulfilment(obj);

//2. Provide a clear entry point into the order-fulfilment code, e.g. a method named processOrders()
//2. (a) It will accept an array of Order IDs to process orders for fulfilment and shipping.
if(Array.isArray(arr) && (arr.length > 0))
    fulfillment.processOrders(arr);
else
    fulfillment.processOrders();


