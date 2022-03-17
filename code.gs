var cc = DataStudioApp.createCommunityConnector();

var DEFAULT = {
  "QUERY": {
    "async": false,
    "reports": [
      {
        "kind": "rt#insummary",
        "path": "mcWEBSITE[?].mcGLOBALOPE.mcOPE",
        "dateRanges": [
          { "range": "YESTERDAY" }
        ],
        "dimensions": [
          { "field": "ope_name", "name": "ope" },
          { "field": "media_key", "name": "Media Key" },
          { "field": "publisher_name", "name": "Publisher Name" },
          { "field": "mediaplan_name", "name": "Mediaplan Name" },
          { "field": "submedia_name", "name": "Submedia Name" }
        ],
        "metrics": [
          { "field": "hit", "name": "page views" },
          { "field": "click", "name": "click" },
          { "field": "estimatevalid", "name": "leads", "segment": { "by": "estimatetype" } },
          { "field": "scartvalid", "name": "scartvalid", "segment": { "by": "ordertype" } }
        ]
      }
    ]
  }
};

function isAdminUser() {
  return false;
}

function getAuthType() {
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
}


function getConfig(request) {
  var config = cc.getConfig();

  config.newTextInput()
    .setId("apiDomain")
    .setName(
      "API Endpoint"
    )
    .setHelpText(
      "you can find your API domain on Eulerian (search: \"api\")"
    )
    .setPlaceholder(
      "e.g. https://abc.api.eulerian.com"
    );

  config.newTextInput()
    .setId("apiKey")
    .setName(
      "API token"
    )
    .setHelpText(
      "you can find your API key on Eulerian (search: \"api\")"
    )
    .setPlaceholder(
      "e.g. nMDcfWDpfyc1x40HrfY5g7kCReA.VJM_f54-"
    );

  config.newTextInput()
    .setId("apiSite")
    .setAllowOverride(true)
    .setName(
      "Website name"
    )
    .setHelpText(
      "you can find the website name on Eulerian (website name in the top blue bar)"
    )
    .setPlaceholder(
      "e.g. my-website"
    );

  config.newInfo()
    .setId('query_instructions')
    .setText(
      'Select the date scale for data evolution. A blank entry will revert to Automatic mode: auto-scale'
    );

  config
    .newSelectSingle()
    .setId("dateScale")
    .setName("Date Scale")
    .setHelpText(
      "Choose the time unit. A blank entry will revert to the default value: auto-scale."
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Auto-Scale")
        .setValue("auto")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per hour")
        .setValue("H")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per day")
        .setValue("D")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per week")
        .setValue("W")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per month")
        .setValue("M")
    )
    .setAllowOverride(true);

  config
    .newSelectSingle()
    .setId("segment")
    .setName("Segmentation")
    .setHelpText(
      "Choose an additional level of segmentation for the datasource. A blank entry will revert to \"none\"."
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("none")
        .setValue("none")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per Device")
        .setValue("device")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per Attribution view")
        .setValue("view")
    )
    .setAllowOverride(true);


  config.newInfo()
    .setId('query_instructions')
    .setText('Enter the query to access data. An invalid or blank entry will revert to the default query. Read our documentation to discover how to build your query https://doc.api.eulerian.com/#tag/Batch-Reporting');


  config.newTextArea()
    .setId("query")
    .setName(
      "Query.json"
    )
    .setHelpText(
      "edit your query"
    )
    .setPlaceholder(
      `e.g. {
    "async": false,
    "reports": [
      {
        "kind": "rt#insummary",
        "path": "mcWEBSITE[?].mcGLOBALOPE.mcOPE",
        "dateRanges": [{ "range": "YESTERDAY" }],
        "dimensions": [
          { "field": "ope_name", "name": "ope" },
          { "field": "media_key", "name": "Media Key" },
          { "field": "publisher_name", "name": "Publisher Name" },
          { "field": "mediaplan_name", "name": "Mediaplan Name" },
          { "field": "submedia_name", "name": "Submedia Name" }
        ],
        "metrics": [
          { "field": "hit", "name": "page views" },
          { "field": "click", "name": "click" },
          { "field": "estimatevalid", "name": "leads", "segment": { "by": "estimatetype" } },
          { "field": "scartvalid", "name": "scartvalid", "segment": { "by": "ordertype" } }
        ]
      }
    ]
  }
`
    );

  config
    .newCheckbox()
    .setId('includeGlobal')
    .setName('Includes GLOBAL rows')
    .setHelpText('Check this box to include rows with channel GLOBAL in your dataset. Recommended: should be enabled only in specific cases because it might alter your metrics')
    .setAllowOverride(true);

  config
    .newSelectMultiple()
    .setId("filter_device")
    .setName("Device filter")
    .setHelpText(
      "Filter on deviced used during navigation. A blank entry will revert to select all devices"
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Desktop")
        .setValue("1")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Phone")
        .setValue("2")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Tablet")
        .setValue("3")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("TV")
        .setValue("4")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("iOS Device")
        .setValue("5")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Android Device")
        .setValue("6")
    )
    .setAllowOverride(true);


  config.newTextInput()
    .setId("filter_view")
    .setAllowOverride(true)
    .setName(
      "Attribution View ID(s)"
    )
    .setHelpText(
      "An invalid or blank entry will revert to select the default STA view"
    )
    .setPlaceholder(
      "e.g. 4"
    );


  config.setDateRangeRequired(true); // force a new date in the getData (useful to work the ds native relative dates )

  return config.build();
}

