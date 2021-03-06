import React, { useEffect } from "react";
import { observer } from "mobx-react";

import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";
import { defineRoute } from "@/AppRouter";

let HomePage: React.FC = () => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.enterNewPage(_("home.title"));
  }, [appState.locale]);

  return <>Hello, world!</>;
};

HomePage = observer(HomePage);

export default defineRoute(async request => <HomePage />);
