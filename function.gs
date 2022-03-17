function isJson(str) {
  var _str = (typeof str !== "string" ? JSON.stringify(str) : str);

  try {
    JSON.parse(_str);
  } catch (e) {
    return false;
  }

  return true;
}


function getTimezoneOffset(tz, hereDate) {
  hereDate = new Date(hereDate || Date.now());
  hereDate.setMilliseconds(0); // for nice rounding

  const
    hereOffsetHrs = hereDate.getTimezoneOffset() / 60 * -1,
    thereLocaleStr = hereDate.toLocaleString('en-US', { timeZone: tz }),
    thereDate = new Date(thereLocaleStr),
    diffHrs = (thereDate.getTime() - hereDate.getTime()) / 1000 / 60 / 60,
    thereOffsetHrs = hereOffsetHrs + diffHrs;

  return thereOffsetHrs;
}

function getLocalEpoch(timezone, date, fromTo = 'from') {
  let tzOffset = getTimezoneOffset(timezone, date),
    hour = '00:00:00';
  tzOffset = (tzOffset >= 0 ? "+" : "-") + String(tzOffset).replace("-", "").padStart(2, '0');

  let
    iso8601LocalFormat = `${date}T${hour}.000${tzOffset}:00`,
    epoch = new Date(iso8601LocalFormat).valueOf() / 1000;
  if (fromTo == "to") { epoch += 86400 }


  console.log(iso8601LocalFormat, '=>', epoch, '(s)');

  return epoch;
}

function getSHA256(value) {
  if (isJson(value)) value = JSON.stringify(value);
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);
  var hexString = signature.map(function (byte) { var v = (byte < 0) ? 256 + byte : byte; return ("0" + v.toString(16)).slice(-2); }).join("");
  return hexString;
}

function getBytes(value) {
  if (isJson(value)) JSON.stringify(value);
  var size = Utilities.newBlob(JSON.stringify(value)).getBytes().length;
  return size
}

function getCachedData(key, request) {
  console.log("getCachedData()::START");
  var cacheExpTime = 60; // 600 10min
  var cache = CacheService.getUserCache();
  var content = JSON.parse(cache.get(key));

  if (!(content)) {
    console.log('no content found in cache. Now fetching API and then cache...');
    var content = fetchDataFromApi(request),
      cachedData = content,
      sizeBytes = getBytes(cachedData) / 1000;

    console.log(`content size: ${sizeBytes}KB`);
    if (sizeBytes < 100) { console.log("Fetched data has been cached"); cache.put(key, JSON.stringify(cachedData), cacheExpTime); }
    else { console.log('data exceed 100KB. Skip caching') }

  } else { console.log('content found in cache for key:', key) }

  //console.log("getCachedData()::@content",content);

  console.log("getCachedData()::END");
  return content;
}
function getAutoTimeScale(period) {
  let unit,
    minSpot = 4,
    oneHour = 60 * 60,
    oneDay = 24 * 60 * 60,
    oneWeek = 24 * 60 * 60 * 7,
    oneMonth = 24 * 60 * 60 * 30;

  if (+period / oneMonth > minSpot) { unit = 'M' }
  else if (+period / oneWeek > minSpot) { unit = 'W' }
  else if (+period / oneDay > minSpot) { unit = 'D' }
  else if (+period / oneHour > minSpot) { unit = 'H' }
  else { unit = 'W' }

  console.log('autoScaling:', unit);
  return unit;
}

function sendUserError(message) {
  var cc = DataStudioApp.createCommunityConnector();
  cc.newUserError()
    .setText(message)
    .setDebugText(message)
    .throwException();
}

/**
  * Formats the epoch value received from API into a date format YYYYMMDD HH:MM:SS 2021-04-02T00:00:00.000Z
  */
function formatGoogleDate(epoch, timeZone) {
  let tz_offset = getTimezoneOffset(timeZone, parseInt(epoch + "000"));
  let output = new Date(
    ((tz_offset * 3600) + epoch) * 1000
  )
    .toISOString();

  let out_date = output.slice(0, 10).replace(/-/g, "");
  let out_time = output.split("T")[1].slice(0, 2).replace(":", "");
  output = `${out_date}${out_time}`;

  // console.log(`retreatment: ${epoch} => ${timeZone} (${tz_offset}) => ${output}`);
  return output;
}





