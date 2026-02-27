

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { privateRouters, publicRouters } from "../router/allRoutes";
import MainLayout from "../layout/Layout";
import PrivateRoute from "../router/privateRoute";
import PublicRoute from "../router/publicRoute";

function RouterData() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {publicRouters.map((item, index) => (
                        <Route
                            key={index}
                            path={item.path}
                            element={<PublicRoute>{item.element}</PublicRoute>}
                        />
                    ))}

                    {privateRouters.map((item, index) => (
                        <Route
                            key={index}
                            path={item.path}
                            element={
                                <PrivateRoute>
                                    <MainLayout>{item.element}</MainLayout>
                                </PrivateRoute>
                            }
                        />
                    ))}
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default RouterData;


