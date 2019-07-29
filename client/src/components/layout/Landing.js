import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="landing text-center">
      <h1 className="s-font pt-v30 s-color mb-3">
        The Best Platform for Developer to Grind On!
      </h1>
      <Link to="/login" className="btn btn-lg w-color p-bg mr-3">
        Log In
      </Link>
      <Link to="/register" className="btn btn-lg w-color l-bg">
        Sign Up
      </Link>
    </div>
  );
};

export default Landing;