// [START get_schema]
function getFields(request, content = {}) {
  console.log("getFields()::START");
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  const FIELDS = { 'text': types.TEXT, 'int': types.NUMBER, 'float': types.NUMBER, 'time': types.NUMBER, 'pct': types.PERCENT };

  console.log("getFields::@request", request);
  // console.log("getFields::@content", content);

  if (Object.keys(content).length === 0) {
    console.log("getFields():: api response does not exist.");

    request.configParams = validateConfig(request, true);

    if (request.configParams.error) {
      cc.newUserError()
        .setText("The field query.json used in the configuration of your data source contains errors. Please check and try again.")
        .setDebugText("The field query.json used in the configuration of your data source contains errors. Please check and try again.")
        .throwException();
    }
    content = fetchDataFromApi(request);
    content = content.data.request.reports[0];
  }
  else {

    console.log("getFields():: api response already exists.");
    content = content.data.reports[0].columnHeader;
  }

  console.log("getFields()::@content-2", JSON.stringify(content.metrics));

  var dimensions = content.dimensions || [];
  var dr_metrics = content.metrics || [];

  console.log("getFields()::@dimensions", dimensions);
  console.log("getFields()::@dr_metrics", dr_metrics);

  fields.newDimension()
    .setId("reported")
    .setName("Date Reported")
    .setDescription("The date that this was reported")
    //.setFormula('TODATE(reported,"%Y%m%d%H","%Y%m%d%H")')
    .setType(types.YEAR_MONTH_DAY_HOUR);

  fields.newDimension()
    .setId("segment_val")
    .setName("Segmentation Content")
    .setDescription("The segment value (can be a device type or an attribution view depending on the option selected in the datasource")
    .setType(types.TEXT);

  dimensions.forEach(function (dim) {

    fields.newDimension()
      .setId(dim.field)
      .setName(dim.name)
      .setDescription(dim.name)
      .setType(types.TEXT);
  });

  dr_metrics.forEach((dr_met) => {
    var { field, segment, name, affinity } = dr_met;

    if (/\-/.test(field)) { sendUserError('The connector received a field from API with unauthorized character "-" details:', field); }

    if (segment) {
      if (segment.values) {
        segment.values.forEach(metricSegment => {

          fields.newMetric()
            .setId(field + metricSegment.id)
            .setName(`${field}_${metricSegment.name}`)
            .setDescription(`${field} - id: ${metricSegment.id} - type: ${metricSegment.name}`)
            .setType(FIELDS[dr_met.affinity]);

        });
      }
    }
    else {
      fields.newMetric()
        .setId(field)
        .setName(name)
        .setDescription(name)
        .setType(FIELDS[affinity]);
    }

  });

  // fields.setDefaultDimension("media_key");

  console.log('getFields():: @fields.build()');
  fields.build().forEach(
    ({ name, dataType, label, semantics: { conceptType } }) => {
      let msg = `${conceptType} (${dataType}) :: id: ${name} - name: ${label}`;
      console.log(msg);
    }
  );
  console.log("getFields()::END");

  return fields;
}




function getSchema(request) {
  return { schema: getFields(request).build() };
}
// [END get_schema]



