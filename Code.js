/************ DEVELOPED BY DIMITRIOS PANOURGIAS ************/

//https://developers.google.com/datastudio/connector/reference#data-studio-service
//https://developers.google.com/datastudio/connector/calculated-fields
//https://developers.facebook.com/docs/marketing-api/insights/parameters/v12.0
//https://stackoverflow.com/questions/66581576/dimension-and-metrics-not-appearing-properly-in-data-studio-community-connector

//Avoid requesting the metric Reach because when returned from the Graph API
//it does not match with the value seen in Facebook Ads UI.

var cc = DataStudioApp.createCommunityConnector();

//specify authentication type. In our case auth is performed manually beforehand.
function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
}

/*
//show more detailed error messages in the GDS UI.
function isAdminUser() {
  return true;
}
*/

function isAdminUser(){
 var email = Session.getEffectiveUser().getEmail();
  if( email == 'yourEmailHere@gmail.com' ){
    return true; 
  } else {
    return false;
  }
}

//interface for the user to provide the required parameters.
function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();
  
  config.newInfo()
    .setId('instructions')
    .setText('Enter your Graph API Access Token.');
  
  config.newTextInput()
    .setId('access_token')
    .setName('Enter your Access Token')
    .setHelpText('e.g. EAAIV1Lwy4PsBAM...')
    .setPlaceholder('EAAIV1Lwy4PsBAM...');
  
  config.newTextInput()
    .setId('accountΙd')
    .setName('Enter your Ad Account ID')
    .setHelpText('e.g. E50796734...')
    .setPlaceholder('50796734...');
  
  config.setDateRangeRequired(true);
  
  return config.build();
}

//requested fields to be used for the HTTP request to Graph API.
function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;  
  
  fields.newDimension()
      .setId('date')
      .setName('Date')
      .setType(types.YEAR_MONTH_DAY);
  
  fields.newDimension()
      .setId('campaign')
      .setName('Campaign')
      .setType(types.TEXT);  
  
  fields.newDimension()
      .setId('adset')
      .setName('Adset')
      .setType(types.TEXT);    

  fields.newDimension()
      .setId('ad')
      .setName('Ad')
      .setType(types.TEXT);  
  
  fields.newMetric()
      .setId('impressions')
      .setName('Impressions')
      .setType(types.NUMBER)
      .setAggregation(aggregations.SUM);
 
  fields.newMetric()
      .setId('clicks')
      .setName('Clicks')
      .setType(types.NUMBER)
      .setAggregation(aggregations.SUM);
  
  fields.newMetric()
      .setId('cpc')
      .setName('CPC')
      .setDescription('Cost per Click')
      .setFormula('SUM($spend) / SUM($clicks)')
      .setType(types.CURRENCY_EUR)
      .setAggregation(aggregations.AUTO);
  
  fields.newMetric()
      .setId('cpm')
      .setName('CPM')
      .setDescription('Cost per 1000 Impressions')
      .setFormula('((SUM($spend) / SUM($impressions)) * 1000)')
      .setType(types.CURRENCY_EUR)
      .setAggregation(aggregations.AUTO);
  
  fields.newMetric()
      .setId('ctr')
      .setName('CTR')
      .setDescription('Click-Through-Rate')
      .setFormula('SUM($clicks) / SUM($impressions)')
      .setType(types.PERCENT)
      .setAggregation(aggregations.AUTO);
  
  fields.newMetric()
      .setId('estimated_ad_recall_rate')
      .setName('Estimated Ad Recall Rate')
      .setType(types.NUMBER)
      .setAggregation(aggregations.AUTO);
  
  fields.newMetric()
      .setId('purchase_roas')
      .setName('Purchase ROAS')
      .setType(types.NUMBER)
      .setAggregation(aggregations.AUTO);

  fields.newDimension()
      .setId('quality_ranking')
      .setName('Ad Quality')
      .setType(types.TEXT);

  fields.newMetric()
      .setId('spend')
      .setName('Spend')
      .setType(types.CURRENCY_EUR)
      .setAggregation(aggregations.SUM);
  
  fields.newMetric()
      .setId('lead')
      .setName('Leads')
      .setType(types.NUMBER)
      .setAggregation(aggregations.SUM);
  
  fields.newMetric()
      .setId('offsite_conversion.fb_pixel_custom')
      .setName('offsite_conversion.fb_pixel_custom')
      .setType(types.NUMBER)
      .setAggregation(aggregations.SUM);
    
  return fields;
}

//build the schema of the GDS connector.
function getSchema(request) {  
    var fields = getFields().build();
    return { 'schema': fields };    
}

