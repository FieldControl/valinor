import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/home";

export const MainRoutes: React.FC = (): JSX.Element => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
            </Routes>
        </BrowserRouter>
    );
};