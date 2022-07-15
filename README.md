# orderFulfillment

## description
This is an order fulfillment program written in Javascript and ruby. Both versions ahve the same behaviour. Both programs can be run from the command line and require that you have ruby and node installed on the machine it is being run on.

## Instructions for use
### Javascript version
process a list of orders
    node processOrders.js data.json "1122,1123,1124,1125"
process a list of orders (the order matters)
    node processOrders.js data.json "1125,1124"
process the whole list of ordes
    node processOrders.js data.json

### Ruby version
process a list of orders
    ruby processOrders.rb data.json "1122,1123,1124,1125"
process a list of orders (the order matters)
    ruby processOrders.rb data.json "1125,1124"
process the whole list of ordes
    ruby processOrders.rb data.json
