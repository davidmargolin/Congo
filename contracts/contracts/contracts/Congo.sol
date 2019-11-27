pragma solidity ^0.5.0;

contract Congo {
	string public name;
	uint public productCount;
	uint public orderCount;
	enum State {Listed,Processing,Shipped,Complete,Exception}
	mapping(uint => Product) public products;
	mapping(uint => Order) public orders;

	struct Order{
		uint id;
		uint quantity;
		uint prodID;
		uint256 total;
		string prodName;
		address payable buyerAddress;
		address payable sellerAddress;
		string notes;
		string sellerContactDetails;
		string buyerContactDetails;
		State orderStatus;

	}
	struct Product{
		uint id;
		uint quantity;
		uint256 price;
		string details;
		string imageLink;
		string name;
		address payable owner;
		string sellerContactDetails;
	}
	//event to be emitted when a new product is listed.
	event listingCreated(
		uint id,
		uint quantity,
		uint256 price,
		string details,
		string imageLink,
		string name,
		address payable owner,
		string sellerContactDetails
	);
	//event to be emitted when a listing is updated.
	event listingUpdated(
		uint id,
		uint quantity,
		uint256 price,
		string details,
		string imageLink,
		string name,
		address payable owner,
		string sellerContactDetails
	);
	//event to be emitted when an order is updated.
	event orderUpdated(
		uint orderID,
		State orderStatus
	);
	//emit that an order has been created between the two parties
	event orderCreated(
		uint orderID,
		uint quantity,
		uint prodID,
		uint256 total,
		string prodName,
		address payable buyerAddress,
		address payable sellerAddress,
		string notes,
		string sellerContactDetails,
		string buyerContactDetails,
		State orderStatus
	);
	constructor() public {
		name = "Congo Exchange";
	}
	//exposed function that lists a product.
	function createListing(
		uint _quantity,
		uint256 _price,
		string memory _details,
		string memory _name,
		string memory _imageLink,
		string memory _sellerContactDetails
	)
	public {
		//validate user's input
		require(bytes(_name).length > 0,"Product name cannot be empty.");
		require(_price > 0, "Product Price must be greater than zero");
		require(_quantity > 0, "Product Quantity must be greater than zero");
		require(bytes(_details).length > 0, "Product Details are empty");
		require(bytes(_sellerContactDetails).length > 0, "Seller Contact Details are empty");
		require(bytes(_imageLink).length > 0, "Image Link is empty");
		productCount++;
		//using product count as an id for now.
		products[productCount] = Product(
			productCount,
			_quantity,
			_price,
			_details,
			_name,
			_imageLink,
			msg.sender,
			_sellerContactDetails
		);
		//broadcast to listeners that a new item has been listed.
		emit listingCreated(
			productCount,
			_quantity,
			_price,
			_details,
			_name,
			_imageLink,
			msg.sender,
			_sellerContactDetails
		);

	}
	//update listing quantity when order is created and paid for.
	function updateQuantity(
		uint _id,
		uint _newQuantity
	)
	internal{
		//get the product.
		Product memory listing = products[_id];
		listing.quantity = _newQuantity;
		products[_id] = listing;
		emit listingUpdated(
			_id,
			listing.quantity,
			listing.price,
			listing.details,
			listing.imageLink,
			listing.name,
			listing.owner,
			listing.sellerContactDetails
		);
	}
	//exposed function updates a listing.
	function updateListing(
		uint _id,
		uint _quantity,
		uint256 _price,
		string memory _details,
		string memory _name,
		string memory _imageLink,
		string memory _sellerContactDetails
	)
	public payable{
		//validate user's input
		require(bytes(_name).length > 0,"Product name cannot be empty.");
		require(_price > 0, "Product Price must be greater than zero");
		require(_quantity > 0, "Product Quantity must be greater than zero");
		require(bytes(_details).length > 0, "Product Details are empty");
		require(_id <= productCount && _id > 0, "product id is invalid.");
		require(bytes(_sellerContactDetails).length > 0, "Seller Contact Details are empty");
		require(bytes(_imageLink).length > 0, "Image Link is empty");
		//fetch the product.
		Product memory _currentStateOfListing = products[_id];

		//compare if caller's address is the owner of this product.
		address payable productOwner = _currentStateOfListing.owner;
		require(productOwner == msg.sender, "You are not the owner of this listing.");

		//update the listing with new data.
		_currentStateOfListing.name = _name;
		_currentStateOfListing.price = _price;
		_currentStateOfListing.quantity = _quantity;
		_currentStateOfListing.details = _details;
		_currentStateOfListing.imageLink = _imageLink;
		_currentStateOfListing.sellerContactDetails = _sellerContactDetails;

		//update mapping on network
		products[_id] = _currentStateOfListing;

		//broadcast to listeners that an existing product has been updated.
		emit listingUpdated(
			_id,
			_quantity,
			_price,
			_details,
			_imageLink,
			_name,
			msg.sender,
			_sellerContactDetails
		);

	}

	//exposed function that allows user to purchase products
	function createOrder(
		uint _id,
		uint _quantity,
		string memory _notes,
		string memory _buyerContactDetails
	)
	public payable{
		//validate user's input
		require(_quantity > 0, "Product Quantity must be greater than zero");
		require(_id <= productCount && _id > 0, "product id is invalid.");
		require(bytes(_buyerContactDetails).length > 0, "Buyer Contact Details are empty");

		//get the product.
		Product memory _listing = products[_id];
		address payable seller = _listing.owner;
		address payable buyer = msg.sender;
		uint quantityRemaining = _listing.quantity;
		require(_quantity <= quantityRemaining,"Purchase Quantity exceeds Available Quantity");
		uint256 orderTotal = _listing.price * _quantity;
		quantityRemaining = quantityRemaining - _quantity;
		//make sure buyer is not seller.
		require(buyer != seller, "You cannot purchase your own products.");
		//make sure payment is sufficient.
		require(msg.value >= orderTotal, "Not enough to cover the total cost.");

		//update the listing quantity.
		updateQuantity(_id,quantityRemaining);
		//create a new order!
		orderCount++;
		orders[orderCount] = Order(
			orderCount,
			_quantity,
			_id,
			orderTotal,
			_listing.name,
			buyer,
			seller,
			_notes,
			_listing.sellerContactDetails,
			_buyerContactDetails,
			State.Listed
		);
		//transfer value.
		address(seller).transfer(msg.value);
		//broadcast to listeners that an existing product has been updated.
		emit orderCreated(
			orderCount,
			_quantity,
			_id,
			orderTotal,
			_listing.name,
			buyer,
			seller,
			_notes,
			_listing.sellerContactDetails,
			_buyerContactDetails,
			State.Listed
		);
	}
	//exposed function that allows seller to update orders
	function updateOrder(
		uint _id,
		uint nextState
	)
	public payable{
		//validate user's input
		require(_id <= orderCount && _id > 0, "order id is invalid.");
		require(uint(State.Exception) >= nextState,"invalid input state. >");
		//state should only move forwards
		//get the order.
		Order memory _order = orders[_id];
		//check if caller has permission to edit
		require(msg.sender == _order.sellerAddress,"Only the seller can modify the order status.");
		_order.orderStatus = State(nextState);
		//update order struct in mapping
		orders[_id] = _order;

		//broadcast to listeners that an existing order has been updated.
		emit orderUpdated(
			_id,
			_order.orderStatus
		);
	}
}