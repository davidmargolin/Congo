<img width=250 src="/frontend/src/assets/logo.png"/>

###### _marketplace without the middleman_

### Congo Market API Documentation

This solidity contract enables two parties to make deals based on listings. These deals are called orders and the ethereum is being used to perform these transactions.

In order to create an order, a buyer, which must differ from the seller, has to agree with the seller's listing. Upon agreement, the buyer can make a call to the contract along with funds to pay for the item in the listing. The contract will handle the transfer of funds. Once an order has been established, the seller can update the order status to shipped or refunded. Buyers can cancel their orders before they are shipped to get their money back (sans gas).

**Note To Buyers**

Please complete your due diligence thoroughly prior to sending funds as the seller has no definite way of establishing reputation other than their transaction history.

### Table of Contents

1. [Order Contract Calls](#orders)
2. [Listing Contract Calls](#listings)
3. [Contract Events](#events)
4. [Extra Information](#extra-information)

## Orders

**Creating an Order**

This function allows buyers to purchase from all the available listings and once the proper payment is received in full, the listing's quantity is updated `listingUpdated` and `orderCreated` events are emitted.

**Requirements**:

**callerAddress != sellerAddress**

`function createOrder()`:

1. `uint _id` - the listing id to be purchased
2. `uint _quantity` - the desired quantity to be purchased
3. `string memory _notes` - any extra notes you would like to supply to the seller.
4. `string memory _ buyerContactDetails` - buyer's contact information (e.g burner12@email.com)

**Updating an Order**

This function allows buyers and sellers to update their order status which is represented in `State`. Once completed an `orderUpdated` event is emitted indicating the new order status/state.

**Requirements**:

**callerAddress == sellerAddress**

`function updateOrder()`:

1. `uint _id` - the listing id to be purchased
2. `uint nextState` - the new state or status of the order. (refer to `State` for a mapping)

## Listings

**Creating a Listing**

This function allows sellers to create a listing for an item. The only fee is from gas. Once the listing is successfully saved, the function emits a `listingCreated` event with all the details of the listing.

`function createListing()`:

1. `uint _quantity` - the quantity available for sale
2. `uint256 _price` - the price per quantity (units in wei)
3. `string memory _details` - details and extra information about the item
4. `string memory _name` - the title or name of the listing (e.g iPhone X)
5. `string memory _imageLink` - the direct link to an image of the item.
6. `string memory _sellerContactDetails` - the seller's contact information

**Updating a Listing**

This function allows sellers to modify a listing once it has been created. Only listing publishers a.k.a the seller of any particular listing can update the details. Once a listing is successfully updated, a `listingUpdated` event is emitted with all the new listing details.

**Requirements**:

**callerAddress == sellerAddress**

`function updateListing()`:

1. `uint _id` - the valid listing ID to be updated
2. `uint _quantity` - the quantity available for sale
3. `uint256 _price` - the price per quantity (units in wei)
4. `string memory _details` - details and extra information about the item
5. `string memory _name` - the title or name of the listing (e.g iPhone X)
6. `string memory _imageLink` - the direct link to an image of the item.
7. `string memory _sellerContactDetails` - the seller's contact information

## Events

### Listing Events

`event ListingCreated`:

1. `uint id`
2. `uint quantity`
3. `uint256 price`
4. `string details`
5. `string imageLink`
6. `string name`
7. `address payable owner`
8. `string sellerContactDetails`

---

`event ListingUpdated`:

1. `uint id`
2. `uint quantity`
3. `uint256 price`
4. `string details`
5. `string imageLink`
6. `string name`
7. `address payable owner` - listing publisher
8. `string sellerContactDetails`

### Order Events

`event orderUpdated`:

1. `uint orderID`
2. `uint orderStatus` - an unsigned int mapping to a value in `State` enum.

---

`event orderCreated`:

1. `uint orderID`
2. `uint quantity`
3. `uint prodID`
4. `uint256 total`
5. `string prodName`
6. `address payable buyerAddress`
7. `address payable sellerAddress`
8. `string notes`
9. `string sellerContactDetails`
10. `string buyerContactDetails`
11. `State orderStatus`

## Extra Information

`enum State`:

`0 -> Processing`

`1 -> Shipped`

`2 -> Refunded`

`3 -> Canceled`