// [START get_data]
function getData(request) {
  console.log("getData::STARTING");
  console.log("getData():: @request", { request });

  request.configParams = validateConfig(request);
  if (request.configParams.error) {
    cc.newUserError()
      .setText(message)
      .setDebugText(message)
      .throwException();
  }

  var includeGlobal = request.configParams.includeGlobal || false;

  console.log("getData::@request-postvalidateConfig", request);

  var cacheKey = getSHA256(request.configParams.query + request.configParams.apiSite);
  // console.log('getData():: @cacheKey',cacheKey);

  var apiResponse = getCachedData(cacheKey, request);

  if (apiResponse.error) {
    debug_obj = {
      ...request.configParams,
      api_error_msg: apiResponse.error_msg || "api_error_unknown",
      apiKey: '',
      query: ''
    };
    sendUserError('The connector has encountered an unrecoverable error. Error fetching data from API. Please forward us those details: ##CONFIG##     ' + JSON.stringify(debug_obj) + "     ##QUERY##     " + request.configParams.query);
  } else { console.log("no error detected in the API response"); }

  try {
    var fields = getFields(request, apiResponse);
    var requestedFields = fields.forIds(request.fields.map((field) => field.name));

    var normalizedResponse = normalizeResponse(apiResponse, includeGlobal);
    var data = getFormattedData(normalizedResponse, requestedFields.asArray());
  } catch (e) {
    console.log(e);
    sendUserError('The connector has encountered an unrecoverable error. Error while retreating response from API. Exception details: ' + e);
  }
  try {
    return {
      schema: requestedFields.build(),
      rows: data
    };
  } catch (e) {
    sendUserError('problem' + e);
  }
}

/**
 * Gets response for UrlFetchApp.
 *
 * @param {Object} request Data request parameters.
 * @returns {string} Response text for UrlFetchApp.
 */
function fetchDataFromApi(request) {
  console.log("fetchDataFromApi()::START");

  var configParams = request.configParams;
  var url = `${configParams.apiDomain}/ea/v2/ea/${configParams.apiSite}/report/batch/query.json`;

  console.log("fetchDataFromApi()::@url", url);
  console.info("fetchDataFromApi()::@query", configParams.query);

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { "Authorization": `Bearer ${configParams.apiKey}` },
    payload: configParams.query
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    console.error(e);
    sendUserError('No servers found when trying to connect. Please check your credentials. Details: url: ' + url + "##" + e);
  }

  try {
    response = JSON.parse(response);
  } catch (e) {
    console.error(e);
    sendUserError('The connector has encountered an unrecoverable error. Error fetching data from API')
  }

  if (response.error) {
    var { error_code, error_msg } = response;
    console.error(`${error_msg} (${error_code})`);
    console.log(response);
    sendUserError(`Error fetching data from API: ${error_msg} (${error_code})`);
  }



  console.log("fetchDataFromApi:: @response received");
  // console.log("fetchDataFromApi:: @response", response);
  console.log("fetchDataFromApi()::END");
  return response;
}

/**
 * Parses response string into an object. Also standardizes the object structure
 * for single vs multiple packages.
 *
 * @param {Object} request Data request parameters.
 * @param {string} responseString Response from the API.
 * @return {Object} Contains package names as keys and associated download count
 *     information(object) as values.
 */
