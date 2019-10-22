pragma solidity ^0.5.0;

contract Congo {
	string public name;
	uint public productCount;
	enum State {Listed,Processing,Shipped,Complete,Exception}
	mapping(uint => Product) public products;

	struct Product{
		uint id;
		uint quantity;
		uint price;
		string details;
		string name;
		address payable owner;
	}
	//event to be emitted when a new product is listed.
	event productListed(
		uint id,
		uint quantity,
		uint price,
		string details,
		string name,
		address payable owner
	);
	//event to be emitted when a listing is updated.
	event listingUpdated(
		uint id,
		uint quantity,
		uint price,
		string details,
		string name,
		address payable owner
	);
	//event to be emitted when an order is updated.
	event orderUpdated(
		uint id,
		uint quantity,
		uint price,
		string details,
		string name,
		address payable owner
	);
	//emit that an order has been created between the two parties
	event orderCreated(
		uint id,
		uint quantity,
		address payable buyer,
		address payable seller
	);
	constructor() public {
		name = "Congo Exchange";
	}
	//exposed function that lists a product.
	function createListing(
		uint _quantity,
		uint _price,
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
		emit productListed(
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
		uint _price,
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
			productCount,
			_quantity,
			_price,
			_details,
			_name,
			msg.sender
		);

	}

	//exposed function that allows user to purchase products
	function purchaseProduct(
		uint _id,
		uint _quantity
	)
	public payable{
		//validate user's input
		require(_quantity > 0, "Product Quantity must be greater than zero");
		require(_id <= productCount && _id > 0, "product id is invalid.");

		//get the product.
		Product memory _listing = products[_id];
		address payable seller = _listing.owner;
		address payable buyer = msg.sender;
		uint orderTotal = _listing.price * _quantity;

		//make sure buyer is not seller.
		require(buyer != seller, "You cannot purchase your own products.");
		//make sure payment is sufficient.
		require(msg.value >= orderTotal, "Not enough to cover the total cost.");

		//update the listing quantity.
		_listing.quantity = _listing.quantity - _quantity;

		//transfer value.
		address(seller).transfer(msg.value);

		//broadcast to listeners that an existing product has been updated.
		emit orderCreated(
			productCount,
			_quantity,
			buyer,
			seller
		);
	}
}