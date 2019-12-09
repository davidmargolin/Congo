import React from 'react';

const ConfirmationPage = () =>{
  return <div
    style={{
      display: "flex",
      flex: 1,
      justifyContent: "center",
    }}
  >
    <span
    style={{
      display: "flex",
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-evenly",
      maxWidth: 400,
      minHeight: 300,
      padding: "30px",
      border: "2px solid black"
    }}>
    Your listing is being created, a notification will be sent to your email when the listing has been mined.
    </span>
  </div>
}

export default ConfirmationPage;