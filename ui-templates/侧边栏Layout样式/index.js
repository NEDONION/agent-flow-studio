import React from "react";
import ReactDOM from "react-dom";
import "./normalize.css";
import './initScript';
import Component from './component';

const dom = document.querySelector("#root");
ReactDOM.render(<Component />, dom);
