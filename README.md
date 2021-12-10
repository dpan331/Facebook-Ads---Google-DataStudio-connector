# Facebook-Ads---Google-DataStudio-connector
In order to be able to use the Google DataStudio (GDS) connector for Facebook Ads, you need:
1) to create an Apps Script project in your Google Drive and add the JavaScript code found in this Github reporitory.
2) Create a developer's App in your Facebook Ads account (this is required in order for your GDS connector to be able to communicate with Facebook's Graph API).
3) Create an access token with ads_read permission.
4) Get your ad account ID (it can be found in the URL of your Ads Manager UI).

You can deploy your GDS connector in order to use it for yourself or certain people that you give access to by following these official intructions:
https://developers.google.com/datastudio/connector/deploy

Needless to say that the deployment and use of such a custom connector is free of charge.
On the contrary, if you want to build up the JS code found here in order to publish (free of charge or not) the GDS connector in the GDS connector library, keep in mind that Google demands some requirements that you can see in the following link:
https://developers.google.com/datastudio/connector/pscc-requirements

🚸 This script is not maintained, so, in time, certain operations or even the entire script (GDS connector) may not be functional. 
🚸 Also not all dimensions & metrics have been set up to be fetched by the connector from Facebook ads. If you want to have a "richer" GDS report, you can use the following links and adjust the JavaScript code accordingly:
https://developers.facebook.com/docs/marketing-api/insights/parameters/v12.0
https://developers.google.com/datastudio/connector/calculated-fields