function normalizeResponse(response, includeGlobal = false) {
  // pushSegment(segMetrics, segmentArray, segVal, i_seg);
  function pushSegment(input, storage, segment_val = "all", index = 0) {
    // console.log(segment_val, input, rowDims);
    input.forEach(
      (m) => {
        storage[index] = m.values.map((val, c) => ({
          ...storage[index][c],
          ...rowDims,
          reported: formatGoogleDate(_epochs[c]["epoch"], _tz),
          [m.name]: val,
          segment_val
        }));
      }
    )
  }

  console.log("normalizeResponse()::START");
  var api_response = response.data.reports[0]; // console.log("response", api_response);
  var { columnHeader } = api_response;
  var _tz = columnHeader.dateRanges[0].tzone;
  var _epochs = columnHeader.dateRanges[0].values; // console.log("@epoch", _epochs); 
  var { metrics, dimensions } = columnHeader; // console.log("@metrics", metrics); console.log("@dimensions", dimensions);
  var { data } = api_response || []; // console.log("@data", data);
  var dataLength = data.length;

  var output = [];
  var consoleCounter = { keys: {}, nbKeys: {} };

  for (var a = 0; a < dataLength; a++) {
    var row = data[a]; // console.log("row", row);

    var rowDims = Object.fromEntries(dimensions.map((_, index) => [dimensions[index].field, row.dimensions[index] || ""])); // console.log("rowDims", rowDims);

    //TODO: en attente de validation
    if (!(includeGlobal) && rowDims.media_key == "GLOBAL") { continue; }

    var segmentArray = [[]];



    var metricsLength = row.metrics.length;

    for (let i_metric = 0; i_metric < metricsLength; i_metric++) {

      var sub = row.metrics[i_metric]; // console.log("@sub",sub);
      sub = (Array.isArray(sub) ? sub[0] : sub);
      var metricName = metrics[i_metric].field;
      let segMetrics = [{ name: metricName }];

      if ("segments" in sub) {
        var segmentType = Object.keys(sub.segments)[0];

        if (["device", "view"].includes(segmentType)) {
          let metric = sub.segments[segmentType];

          for (let i_seg = 0; i_seg < metric.length; i_seg++) {
            segMetrics = [];
            segmentArray[i_seg] = segmentArray[i_seg] || [];

            // e.g. id=2, name=`Phone`, values=[{segments:{estimatetype:[Object]}}]
            var { id, name, values } = metric[i_seg];
            segMetrics[0] = { values, name: metricName };
            var segVal = `${name}_${id}`;

            if (typeof values[0] === 'object' && values[0] !== null && "segments" in values[0]) {
              var segmentTypelvl2 = Object.keys(values[0].segments)[0];
              segMetrics = values[0].segments[segmentTypelvl2].map(
                ({ id, values }) => ({
                  name: `${metricName}${id}`,
                  values
                })
              );

            }
            else if (typeof values[0] === 'object' && values[0] !== null && "values" in values[0]) {
              segMetrics[0]["values"] = values[0].values;
            }

            pushSegment(segMetrics, segmentArray, segVal, i_seg);
            // delete segMetrics[0].values;
          }
        }
        else {
          segMetrics = sub.segments[segmentType];
          segMetrics = segMetrics.map(({ id, values }) => ({ name: `${metricName}${id}`, values }));

          pushSegment(segMetrics, segmentArray);
        }


      }
      else {
        var { values } = sub;
        segMetrics[0]["values"] = values;
        if (typeof values[0] === 'object' && values[0] !== null && "values" in values[0]) {
          segMetrics[0]["values"] = values[0].values;
        }
        pushSegment(segMetrics, segmentArray);
      }

    };

    segmentArray = segmentArray.flat();
    // console.log("normalizeResponse()::@segmentArray", JSON.stringify(segmentArray));
    output = output.concat(segmentArray);
  }

  console.log("normalizeResponse()::@output length: ", output.length);
  for (var i = 0; i < output.length; i++) {
    let countRow = Object.keys(output[i]);
    consoleCounter.nbKeys[countRow.length] = consoleCounter.nbKeys[countRow.length] + 1 || 1;
    countRow
      .forEach(key => {
        consoleCounter.keys[key] = (output[i][key] != 0 && output[i][key] != "" ?
          (consoleCounter.keys[key] + 1 || 1) :
          (consoleCounter.keys[key] || 0)
        )
      })
  }
  console.log("normalizeResponse()::@output details:", consoleCounter);
    if (output.length > 15) {
    console.log("normalizeResponse()::@output head 15 rows", JSON.stringify(output.slice(0, 15)));
  }
  else if (output.length <= 15 && output.length > 0) {
    console.log("normalizeResponse()::@output", output);
  }
  
  console.log("normalizeResponse()::END");
  return output;
}


/**
 * Formats the parsed response from external data source into correct tabular
 * format and returns only the requestedFields
 *
 * @param {Object} parsedResponse The response string from external data source
 *     parsed into an object in a standard format.
 * @param {Array} requestedFields The fields requested in the getData request.
 * @returns {Array} Array containing rows of data in key-value pairs for each
 *     field.
 */
function getFormattedData(report_data, requestedFields) {
  console.log("getFormattedData()::START");
  var data = [];
  report_data.forEach(
    (i) => data.push(formatData(requestedFields, i))
  );
  console.log("getFormattedData():: @data", data);
  console.log("getFormattedData()::END");
  return data;
}
// [END get_data]


