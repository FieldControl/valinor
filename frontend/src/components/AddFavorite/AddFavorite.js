import React, { useState } from "react";
import Heart from "react-heart";

const AddFavorite = ({ onButtonClick, isActiveTest }) => {
  const [active, setActive] = useState(false);

  const handleButton = () => {
    console.log(active);
    onButtonClick(setActive(!active));
  };

  return (
    <Heart
      style={{ width: "2rem" }}
      isActive={isActiveTest}
      onClick={handleButton}
      inactiveColor="white"
    />
  );
};

export default AddFavorite;
