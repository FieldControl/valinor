import { BrowserRouter, Route, Switch } from "react-router-dom";
import { ProfileContextProvider } from "./context/ProfileContext";
import { Home } from "./pages/Home";
import Repos from "./pages/Repos";

export default function Routes() {
  return (
    <ProfileContextProvider>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route path="/repos" component={Repos} exact={true} />
          <Route path="/" component={Home} />
        </Switch>
      </BrowserRouter>
    </ProfileContextProvider>
  );
}
