require 'json'

#read file contents
if ARGV[0]
    file = File.read("./#{ARGV[0]}")
    data_hash = JSON.parse(file)
else
    puts "A data file is required"
    return
end


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
                            po_data = purchase_order::data
                            
                            # puts purchase_order::data['productId']
                            created_po = purchase_orders_created.find do |order|
                                order::data['productId'] == purchase_order::data['productId']
                            end

                            if !created_po
                                purchase_orders_created.push(purchase_order)
                                purchase_order.send
                            end
                        end
                    else
                        items_that_cant_be_fulfilled.push(item)
                    end
                end #items.each

                ret_order = @data['orders'].find do |ord|
                    ord['orderId'] == order['orderId']
                end

                if items.length == items_that_can_be_fulfilled.length
                    items_that_can_be_fulfilled.each do |item|
                        product = get_product(item)
                        product['quantityOnHand'] = (product['quantityOnHand'] - item['quantity'])
                    end

                    ret_order['status'] = "Fulfilled";
                else
                    #update status
                    orders_that_cannot_be_fulfiled.push(order['orderId'])
                    ret_order['status'] = "Unfulfillable"
                end
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
