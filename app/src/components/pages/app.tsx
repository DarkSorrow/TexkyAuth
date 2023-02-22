import { useState } from 'react';
import { Routes, Route } from "react-router-dom";

import { AppHeader } from '../organisms/app-header';
import { CallbackLogout } from './anonymous-openid';
import { AppNavigation } from '../organisms/app-navigation';
import { AppTemplate } from '../templates/app';
import { ErrorNotFoundPage } from './error-not-found';
import { AppHomePage } from './app-home';
import { AppSchemasPage } from './app-schemas';
import { AppMarketPage } from './app-market';
import { AppProfilePage } from './app-profile';
import { AppEditSchemaPage } from './app-edit-schemas';
import { CommonFormPage } from './common-form';


const AppPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
      <Routes>
        <Route path="/" element={
            <AppTemplate
              header={<AppHeader setDrawerOpen={setDrawerOpen} />}
              navigation={<AppNavigation />}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
            />
          }>
          <Route index element={<AppHomePage />} />
          <Route path="dashboard/*" element={<AppHomePage />} />
          <Route path="schemas/*" element={<AppSchemasPage />} />
          <Route path="/connect/logout" element={<CallbackLogout />} />
          <Route path="forms/:company/:topic/:subject/:version" element={<CommonFormPage />} />
          <Route path="schemas/topic/:topic/:subject" element={<AppEditSchemaPage />} />
          <Route path="market" element={<AppMarketPage />} />
          <Route path="profile" element={<AppProfilePage />} />
          <Route
            path="*"
            element={<ErrorNotFoundPage />}
          />
        </Route>
      </Routes>
  );
}

export default AppPage;
