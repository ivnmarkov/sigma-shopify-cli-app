export const getSubscriptionUrl = async (ctx, accessToken, shop) => {
  const appName = "cli-react-app";
  const query = JSON.stringify({
    query: `mutation {
      appSubscriptionCreate(
          name: "Super Duper Plan"
          returnUrl: "https://${shop}/admin/apps/${appName}"
          trialDays: 7
          test: true
          lineItems: [
            {
              plan: {
                appUsagePricingDetails: {
                  terms: "$1 for 100 emails"
                  cappedAmount: { amount: 20.00, currencyCode: USD }
                }
              }
            },
            {
              plan: {
                appRecurringPricingDetails: {
                  price: { amount: 10.00, currencyCode: USD }
                }
              }
            }
          ]
        ) {
            userErrors {
              field
              message
            }
            confirmationUrl
            appSubscription {
              id
              lineItems {
                id
                plan {
                  pricingDetails {
                    __typename
                  }
                }
              }
            }
        }
    }`,
  });

  const response = await fetch(
    `https://${shop}/admin/api/2019-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: query,
    }
  );

  const responseJson = await response.json();
  const confirmationUrl =
    responseJson.data.appSubscriptionCreate.confirmationUrl;
  return ctx.redirect(confirmationUrl);
};
