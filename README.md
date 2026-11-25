# PortfolioFrontend

This project uses [Angular CLI](https://github.com/angular/angular-cli) 22 and Yarn Classic.
Use Node.js 22.22.3+, 24.15.0+, or 26.x, as specified in `package.json`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application automatically reloads when source files change. HMR is off by default so `@defer` dependencies load on their normal triggers.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running the SSR server

After building, run `yarn serve:ssr:PortfolioFrontend`. The production host `malich.dev` and
loopback hosts are allowed by default. Set `NG_ALLOWED_HOSTS` for additional deployment hosts.
If a trusted reverse proxy validates and overwrites forwarding headers, set `NG_TRUST_PROXY_HEADERS`
to the comma-separated headers it provides, such as `x-forwarded-host,x-forwarded-proto`.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

To check that the homepage sections retain their server-rendered cards during hydration:

```bash
yarn ng build --configuration local
node tests/home-hydration.mjs
```

Open the printed URL in a browser at least `80rem` wide. The check provides its own data, verifies
that the five summary sections do not refetch, and checks Projects' column widths. It reports
Contact's social links separately. Set `HYDRATION_BROWSER` to a browser launcher that takes the URL
as its only argument to run it without opening the URL manually.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
