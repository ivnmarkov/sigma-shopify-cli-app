# Sigma Shopify Boilerplate App

Boilerplate to create an embedded Shopify app made with Node, [Next.js](https://nextjs.org/), [Shopify-koa-auth](https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth), [Polaris](https://github.com/Shopify/polaris-react), and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components).

## Requirements

- Ensure to install the [Shopify App CLI](https://shopify.dev/tools/cli).
- Use [ngrok](https://ngrok.com), in order to create a secure tunnel to your app running on your localhost.

## Install dependencies

Install the dependencies by running `npm install`.

## Connect to an embedded app in your Partner account

- Visit your [Partner Account dashboard](https://partners.shopify.com/organizations), go to the "Apps" page and click "Create App".
- Select "Public App", and choose a name for your app.
- In the `App URL` field just enter any url for now (e.g: `https://localhost:3000/`), as this will be automatically updated in the next step.
- Do the same for `Allowed redirection URL(s)`, except add `/auth/callback` to the path like so: `https://localhost:3000/auth/callback`.
- Click "Create App" to confirm.

In the terminal, complete the following steps:

- Run `shopify login` (optionally pass in the `--shop=YOUR_SHOP` flag to specify your test store)
- Open the printed url in the browser to authenticate.
- Next, run `shopify node connect` to connect to the newly created app. You will be prompted to answer the following questions:
  - `To which app does this project belong?` (Select the app you just created in your partner account dashboard).
  - `Which development store would you like to use?` (This will only appear if you did not use the `--shop` flag above).

This step automatically creates a `.env` file in the project root, with `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOP` and `SCOPES` values. The `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` can also be found in your app settings in your Partner account. `SCOPES` are set to default values. See [here](https://shopify.dev/docs/admin-api/access-scopes) for the list of scope options.

## Start the server

Start the server by running `shopify node serve`, and answer the prompts:

- `Do you want to convert <your-store>.myshopify.com to a development store?`
  This allows you to install a draft app in your test store.
  ❗️ **NOTE:** the store can not be converted back to a live store once you do this
- `Do you want to update your application url?` Choose "yes".

This step will automatically add the `HOST` to your .env, which matches the url of the `ngrok` tunnel which has been created for you.

## Update App's Allowed redirection URL(s) configuration

Go back to your _Partner Account dashboard_ > _Apps_ > _your App_ > _App setup_. The `App URL` should now match the tunnel url. You will need to manually update the urls in the `Allowed redirection URL(s)`, to support the online/offline access modes we have set up in this app:

```
{YOUR_TUNNEL_URL}/offline/auth/callback
{YOUR_TUNNEL_URL}/online/auth/callback
{YOUR_TUNNEL_URL}/auth/callback (replace the dummy value from step 2)
```

And then click "Save".

## Register the Theme app extension to your app

- Create a `.env` file in the root of the `theme-app-extension` folder  
  Note: if you were creating a new extension this would get automatically generated, but since we are registering an existing one we must create it ourselves.

  ```
  $ cd theme-app-extension && touch .env
  ```

- Add the following environment variables to the `.env` to connect the extension to your app:

  ```
  SHOPIFY_API_KEY={Your app's API Key. You can find this in your partner dashboard}
  SHOPIFY_API_SECRET={Your app's API. Secret You can find this in your partner dashboard}
  EXTENSION_TITLE={This can be anything you like}
  ```

- Make sure you are logged in by running `shopify login --shop=your-test-shop-name.myshopify.com`
- Register the extension by running `shopify extension register`.
- Push the extension by running ` shopify extension push`
- You should now see the extension in your app page in your Partner Dashboard under _Extensions_ > _Online Store_.
