/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 85.99828588463258, "KoPercent": 14.001714115367417};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8599828588463259, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8453218964150856, 500, 1500, "CHANGE CHARACTER"], "isController": false}, {"data": [0.8590572797915407, 500, 1500, "GET CHARACTER ID"], "isController": false}, {"data": [0.8631980995854488, 500, 1500, "CREATE CHARACTER"], "isController": false}, {"data": [0.8607365386403795, 500, 1500, "GET CHARACTERS"], "isController": false}, {"data": [0.8716105847762169, 500, 1500, "DELETE CHARACTER"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 107344, 15030, 14.001714115367417, 27.026177522730762, 0, 322, 27.0, 32.0, 35.0, 39.0, 3574.2017114507375, 3635.4532475214764, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["CHANGE CHARACTER", 21451, 3318, 15.467810358491446, 27.05761969138977, 1, 230, 27.0, 31.0, 33.0, 40.0, 715.247907705645, 192.2437733924344, 0.0], "isController": false}, {"data": ["GET CHARACTER ID", 21491, 3029, 14.094272020845935, 27.052161369875808, 1, 267, 27.0, 31.0, 33.0, 41.0, 716.3427885737143, 182.65641145295157, 0.0], "isController": false}, {"data": ["CREATE CHARACTER", 21469, 2937, 13.680190041455122, 27.028972006148436, 1, 322, 27.0, 31.0, 33.0, 39.0, 715.7049038237157, 183.119809376771, 0.0], "isController": false}, {"data": ["GET CHARACTERS", 21506, 2995, 13.926346135962056, 27.066167581140025, 1, 175, 27.0, 31.0, 33.0, 40.0, 716.2220668065407, 2905.211579110051, 0.0], "isController": false}, {"data": ["DELETE CHARACTER", 21427, 2751, 12.838941522378308, 26.925701218089387, 0, 276, 27.0, 31.0, 33.0, 44.0, 714.4714904968322, 173.7337901696399, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 43 milliseconds, but should not have lasted longer than 30 milliseconds.", 41, 0.27278775781769793, 0.038194961991354894], "isController": false}, {"data": ["The operation lasted too long: It took 61 milliseconds, but should not have lasted longer than 30 milliseconds.", 32, 0.21290751829673984, 0.02981070204203309], "isController": false}, {"data": ["The operation lasted too long: It took 52 milliseconds, but should not have lasted longer than 30 milliseconds.", 105, 0.6986027944111777, 0.09781636607542107], "isController": false}, {"data": ["The operation lasted too long: It took 58 milliseconds, but should not have lasted longer than 30 milliseconds.", 36, 0.23952095808383234, 0.03353703979728723], "isController": false}, {"data": ["The operation lasted too long: It took 230 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 49 milliseconds, but should not have lasted longer than 30 milliseconds.", 44, 0.2927478376580173, 0.0409897153077955], "isController": false}, {"data": ["The operation lasted too long: It took 70 milliseconds, but should not have lasted longer than 30 milliseconds.", 4, 0.02661343978709248, 0.0037263377552541363], "isController": false}, {"data": ["The operation lasted too long: It took 120 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 118 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 59 milliseconds, but should not have lasted longer than 30 milliseconds.", 74, 0.49234863606121093, 0.06893724847220152], "isController": false}, {"data": ["The operation lasted too long: It took 103 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 322 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 67 milliseconds, but should not have lasted longer than 30 milliseconds.", 8, 0.05322687957418496, 0.0074526755105082726], "isController": false}, {"data": ["The operation lasted too long: It took 34 milliseconds, but should not have lasted longer than 30 milliseconds.", 1318, 8.769128409846973, 1.2278282903562379], "isController": false}, {"data": ["The operation lasted too long: It took 76 milliseconds, but should not have lasted longer than 30 milliseconds.", 2, 0.01330671989354624, 0.0018631688776270681], "isController": false}, {"data": ["The operation lasted too long: It took 121 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 107 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 78 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 66 milliseconds, but should not have lasted longer than 30 milliseconds.", 9, 0.059880239520958084, 0.008384259949321807], "isController": false}, {"data": ["The operation lasted too long: It took 161 milliseconds, but should not have lasted longer than 30 milliseconds.", 2, 0.01330671989354624, 0.0018631688776270681], "isController": false}, {"data": ["The operation lasted too long: It took 60 milliseconds, but should not have lasted longer than 30 milliseconds.", 53, 0.3526280771789754, 0.04937397525711731], "isController": false}, {"data": ["The operation lasted too long: It took 54 milliseconds, but should not have lasted longer than 30 milliseconds.", 41, 0.27278775781769793, 0.038194961991354894], "isController": false}, {"data": ["The operation lasted too long: It took 35 milliseconds, but should not have lasted longer than 30 milliseconds.", 848, 5.642049234863606, 0.7899836041138769], "isController": false}, {"data": ["The operation lasted too long: It took 84 milliseconds, but should not have lasted longer than 30 milliseconds.", 2, 0.01330671989354624, 0.0018631688776270681], "isController": false}, {"data": ["The operation lasted too long: It took 72 milliseconds, but should not have lasted longer than 30 milliseconds.", 3, 0.01996007984031936, 0.002794753316440602], "isController": false}, {"data": ["The operation lasted too long: It took 42 milliseconds, but should not have lasted longer than 30 milliseconds.", 22, 0.14637391882900866, 0.02049485765389775], "isController": false}, {"data": ["The operation lasted too long: It took 47 milliseconds, but should not have lasted longer than 30 milliseconds.", 24, 0.1596806387225549, 0.022358026531524817], "isController": false}, {"data": ["The operation lasted too long: It took 71 milliseconds, but should not have lasted longer than 30 milliseconds.", 4, 0.02661343978709248, 0.0037263377552541363], "isController": false}, {"data": ["The operation lasted too long: It took 77 milliseconds, but should not have lasted longer than 30 milliseconds.", 2, 0.01330671989354624, 0.0018631688776270681], "isController": false}, {"data": ["The operation lasted too long: It took 65 milliseconds, but should not have lasted longer than 30 milliseconds.", 7, 0.046573519627411845, 0.006521091071694738], "isController": false}, {"data": ["The operation lasted too long: It took 41 milliseconds, but should not have lasted longer than 30 milliseconds.", 31, 0.20625415834996674, 0.028879117603219557], "isController": false}, {"data": ["The operation lasted too long: It took 83 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 53 milliseconds, but should not have lasted longer than 30 milliseconds.", 68, 0.4524284763805722, 0.06334774183932032], "isController": false}, {"data": ["The operation lasted too long: It took 95 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 214 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["500/Internal Server Error", 269, 1.7897538256819694, 0.25059621404084065], "isController": false}, {"data": ["The operation lasted too long: It took 48 milliseconds, but should not have lasted longer than 30 milliseconds.", 23, 0.15302727877578176, 0.021426442092711283], "isController": false}, {"data": ["The operation lasted too long: It took 36 milliseconds, but should not have lasted longer than 30 milliseconds.", 673, 4.47771124417831, 0.6269563273215084], "isController": false}, {"data": ["The operation lasted too long: It took 198 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 31 milliseconds, but should not have lasted longer than 30 milliseconds.", 5472, 36.40718562874252, 5.097630049187658], "isController": false}, {"data": ["The operation lasted too long: It took 37 milliseconds, but should not have lasted longer than 30 milliseconds.", 423, 2.81437125748503, 0.39406021761812493], "isController": false}, {"data": ["The operation lasted too long: It took 46 milliseconds, but should not have lasted longer than 30 milliseconds.", 46, 0.3060545575515635, 0.04285288418542257], "isController": false}, {"data": ["The operation lasted too long: It took 73 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 79 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 40 milliseconds, but should not have lasted longer than 30 milliseconds.", 62, 0.4125083166999335, 0.057758235206439114], "isController": false}, {"data": ["The operation lasted too long: It took 89 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 252 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 276 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 133 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 151 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 88 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 175 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 64 milliseconds, but should not have lasted longer than 30 milliseconds.", 8, 0.05322687957418496, 0.0074526755105082726], "isController": false}, {"data": ["The operation lasted too long: It took 55 milliseconds, but should not have lasted longer than 30 milliseconds.", 37, 0.24617431803060547, 0.03446862423610076], "isController": false}, {"data": ["The operation lasted too long: It took 100 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 267 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 295 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 81 milliseconds, but should not have lasted longer than 30 milliseconds.", 2, 0.01330671989354624, 0.0018631688776270681], "isController": false}, {"data": ["The operation lasted too long: It took 87 milliseconds, but should not have lasted longer than 30 milliseconds.", 2, 0.01330671989354624, 0.0018631688776270681], "isController": false}, {"data": ["The operation lasted too long: It took 140 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 99 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 45 milliseconds, but should not have lasted longer than 30 milliseconds.", 48, 0.3193612774451098, 0.044716053063049634], "isController": false}, {"data": ["The operation lasted too long: It took 51 milliseconds, but should not have lasted longer than 30 milliseconds.", 134, 0.8915502328675982, 0.12483231480101356], "isController": false}, {"data": ["The operation lasted too long: It took 33 milliseconds, but should not have lasted longer than 30 milliseconds.", 1905, 12.674650698602795, 1.7746683559397824], "isController": false}, {"data": ["The operation lasted too long: It took 75 milliseconds, but should not have lasted longer than 30 milliseconds.", 2, 0.01330671989354624, 0.0018631688776270681], "isController": false}, {"data": ["The operation lasted too long: It took 38 milliseconds, but should not have lasted longer than 30 milliseconds.", 262, 1.7431803060545576, 0.24407512296914594], "isController": false}, {"data": ["The operation lasted too long: It took 63 milliseconds, but should not have lasted longer than 30 milliseconds.", 11, 0.07318695941450433, 0.010247428826948875], "isController": false}, {"data": ["The operation lasted too long: It took 68 milliseconds, but should not have lasted longer than 30 milliseconds.", 6, 0.03992015968063872, 0.005589506632881204], "isController": false}, {"data": ["The operation lasted too long: It took 74 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 86 milliseconds, but should not have lasted longer than 30 milliseconds.", 2, 0.01330671989354624, 0.0018631688776270681], "isController": false}, {"data": ["The operation lasted too long: It took 153 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 56 milliseconds, but should not have lasted longer than 30 milliseconds.", 27, 0.17964071856287425, 0.02515277984796542], "isController": false}, {"data": ["The operation lasted too long: It took 98 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 62 milliseconds, but should not have lasted longer than 30 milliseconds.", 14, 0.09314703925482369, 0.013042182143389477], "isController": false}, {"data": ["The operation lasted too long: It took 135 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 32 milliseconds, but should not have lasted longer than 30 milliseconds.", 2530, 16.833000665335994, 2.3569086301982414], "isController": false}, {"data": ["The operation lasted too long: It took 44 milliseconds, but should not have lasted longer than 30 milliseconds.", 40, 0.2661343978709248, 0.03726337755254136], "isController": false}, {"data": ["The operation lasted too long: It took 300 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 182 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 57 milliseconds, but should not have lasted longer than 30 milliseconds.", 20, 0.1330671989354624, 0.01863168877627068], "isController": false}, {"data": ["The operation lasted too long: It took 69 milliseconds, but should not have lasted longer than 30 milliseconds.", 5, 0.0332667997338656, 0.00465792219406767], "isController": false}, {"data": ["The operation lasted too long: It took 50 milliseconds, but should not have lasted longer than 30 milliseconds.", 94, 0.6254158349966733, 0.0875689372484722], "isController": false}, {"data": ["The operation lasted too long: It took 105 milliseconds, but should not have lasted longer than 30 milliseconds.", 1, 0.00665335994677312, 9.315844388135341E-4], "isController": false}, {"data": ["The operation lasted too long: It took 39 milliseconds, but should not have lasted longer than 30 milliseconds.", 100, 0.6653359946773121, 0.0931584438813534], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 107344, 15030, "The operation lasted too long: It took 31 milliseconds, but should not have lasted longer than 30 milliseconds.", 5472, "The operation lasted too long: It took 32 milliseconds, but should not have lasted longer than 30 milliseconds.", 2530, "The operation lasted too long: It took 33 milliseconds, but should not have lasted longer than 30 milliseconds.", 1905, "The operation lasted too long: It took 34 milliseconds, but should not have lasted longer than 30 milliseconds.", 1318, "The operation lasted too long: It took 35 milliseconds, but should not have lasted longer than 30 milliseconds.", 848], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["CHANGE CHARACTER", 21451, 3318, "The operation lasted too long: It took 31 milliseconds, but should not have lasted longer than 30 milliseconds.", 1170, "The operation lasted too long: It took 32 milliseconds, but should not have lasted longer than 30 milliseconds.", 521, "The operation lasted too long: It took 33 milliseconds, but should not have lasted longer than 30 milliseconds.", 390, "500/Internal Server Error", 269, "The operation lasted too long: It took 34 milliseconds, but should not have lasted longer than 30 milliseconds.", 257], "isController": false}, {"data": ["GET CHARACTER ID", 21491, 3029, "The operation lasted too long: It took 31 milliseconds, but should not have lasted longer than 30 milliseconds.", 1091, "The operation lasted too long: It took 32 milliseconds, but should not have lasted longer than 30 milliseconds.", 532, "The operation lasted too long: It took 33 milliseconds, but should not have lasted longer than 30 milliseconds.", 377, "The operation lasted too long: It took 34 milliseconds, but should not have lasted longer than 30 milliseconds.", 295, "The operation lasted too long: It took 35 milliseconds, but should not have lasted longer than 30 milliseconds.", 160], "isController": false}, {"data": ["CREATE CHARACTER", 21469, 2937, "The operation lasted too long: It took 31 milliseconds, but should not have lasted longer than 30 milliseconds.", 1134, "The operation lasted too long: It took 32 milliseconds, but should not have lasted longer than 30 milliseconds.", 488, "The operation lasted too long: It took 33 milliseconds, but should not have lasted longer than 30 milliseconds.", 386, "The operation lasted too long: It took 34 milliseconds, but should not have lasted longer than 30 milliseconds.", 271, "The operation lasted too long: It took 35 milliseconds, but should not have lasted longer than 30 milliseconds.", 165], "isController": false}, {"data": ["GET CHARACTERS", 21506, 2995, "The operation lasted too long: It took 31 milliseconds, but should not have lasted longer than 30 milliseconds.", 1098, "The operation lasted too long: It took 32 milliseconds, but should not have lasted longer than 30 milliseconds.", 520, "The operation lasted too long: It took 33 milliseconds, but should not have lasted longer than 30 milliseconds.", 385, "The operation lasted too long: It took 34 milliseconds, but should not have lasted longer than 30 milliseconds.", 260, "The operation lasted too long: It took 35 milliseconds, but should not have lasted longer than 30 milliseconds.", 162], "isController": false}, {"data": ["DELETE CHARACTER", 21427, 2751, "The operation lasted too long: It took 31 milliseconds, but should not have lasted longer than 30 milliseconds.", 979, "The operation lasted too long: It took 32 milliseconds, but should not have lasted longer than 30 milliseconds.", 469, "The operation lasted too long: It took 33 milliseconds, but should not have lasted longer than 30 milliseconds.", 367, "The operation lasted too long: It took 34 milliseconds, but should not have lasted longer than 30 milliseconds.", 235, "The operation lasted too long: It took 35 milliseconds, but should not have lasted longer than 30 milliseconds.", 162], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
