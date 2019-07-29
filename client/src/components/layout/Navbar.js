import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <Fragment>
      <nav className="navbar navbar-expand-sm p-bg w-color">
        <Link to="/" className="navbar-brand s-font w-color">
          DevHub
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item px-2">
              <Link className="nav-link w-color" to="/developers">
                Developers
              </Link>
            </li>
            <li className="nav-item px-2">
              <Link className="nav-link w-color" to="/login">
                Log In
              </Link>
            </li>
            <li className="nav-item px-2">
              <Link className="nav-link w-color" to="/register">
                Register
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </Fragment>
  );
};

export default Navbar;
