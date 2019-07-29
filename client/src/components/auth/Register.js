import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios'

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: ""
  });

  const { name, email, password, password2 } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      console.log("passwords do not match");
    } else {
      const newUser = {
        name,
        email,
        password
      }
      try {
        const config = {
          headers = {
            'Content-Type': 'application/json'
          }
        }

        const body = JSON.stringify(newUser);
      } catch (err) {
        
      }
    }
  };

  return (
    <Fragment>
      <h2 className="s-font s-color text-center p-3">Get registered now!</h2>
      <div className="row">
        <form className="col-md-7 mx-auto p-border" onSubmit={e => onSubmit(e)}>
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              value={name}
              onChange={e => onChange(e)}
              type="text"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              value={email}
              onChange={e => onChange(e)}
              type="text"
              className="form-control"
            />
          </div>
          <div className="row">
            <div className="form-group col-6">
              <label>Password</label>
              <input
                name="password"
                value={password}
                onChange={e => onChange(e)}
                type="password"
                className="form-control"
              />
            </div>
            <div className="form-group col-6">
              <label>Confirm password</label>
              <input
                name="password2"
                value={password2}
                onChange={e => onChange(e)}
                type="password"
                className="form-control"
              />
            </div>
          </div>
          <button className="btn btn-lg l-bg w-color">Register</button>
          <br />
          <small className="mt-2">
            Already have an acount?{" "}
            <Link className="p-color" to="/login">
              Sign In
            </Link>
          </small>
        </form>
      </div>
    </Fragment>
  );
};

export default Register;
