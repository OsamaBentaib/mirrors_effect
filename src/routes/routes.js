import React from "react";
import { Route } from "react-router-dom";
import MainContent from "../containers/MainContent";
export default function AppRoutes() {
  return (
    <>
      <Route path="/">
        <MainContent sence="Pinterest" />
      </Route>
    </>
  );
}
