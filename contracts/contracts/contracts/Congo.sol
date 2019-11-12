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
		State orderStatus;

	}
	struct Product{
		uint id;
		uint quantity;
		uint256 price;
		string details;
		string name;
		address payable owner;
	}
	//event to be emitted when a new product is listed.
	event listingCreated(
		uint id,
		uint quantity,
		uint256 price,
		string details,
		string name,
		address payable owner
	);
	//event to be emitted when a listing is updated.
	event listingUpdated(
		uint id,
		uint quantity,
		uint256 price,
		string details,
		string name,
		address payable owner
	);
	//event to be emitted when an order is updated.
	event orderUpdated(
		uint orderID,
		State nextState
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
		string memory _name)
	public {
		//validate user's input
		require(bytes(_name).length > 0,"Product name cannot be empty.");
		require(_price > 0, "Product Price must be greater than zero");
		require(_quantity > 0, "Product Quantity must be greater than zero");
		require(bytes(_details).length > 0, "Product Details are empty");
		productCount++;
		//using product count as an id for now.
		products[productCount] = Product(
			productCount,
			_quantity,
			_price,
			_details,
			_name,
			msg.sender
		);
		//broadcast to listeners that a new item has been listed.
		emit listingCreated(
			productCount,
			_quantity,
			_price,
			_details,
			_name,
			msg.sender
		);

	}

	//exposed function updates a listing.
	function updateListing(
		uint _id,
		uint _quantity,
		uint256 _price,
		string memory _details,
		string memory _name)
	public payable{
		//validate user's input
		require(bytes(_name).length > 0,"Product name cannot be empty.");
		require(_price > 0, "Product Price must be greater than zero");
		require(_quantity > 0, "Product Quantity must be greater than zero");
		require(bytes(_details).length > 0, "Product Details are empty");
		require(_id <= productCount && _id > 0, "product id is invalid.");

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

		//update mapping on network
		products[_id] = _currentStateOfListing;

		//broadcast to listeners that an existing product has been updated.
		emit listingUpdated(
			_id,
			_quantity,
			_price,
			_details,
			_name,
			msg.sender
		);

	}

	//exposed function that allows user to purchase products
	function createOrder(
		uint _id,
		uint _quantity,
		string memory notes
	)
	public payable{
		//validate user's input
		require(_quantity > 0, "Product Quantity must be greater than zero");
		require(_id <= productCount && _id > 0, "product id is invalid.");

		//get the product.
		Product memory _listing = products[_id];
		address payable seller = _listing.owner;
		address payable buyer = msg.sender;
		uint quantityRemaining = _listing.quantity;
		require(_quantity <= quantityRemaining,"Purchase Quantity exceeds Available Quantity");
		uint256 orderTotal = _listing.price * _quantity;
		//make sure buyer is not seller.
		require(buyer != seller, "You cannot purchase your own products.");
		//make sure payment is sufficient.
		require(msg.value >= orderTotal, "Not enough to cover the total cost.");

		//update the listing quantity.
		_listing.quantity = _listing.quantity - _quantity;
		products[_id] = _listing;
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
			notes,
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
			notes,
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