/**
 * Validates config parameters and provides missing values.
 *
 * @param {Object} configParams Config parameters from `request`.
 * @returns {Object} Updated Config parameters.
 */
function validateConfig(r = {}, dryRun = false) {
  console.log("validateConfig()::START");
  try {
    dateRange = r.dateRange || {};
    fields = r.fields || [];
    fields = fields.map(field => field.name);
    configParams = r.configParams || {};

    // console.log("validateConfig():: @configParams-query", configParams.query);

    configParams.apiDomain = "https://" + configParams.apiDomain.replace(/https?:\/\//, "");
    configParams.apiKey = configParams.apiKey;
    configParams.apiSite = configParams.apiSite;
    configParams.dateScale = configParams.dateScale || "auto";

    if (typeof configParams.query === "undefined" || configParams.query == "") { configParams.query = DEFAULT.QUERY }

    if ((isJson(configParams.query)) == false) {
      configParams.error = true;
      return configParams;
    } else {
      configParams.query = (typeof configParams.query === "string" ? JSON.parse(configParams.query) : configParams.query)
    }

    configParams.query = { ...configParams.query, dryRun, async: false };

    configParams.segment = configParams.segment || "none";

    configParams.filter_device = (configParams.filter_device ? (Array.isArray(configParams.filter_device) ? configParams.filter_device : configParams.filter_device.split(",")) : []);

    configParams.filter_view = (configParams.filter_view ? (Array.isArray(configParams.filter_view) ? configParams.filter_view : configParams.filter_view.split(",")) : []);

    configParams.filter_view = configParams.filter_view.slice(0, 10).filter(el => /[0-9]{1,3}/.test(el));

    try {
      if (dryRun) {
        configParams.query.reports[0].dateRanges = [{ "range": "YESTERDAY" }];
      }

      if (dateRange.startDate) {

        configParams.query.reports[0] = {
          ...configParams.query.reports[0],
          dateRanges: [{
            "dateFrom": dateRange.startDate,
            "dateTo": dateRange.endDate,
            "dateFormat": "YYYY-MM-DD"
          }],
          dateRangeSplitPerScale: true,
          dateScale: (configParams.dateScale == 'auto' ? getAutoTimeScale((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / 1000) : configParams.dateScale)
        };
      }
    } catch (e) { configParams.error = true; return configParams }

    if (!(fields.includes("reported"))) {
      delete configParams.query.reports[0].dateRangeSplitPerScale;
      delete configParams.query.reports[0].dateScale;
    }

    if (configParams.filter_device.length || configParams.filter_view.length) {

      let segmentFilterClauses = [];

      if (configParams.filter_device.length && configParams.segment != "device") {
        segmentFilterClauses.push({ "field": "device", "operator": "IN", "value": configParams.filter_device })
      }
      if (configParams.filter_view.length && configParams.segment != "view") {
        segmentFilterClauses.push({ "field": "attributionrule", "operator": "IN", "value": [configParams.filter_view[0]] })
      }

      configParams.query.reports[0] = { ...configParams.query.reports[0], segmentFilterClauses };
    }

    if (configParams.segment != "none") {
      let segments;
      if (configParams.segment == "device") { segments = [{ "name": "Device", "type": "device" }] }
      else if (configParams.segment == "view" && configParams.filter_view.length) {

        segments = [
          {
            "name": "Single Touch Attribution rule",
            "type": "attributionrule",
            "operator": "IN",
            "value": configParams.filter_view
          }
        ]
      }

      configParams.query.reports[0] = { ...configParams.query.reports[0], segments };
    }

    configParams.query = JSON.stringify(configParams.query);

  } catch (e) { console.log(e); }
  console.log("validateConfig()::END");
  return configParams;
}

/**
 * Formats a single row of data into the required format.
 *
 * @param {Object} requestedFields Fields requested in the getData request.
 * @param {string} packageName Name of the package who's download data is being
 *    processed.
 * @param {Object} dailyDownload Contains the download data for a certain day.
 * @returns {Object} Contains values for requested fields in predefined format.
 */
function formatData(requestedFields, input) {
  var row = requestedFields
    .map((requestedField) => {
      let value = input[requestedField.getId()] || "0";
      return value
    });
  return { values: row };
}