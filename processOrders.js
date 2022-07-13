const fs = require('fs');
const args = process.argv.slice(2);
const obj = JSON.parse(fs.readFileSync('./' + args[0], 'utf8'));
const arr = args[1].split(",");

class PurchaseOrder{
    constructor(product){
        this.data = product;
    }

    create(){
        const product = this.data;
        const orderNumber = Math.floor(Math.random()*90000) + 10000;
        delete product.reorderThreshold;
        delete product.quantityOnHand;
        this.purchaseOrder = {orderNumber, ...product};
        console.log("Created Purchase Order (", "\x1b[32m", orderNumber , "):", JSON.stringify(this.purchaseOrder, null, 2));
    }

    send(){
        console.log("Sending Purchase Order (", "\x1b[32m", this.purchaseOrder.orderNumber,"\x1b[0m", ").....");
        console.log("");

    }
}


//1. Provide a class or set of classes that can be used to perform order fulfilment, along with some basic instructions on how to use
class Fulfilment{
    constructor(obj){
        this.data = obj;
        this.retData = { ...obj };
    }

    isArr(array){
        if(Array.isArray(array) && (array.length > 0))
            return true;
        return null;
    }

    getDataOrders(){
        const orders = this?.data?.orders || [];
        if(this.isArr(orders))
            return this?.data?.orders || [];
        return null;
    }
    getRetOrders(){
        const orders = this?.retData?.orders || [];
        console.log("Rttt", orders)
        if(this.isArr(orders))
            return this?.retData?.orders || [];
        return null;
    }

    getOrders(orders){
        const retOrders = [];
        if(this.isArr(orders)){
            const dataOrders = this.getDataOrders();
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
        }
        if(this.isArr(retOrders))
            return retOrders;
        return null;
    }

    getDataProducts(){
        const products = this?.data?.products || [];
        if(this.isArr(products))
            return this?.data?.products || [];
        return null;
    }

    getProduct(item){
        const dataProducts = this.getDataProducts();
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

    // getOrder(order, orders){
    //     console.log("ordes", orders)
    //     const ordersArr = this.getOrders(orders);
    //     const retOrder = ordersArr.find((ord)=>{
    //         return ord.orderId === order.orderId;
    //     });

    //     if(retOrder)
    //         return retOrder

    //     return null;
    // }

    processOrders(ordersToProcess){
        if(this.isArr(ordersToProcess)){
            const orders =this.getOrders(ordersToProcess);
            const ordersThatCannotBeFulfilled = [];
            // console.log("Orders", JSON.stringify(orders));

 //2. (b) If an order cannot be fulfilled due to low stock levels, it should not be fulfilled.
            orders.forEach((order)=>{
                const items = this.getItems(order);
                // console.log("Items", JSON.stringify(items));
                if(items){
                    const itemsThatCanBeFulfilled = [];
                    const itemsThatCantFulfilled = [];

                    items.forEach((item)=>{
                        const product = this.getProduct(item);
                        if(item.quantity < product.quantityOnHand){
                            itemsThatCanBeFulfilled.push(item);
                            //create purchase orders
                            if(item.quantity < product.reorderThreshold){
                                const purchaseOrder = new PurchaseOrder({...product});

                                purchaseOrder.create();
                                purchaseOrder.send();
                            }
                            

                        }
                        else
                            itemsThatCantFulfilled.push(item);
                    });

                    // const retOrder = this.getRetOrders.find((ord)=>{
                    //     return ord.orderId === order.orderId;
                    // });
                    if(items.length === itemsThatCanBeFulfilled.length) {
                        // console.log(`Order ${order.orderId} is fulfilled`, items);

                        
                        //update stock
                        // console.log("ORDER!!!", retOrder)
        
                        //update status
                    } else {
                        // console.log(`Order ${order.orderId} cannot be fulfilled`, items);
        
                        //update status
                        ordersThatCannotBeFulfilled.push(order.orderId);
                    }
                }
            });

 //2. (c) It should return an array of order ids that were unfulfillable.
            console.log("");
            console.log('\x1b[41m', "Unfulfillable Orders", JSON.stringify(ordersThatCannotBeFulfilled), "\x1b[0m");
            console.log("");
            return ordersThatCannotBeFulfilled || [];
        } else {
            return console.log("Please submit an array of orders");
        }
    }
}

const fulfillment = new Fulfilment(obj);

//2. Provide a clear entry point into the order-fulfilment code, e.g. a method named processOrders()
//2. (a) It will accept an array of Order IDs to process orders for fulfilment and shipping.
fulfillment.processOrders(arr);


