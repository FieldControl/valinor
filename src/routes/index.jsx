import { Route, Switch } from "react-router-dom";
import { Search } from "../pages/Search";

export const Routes = () => (
    <Switch>
        <Route exact path='/'  component={Search}/>
    </Switch>
)