import React, { Suspense } from "react";
import { mount, lazy, withView, route, Resolvable } from "navi";
import { Router, View } from "react-navi";
import { IntlProvider } from "react-intl";
import { v4 as uuid } from "uuid";

import AppLayout from "./layouts/AppLayout";
import ErrorPage, { ErrorPageProps } from "./pages/error/ErrorPage";
import getRoute from "./utils/getRoute";
import { appState } from "./appState";
import { loadLocaleData } from "./locales";

export class RouteError implements ErrorPageProps {
  constructor(
    public message: React.ReactNode,
    public options: {
      showRefresh?: true;
      showBack?: true;
    } = { showBack: true }
  ) {}
}

export function defineRoute(getViewFunction: Resolvable<React.ReactNode>) {
  return route({
    async getView() {
      try {
        return await getViewFunction.apply(this, arguments);
      } catch (e) {
        if (e instanceof RouteError) return <ErrorPage {...e} />;

        if (!(e instanceof Error)) e = new Error(String(e));
        return <ErrorPage uncaughtError={e} message={null} options={null} />;
      }
    }
  });
}

class ErrorBoundary extends React.Component<{}, { hasError: boolean; error?: Error }> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error: error instanceof Error ? error : new Error(String(error)) };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage uncaughtError={this.state.error} message={null} options={null} />;
    }

    return this.props.children;
  }
}

const routes = withView(
  async () => {
    const localeHyphen = appState.locale.replace("_", "-");
    const localeData = await loadLocaleData(localeHyphen);
    return (
      <IntlProvider locale={localeHyphen} messages={localeData}>
        <AppLayout key={localeHyphen}>
          <ErrorBoundary
            // Will be unmounted after router refresh
            key={uuid()}
          >
            <View />
          </ErrorBoundary>
        </AppLayout>
      </IntlProvider>
    );
  },
  mount({
    "/": lazy(() => import("./pages/home")),
    "/login": lazy(() => import("./pages/login")),
    "/register": lazy(() => import("./pages/register")),
    "/problems": getRoute(() => import("./pages/problem"), "problems"),
    "/problem": getRoute(() => import("./pages/problem"), "problem"),
    "/submissions": getRoute(() => import("./pages/submission"), "submissions"),
    "/submission": getRoute(() => import("./pages/submission"), "submission"),
    "/users": getRoute(() => import("./pages/user"), "users"),
    "/user": getRoute(() => import("./pages/user"), "user"),
    "/judge-machine": lazy(() => import("./pages/judge-machine"))
  })
);

const AppRouter: React.FC = () => {
  return (
    <Router routes={routes}>
      <Suspense fallback={null}>
        <View />
      </Suspense>
    </Router>
  );
};

export default AppRouter;
