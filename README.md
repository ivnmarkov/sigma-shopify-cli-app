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
- You should now see the extension in your app page in your Partner Dashboard under _Your App_ > _Manage extensions_.
- Don't forget to enable extension for the development store preview.

## Shopify application struture

- `pages` - contain pages of your application that will appear when you open application in Admin part
- `components` - folder with React components that furthe will be placed on pages. Also components contain graphQL queries and mutations, that can be placed in separate folders `graphql > mutaions + queries`.
- `server` - folder contains next.js server logic and also controls routing. Generates by cli after application setup. Can be extended.

## Shopify Theme extension structure

- `assets` - this folder able to conatin js and css files that further will be used in block components.
- `blocks` - theme-extension components. Each file is a separate block that can be placed on the page, depending on its settings and page type.
- `snippets` - folder with reusable components, that can be used in blocks multiple times.

## Shopify Billing settings

To start working with billing, make sure you have file named `get-subscription-url.js` in `./server/handlers/mutations` folder. Also make sure that this file imported into `server.js` file and triggered in `createShopifyAuth` function. Don't forget to pass to arguments `ctx, accessToken, shop` variables, that you have received in before in `createShopifyAuth` function. Now billing is connected and will appear after you install unlisted app in you store.

Now let's understand the sctructure of `getSubscriptionUrl`:

But before we start, don't forget to specify an `appName`. The correct `appName` you can find in the list of application in Partners

1. First of all we need to configure the subscription mutation. Each subscriot that will be created contains the next fields:

- `name` - with the name of subscription;
- `returnUrl` - URL where user will be redirected after successful billing;
- `trialDays` - number of trial days;
- `lineItems` - contains an array which describes plans user will pay for;

In Shopify the next types of pricing exist:

```
{
  plan: {
    appUsagePricingDetails: { // Allows an app to issue arbitrary charges
                              //for app usage associated with a subscription.
      terms: "$1 for 100 emails" // Terms for wich user pays
      cappedAmount: { amount: 20.00, currencyCode: USD } // The maximum amount of usage charges
                                                         //that can be incurred within a subscription billing interval.
    }
  }
}
```

```
{
  plan: {
    appRecurringPricingDetails: { // Instructs the app subscription to generate a fixed charge on a recurring basis.
                                  // The frequency is specified by the billing interval.
      price: { amount: 10.00, currencyCode: USD } // The amount to be charged to the store every billing interval.
                                                  // The only permitted currency code is USD.
      interval: EVERY_30_DAYS // How often the app subscription generates a charge.
      // Also interval can be ANNUAL. But ANNUAL interval doesn't work with appUsagePricingDetails
    }
  }
}
```

Also there is a feature of one `one-time charges`, whith wich user can buy app once and doesn't pay for it each month:

```
	appPurchaseOneTimeCreate(
    name: "Email template"
    price: { amount: 100.00, currencyCode: USD }
    returnUrl: "<Use same return URL as for appSubscriptionCreate>"
  ) {
    userErrors {
      field
      message
    }
    confirmationUrl
    appPurchaseOneTime {
      id
    }
  }
}
```

2. The `response` variable gets response from graphQl api where we have sent query prepared before;

3. Than we parse received json from response and redirect user to the application page with the `confirmationUrl`;

## Useful links

[What is Theme App Extensions](https://www.youtube.com/watch?v=xYz_XMY7jEU&t=296s)

[GraphQL Basics for Shopify](https://www.youtube.com/watch?v=ARgQ4oK0Mz8)

[Advanced Example of Shopify App + Theme extension](https://github.com/Shopify/product-reviews-sample-app)

[Shopify Liquid - Crash Course](https://www.youtube.com/watch?v=zBtwd2OfZsI)

[Shopify GrapiQL App](https://shopify.dev/apps/tools/graphiql-admin-api) - this will help to test graphql queries right in your store.
