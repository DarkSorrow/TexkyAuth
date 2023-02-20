import { useState } from 'react';
import { Routes, Route } from "react-router-dom";

import { AnonymousTemplate } from '../templates/anonymous';
import { AnonymousNavigation } from '../organisms/anonymous-navigation';
import { AnonymousHeader } from '../organisms/anonymous-header';
// Page part displayed in the main screen
import { ErrorNotFoundPage } from './error-not-found';
import { AnonymousHomePage } from './anonymous-home';
import { AnonymousContactPage } from './anonymous-contact';
import { RedirectOIDC, RedirectSignupOIDC, CallbackOIDC, CallbackLogout } from './anonymous-openid';
import { CommonFormPage } from './common-form';

export const AnonymousPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Routes>
      <Route path="/connect" element={<RedirectOIDC />} />
      <Route path="/connect/login" element={<CallbackOIDC />} />
      <Route path="/connect/logout" element={<CallbackLogout />} />
      <Route path="/connect/signup" element={<RedirectSignupOIDC />} />
      <Route path="/" element={
          <AnonymousTemplate 
            navigation={<AnonymousNavigation />}
            header={<AnonymousHeader setDrawerOpen={setDrawerOpen} />}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
        }>
        <Route index element={<AnonymousHomePage />} />
        <Route path="contact" element={<AnonymousContactPage />} />
        <Route path="forms/:company/:topic/:subject/:version" element={<CommonFormPage />} />
        <Route
          path="*"
          element={<ErrorNotFoundPage />}
        />
      </Route>
    </Routes>
  );
}

/*
  const [width, setWidth] = useState<number>(window.innerWidth);
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
        window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);


*/