/* () => parse the querystring from URL and return {param1:value1,param2:value2,...}*/
function getJsonPayloadFromUrl(url) {
  var payload = url.split('?')[1];
  var query = payload;
  var result = {};
  query.split("&").forEach(function (part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

/* () => return array of kpis contained into dd-dt (evolution) or ea-columns (aggregated) */
function getKpisFromPayload(hPayload) {
  if (hPayload.hasOwnProperty('dd-dt')) { var kpisKey = 'dd-dt'; }
  else if (hPayload.hasOwnProperty('ea-columns')) { var kpisKey = 'ea-columns'; }
  try {
    var kpis = hPayload[kpisKey];
  }
  catch (e) {
    DataStudioApp.createCommunityConnector()
      .newUserError()
      .setDebugText('Error for payload=' + JSON.stringify(hPayload, null, 4) + ' ' + e)
      .setText('Payload should contain either "dd-dt" or "ea-columns" key')
      .throwException();
  }
  return kpis.split(',');
}

/* () => construct the URL to list fields from a datasource from the main url */
function getURL_FieldsFromSource(api_url, lang) {
  var datasource = api_url.match(/(\w+).json/)[1]; // insummary ...
  var fieldsReportUrl = api_url.replace(/\w+\/\w+\.json.*$/, `fields/${datasource}.json?ea-lg=${lang}`);

  if (DEBUG) console.log('getURL_FieldsFromSource:fullurl=' + api_url);

  return fieldsReportUrl

}

/* () => send error message to the cloud console and by email */
function sendError(error_msg, EMAIL, TOPIC) {
  MailApp.sendEmail(
    EMAIL,
    TOPIC,
    error_msg
  );
  DataStudioApp.createCommunityConnector()
    .newUserError()
    .setDebugText(error_msg)
    .setText(error_msg)
    .throwException();
}



function responseToRows(request, requestedFields) {
  var startDate = to_mmddyyyy(request.dateRange.startDate);
  var endDate = to_mmddyyyy(request.dateRange.endDate);
  var rows = [];

  var aKpis = requestedFields.asArray();

  var url = request.configParams.url + `&date-from=${startDate}&date-to=${endDate}`;

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': url.split("?")[1]
  };

  // date-scale mode
  if (url.includes('dd-dt=')) {
    var hData = {}; // { $date+$name : [ $kpivalue1, $kpivalue2] }
    var cacheSetKpi = [];

    aKpis
      .filter(kpi => !(['name', 'date'].includes(kpi.getId())))
      .forEach(function (aKpi) {
        var kpi = aKpi.getId();
        var idFields = {};


        url = url.replace(/dd-dt=[\w,]+/, `dd-dt=${kpi}`); // request one kpi at a time

        if (DEBUG) console.log('responseToRows:kpi=' + kpi + ':url:' + url);

        options['payload'] = url.split("?")[1];

        if (DEBUG) console.log('responseToRows:evolution:options=' + JSON.stringify(options));
        if (DEBUG) console.log('responseToRows:evolution:fullurl=' + url);

        var data = JSON.parse(UrlFetchApp.fetch(url.split("?")[0], options));

        if (DEBUG) console.log('responseToRows:evolution:kpi=' + kpi, JSON.stringify(data, null, 4));

        try {
          var json_fields = data.data.fields;
          var json_rows = data.data.rows;
        }
        catch (e) {
          sendError(
            'for url=' + url + '\napi_error=' + data.error_msg + '\nexception=' + e,
            SUPPORT_EMAIL,
            SUBJECT
          );
        }

        // map field index: single-line command
        // idFields = Object.assign(... json_fields.map(function(js_field, f){ var oObj = {}; oObj[js_field.name] = f;return  oObj;}))      

        // map field index
        json_fields.forEach(function (js_field, f) {
          idFields[js_field['name']] = f;
        });

        if (DEBUG) console.log('responseToRows:evolution:idFields=' + JSON.stringify(idFields));
        // { $date+$name : [ $kpivalue1, $kpivalue2] }
        // initiate empty data array first
        json_rows.forEach(function (js_row) {
          var date = js_row[idFields['date']];
          var name = js_row[idFields['name']];

          var hKey = `${date}${name}`;

          if (name !== 'GLOBAL' && !(hKey in hData)) {
            hData[hKey] = new Array(aKpis.length).fill(0);
          }
        });

        // fill the hData
        json_rows.forEach(function (js_row) {
          var date = js_row[idFields['date']];
          var name = js_row[idFields['name']];

          var hKey = `${date}${name}`;

          if (name !== 'GLOBAL') {// don't count global, because datastudio natively does the sum
            // we need a cache cacheSetKpi to make sure not to override previsouly set kpiValue from previous iteration
            aKpis.forEach(function (aKpi, f) {
              if (cacheSetKpi.indexOf(aKpi.getId()) === -1) {
                var kpiValue = js_row[idFields[aKpi.getId()]];
                hData[hKey].splice(f, 1, kpiValue);
              }
            });
          }
        });

        cacheSetKpi.push(kpi);

        if (DEBUG) console.log('responseToRows:hData:kpi=' + kpi, JSON.stringify(hData, null, 4)); // check hdata for each kpi
      });

    for (key in hData) {
      rows.push({ 'values': hData[key] });
    }

    return rows;

  }
  // single url aggregated mode
  else {

    if (DEBUG) console.log('responseToRows:aggregated:options=' + JSON.stringify(options));
    if (DEBUG) console.log('responseToRows:aggregated:fullurl=' + url);

    var data = JSON.parse(UrlFetchApp.fetch(url.split("?")[0], options));

    if (DEBUG) console.log('responseToRows:aggregated:data', JSON.stringify(data, null, 4));

    try {
      var json_fields = data.data.fields;
      var json_rows = data.data.rows;
    }
    catch (e) {
      sendError(
        'for url=' + url + '\napi_error=' + data.error_msg + '\nexception=' + e,
        SUPPORT_EMAIL,
        SUBJECT
      );
    }

    // list indexes of each kpi returned in the api response
    var fields_idx = aKpis.map(function (kpi) {
      var index = json_fields.findIndex(js_field => js_field.name === kpi.getId());
      return index;
    });

    // exclude GLOBAL line from json_rows and reorder data based on fields_idx
    var rows = json_rows
      .filter(row => !(row.includes("GLOBAL")))
      .map(function (row) {
        return { "values": fields_idx.map(i => row[i].toString()) }
      });

    return rows
  }
}