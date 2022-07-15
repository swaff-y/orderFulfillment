require 'json'

#read file contents
if ARGV[0]
    file = File.read("./#{ARGV[0]}")
    data_hash = JSON.parse(file)
else
    puts "A data file is required"
    return
end

# Purchase Order class
# Accepts one parameter on initialization
# Product (hash) The product that the purchase order must be created for
# 3 methods:
#   data => returns data hash
#   create => returns purchase_order hash
#   send => sends the purchase order returns the result
class Purchase_order
    def initialize(product)
        @data = product
    end

    def data
        @data
    end

    def create
        @order_number = rand(10 ** 10)
        @purchase_order = { "orderNumber" => @order_number, **@data }
        return @purchase_order
    end

    def send
        puts "\x1b[42m Sending purchase order \x1b[0m ( \x1b[33m #{@purchase_order['orderNumber']} \x1b[0m ): {"
        puts "\t\"orderNumber\": #{@purchase_order['orderNumber']}" 
        puts "\t\"productId\": #{@purchase_order['productId']}" 
        puts "\t\"description\": #{@purchase_order['description']}" 
        puts "\t\"reorderAmount\": #{@purchase_order['reorderAmount']}"
        puts "}"
    end
end


# Fulfilment class
# Accepts one parameter on initialization
# hash (hash) data from the json file
# 5 methods:
#   get_orders => returns orders from a list it recieves (orders). If empty array, returns all orders
#   get_products => returns the products from the data file
#   get_product => returns a product from an item in an order (item)
#   get_items => returns the items from an order (order)
#   process_orders => returns order numbers that cannot be fulfilled
#       1. iterates through orders
#           a. iterate through each item on the order
#           b. compare item with quantity on hand
#           c. if it can be fulfilled add to fulfilled array and update stock
#               b. check if reorder point is reached, create po if so and add it to the created PO array
#           d. if it cant be fulfilled add to unfulfilled array
#       2. for each order if the amount of items equals the items that can be fulfilled, chnage status to fulfilled
#       3. for each order if the amount of items does not equal the items that can be fulfilled, chnage status to unfulfilled
#       4. iterate through the purchase orders and send the POs that are unique
#       5. create a new data file that is time stamped so it cannot mutate the orignal file
#       6. return the array of orders that cannot be filfilled
class Fulfilment
    def initialize(hash)
        @data = hash
    end #initialize

    def get_orders(orders)
        ret_orders = []
        if orders.length == 0
            return @data['orders']
        end
        data_orders = @data['orders']
        # return @data['orders']
        orders.each do |order| 
            order_match = data_orders.find do |data_order|
                data_order['orderId'] == Integer(order)
            end #data_orders_find
            if order_match
                ret_orders.push(order_match)
            end #if order_match
        end #orders.each
        return ret_orders
    end #get_orders

    def get_products
        return @data['products'];
    end #get_products

    def get_product(item)
        product = get_products.find do |prod|
            prod['productId'] === item['productId']
        end #get_products.find
        return product
    end #get_product

    def get_items(order)
        return order['items']
    end #get_items

    def process_orders(orders_to_process)
        orders_that_cannot_be_fulfiled = []
        purchase_orders_created = []

        orders = get_orders(orders_to_process)

        orders.each do |order|
            items = get_items(order)
            if items
                items_that_can_be_fulfilled = []
                items_that_cant_be_fulfilled = []

                items.each do |item|
                    product = get_product(item)
                    if item['quantity'] <= product['quantityOnHand']
                        items_that_can_be_fulfilled.push(item)
                        #Create purchase orders
                        if (product['quantityOnHand'] - item['quantity']) < product['reorderThreshold']
                            purchase_order = Purchase_order.new({ **product })
                            purchase_order.create
                            
                            created_po = purchase_orders_created.find do |order|
                                order::data['productId'] == purchase_order::data['productId']
                            end #purchase_orders_created.find

                            if !created_po
                                purchase_orders_created.push(purchase_order)
                                purchase_order.send
                            end #if !created_po
                        end #if (product['quantityOnHand'] - item['quantity']) < product['reorderThreshold']
                    else
                        items_that_cant_be_fulfilled.push(item)
                    end #if item['quantity'] <= product['quantityOnHand']
                end #items.each

                ret_order = @data['orders'].find do |ord|
                    ord['orderId'] == order['orderId']
                end #@data['orders'].find

                if items.length == items_that_can_be_fulfilled.length
                    items_that_can_be_fulfilled.each do |item|
                        product = get_product(item)
                        product['quantityOnHand'] = (product['quantityOnHand'] - item['quantity'])
                    end #items_that_can_be_fulfilled.each

                    ret_order['status'] = "Fulfilled";
                else
                    #update status
                    orders_that_cannot_be_fulfiled.push(order['orderId'])
                    ret_order['status'] = "Unfulfillable"
                end #if items.length == items_that_can_be_fulfilled.length
            end #if items
        end #orders.each

        puts ""
        puts "\x1b[41m Unfillable Orders #{orders_that_cannot_be_fulfiled} \x1b[0m"

        File.write('./data_' + (Time.now.to_f * 1000).to_i.to_s  + "_rb.json", JSON.dump(@data))
        puts "File is created successfully"

        return orders_that_cannot_be_fulfiled
    end #process_orders

end

fulfilment = Fulfilment.new(data_hash)
if(ARGV[1])
    fulfilment.process_orders(ARGV[1].split(","))
else
    fulfilment.process_orders([])
end
