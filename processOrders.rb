require 'json'

file = File.read('./data.json')
data_hash = JSON.parse(file)

class Purchase_order
    def initialize(product)
        @data = product
    end

    def create
        @order_number = rand(10 ** 10)
        @purchase_order = { "orderNumber" => @order_number, **@data }
        return @purchase_order
    end

    def send
        puts "Sending..."
    end
end

class Fulfilment
    def initialize(hash)
        @data = hash
    end

    def get_orders(orders)
        ret_orders = []
        data_orders = @data['orders']
        # return @data['orders']
        if orders
            orders.each do |order| 
                order_match = data_orders.find do |data_order|
                    data_order['orderId'] == Integer(order)
                end
                if order_match
                    ret_orders.push(order_match)
                end
            end
        else
            ret_orders = data_orders
        end
        return ret_orders
    end

    def get_products
        return @data['products'];
    end

    def get_product(item)
        product = get_products.find do |prod|
            prod['productId'] === item['productId']
        end

        return product
    end

    def get_items(order)
        return order[0]['items']
    end

    def process_orders(orders_to_process)

    end
end

fulfilment = Fulfilment.new(data_hash)
purchase_order = Purchase_order.new({"productId"=>1, "description"=>"Small Widget","quantityOnHand"=>50})

# puts fulfilment.get_product({"productId"=>"1123"})
puts purchase_order.create
purchase_order.send

# puts data_hash['orders'][0]['items']