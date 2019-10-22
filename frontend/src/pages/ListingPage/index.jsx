import React from "react";
import { useParams } from "react-router-dom";

const data = {
  image: "https://via.placeholder.com/400",
  title: "Product Name",
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vivamus arcu felis bibendum ut tristique. Varius sit amet mattis vulputate enim nulla aliquet. Ac turpis egestas maecenas pharetra convallis. Diam vulputate ut pharetra sit amet aliquam id. Sollicitudin ac orci phasellus egestas tellus rutrum. Feugiat nisl pretium fusce id. Dui nunc mattis enim ut tellus elementum sagittis vitae et. Fringilla ut morbi tincidunt augue interdum velit euismod. Purus in massa tempor nec feugiat nisl pretium. Adipiscing elit duis tristique sollicitudin nibh sit amet commodo. Et egestas quis ipsum suspendisse. Nisl nunc mi ipsum faucibus vitae aliquet.

  Sagittis vitae et leo duis ut diam quam. Ultrices sagittis orci a scelerisque purus semper eget duis. Quis vel eros donec ac odio tempor orci dapibus. Bibendum ut tristique et egestas quis ipsum suspendisse. Vel risus commodo viverra maecenas accumsan lacus vel. Malesuada fames ac turpis egestas. Egestas integer eget aliquet nibh praesent tristique. Consequat id porta nibh venenatis cras sed felis. Est pellentesque elit ullamcorper dignissim cras tincidunt. Elementum eu facilisis sed odio morbi quis. Rhoncus dolor purus non enim praesent elementum.
  
  Montes nascetur ridiculus mus mauris vitae ultricies leo integer malesuada. Vivamus at augue eget arcu dictum varius duis at consectetur. Eleifend quam adipiscing vitae proin sagittis. Accumsan in nisl nisi scelerisque eu ultrices vitae auctor. Facilisis magna etiam tempor orci eu. Commodo odio aenean sed adipiscing diam donec adipiscing. Vestibulum lectus mauris ultrices eros in cursus turpis massa. Pulvinar sapien et ligula ullamcorper malesuada proin. Sit amet consectetur adipiscing elit duis tristique. Erat nam at lectus urna duis convallis convallis tellus. Sit amet massa vitae tortor condimentum lacinia. In hac habitasse platea dictumst quisque sagittis. Nulla malesuada pellentesque elit eget gravida. Sed cras ornare arcu dui vivamus arcu felis bibendum ut. Viverra mauris in aliquam sem fringilla ut. Sagittis aliquam malesuada bibendum arcu.`,
  price: "3.45",
  quantity: 20
};

const ListingPage = () => {
  const { listingID } = useParams();

  return (
    <div>
      <span
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            display: "flex",
            flexWrap: "wrap",
            maxWidth: 1500,
            padding: 24,
            justifyContent: "flex-start"
          }}
        >
          <img src={data.image} style={{ width: 400, height: 400 }} />
          <br />
          <div style={{ flex: 1, marginLeft: 40 }}>
            <h3>Product {listingID}</h3>
            <p>${data.price}</p>
            <p>{data.description}</p>
          </div>
        </div>
      </span>
    </div>
  );
};

export default ListingPage;