function runReport(startDate, endDate, accountId, accessToken, requestedFieldIds){
  var fbFields = []
  
  Logger.log(JSON.stringify(requestedFieldIds));
  
  for(var i=0; i < requestedFieldIds.length; i++){
      switch (requestedFieldIds[i]) {
          case 'campaign':
            fbFields.push("campaign_name");
            break;
          case 'impressions':
            fbFields.push("impressions");
            break;
          case 'clicks':
            fbFields.push("clicks");
            break;
          case 'cpc':
            fbFields.push("cpc");
            break;
          case 'cpm':
            fbFields.push("cpm");
            break;
          case 'ctr':
            fbFields.push("ctr");
            break;
          case 'estimated_ad_recall_rate':
            fbFields.push("estimated_ad_recall_rate");
            break;
          case 'purchase_roas':
            fbFields.push("purchase_roas");
            break;
          case 'quality_ranking':
            fbFields.push("quality_ranking");
            break;
          case 'spend':
            fbFields.push("spend");
            break;
          case 'adset':
            fbFields.push("adset_name");
            break;
          case 'ad':
            fbFields.push("ad_name");
            break;
          case 'lead':
            fbFields.push("actions");
            break;
          case 'offsite_conversion.fb_pixel_custom':
            fbFields.push("actions");
            break;

      }
  }
  
  //console.log(JSON.stringify(fbFields));
  //Logger.log(JSON.stringify(fbFields));
  
  var requestEndpoint = "https://graph.facebook.com/v11.0/act_" + accountId + "/insights/?"
  
  var timeRange = "{'since':'" + startDate + "', 'until':'" + endDate + "'}";

  var requestUrl = requestEndpoint + "time_increment=1";
  
  requestUrl += "&limit=100000";
  requestUrl += "&level=ad";
  requestUrl += "&fields=" + fbFields.join(",");
  requestUrl += "&time_range=" + encodeURIComponent(timeRange); 
  requestUrl += "&access_token=" + accessToken;
  console.log(requestUrl);
  
  var response = UrlFetchApp.fetch(requestUrl);
  var parseData = JSON.parse(response);    
 
  return parseData;  
}

function getDataForDateRange(startDate, endDate, accountId, accessToken, requestedFieldIds){   
  var currentStartDate = startDate;
  var reportData = [];
    
  do {    
    var currentEndDate = (addDays(currentStartDate, 7) > endDate) ? endDate : addDays(currentStartDate, 7);        
    
    var currentStartDateString = currentStartDate.toISOString().substring(0, 10);
    var currentEndDateString = currentEndDate.toISOString().substring(0, 10);
    
    //console.log("Start=" + currentStartDateString + " End=" + currentEndDateString);
    //Logger.log("Start=" + currentStartDateString + " End=" + currentEndDateString);
    
    var currentReport = runReport(currentStartDateString, currentEndDateString, accountId, accessToken, requestedFieldIds);
    
    reportData = reportData.concat(currentReport['data']);
    
    currentStartDate = addDays(currentEndDate, 1);
  } while( currentStartDate <= endDate);  
  
  return reportData;
} 


function getData(request) {     
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  
  var requestedFields = getFields().forIds(requestedFieldIds);    
  
  var startDate = new Date(request['dateRange'].startDate);
  var endDate = new Date(request['dateRange'].endDate);

  var adsAccountId = request.configParams['accountΙd'];
  var adsAccountToken = request.configParams['access_token'];
  console.log(adsAccountToken);
  
  var reportData = getDataForDateRange(startDate, endDate, adsAccountId, adsAccountToken, requestedFieldIds);   
  //console.log(JSON.stringify(reportData));
  //Logger.log(JSON.stringify(reportData));
  var rows = reportToRows(requestedFields, reportData);
  
  
  result = {
    schema: requestedFields.build(),
    rows: rows
  };   
  
  return result;  
}

function reportToRows(requestedFields, report) {  
  rows = [];
  
  for( var i = 0; i < report.length; i++){
    var row = [];
    
    var campaign = report[i]['campaign_name'];
    var adset = report[i]['adset_name'];
    var ad = report[i]['ad_name'];
    var impressions = report[i]['impressions'];
    var clicks = report[i]['clicks'];
    var cpc = report[i]['cpc'];
    var cpm = report[i]['cpm'];
    var ctr = report[i]['ctr'];
    var estimated_ad_recall_rate = report[i]['estimated_ad_recall_rate'];
    var purchase_roas = report[i]['purchase_roas'];
    var quality_ranking = report[i]['quality_ranking'];
    var spend = report[i]['spend'];
    var date = report[i]['date_start'];
    
    var lead = 0;
    var offsite_conversion_fb_pixel_custom = 0;
    
    if( 'actions' in report[i] ){    
      for(var j = 0; j < report[i]['actions'].length; j++ ){  
        if (report[i]['actions'][j]['action_type'] == 'lead') {
          lead += report[i]['actions'][j]['value'];
        }
      }
    }
    
    if( 'actions' in report[i] ){    
      for(var j = 0; j < report[i]['actions'].length; j++ ){  
        if (report[i]['actions'][j]['action_type'] == 'offsite_conversion.fb_pixel_custom') {
          offsite_conversion_fb_pixel_custom += report[i]['actions'][j]['value'];
        }
      }
    }
        
    requestedFields.asArray().forEach(function (field) {
      switch (field.getId()) {
          case 'date':
            return row.push(date.replace(/-/g,''));
          case 'campaign':
            return row.push(campaign);
          case 'impressions':
            return row.push(impressions);
          case 'clicks':
            return row.push(clicks);
          case 'cpc':
            return row.push(cpc);
          case 'cpm':
            return row.push(cpm);
          case 'ctr':
            return row.push(ctr);
          case 'estimated_ad_recall_rate':
            return row.push(estimated_ad_recall_rate);
          case 'purchase_roas':
            return row.push(purchase_roas);
          case 'quality_ranking':
            return row.push(quality_ranking);
          case 'spend':
            return row.push(spend);
          case 'adset':
            return row.push(adset);
          case 'ad':
            return row.push(ad);
          case 'lead':
            return row.push(lead);
          case 'offsite_conversion.fb_pixel_custom':
            return row.push(offsite_conversion_fb_pixel_custom);
      }
    });
    
    rows.push({ values: row });
  }
  
  return rows;
}          

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
