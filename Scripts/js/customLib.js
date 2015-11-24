function GetCategories(d) {
    var arr = [], cat = "";
    for (var i = 0; i < d.length; i++) {
        if (arr.indexOf(d[i]["Categories"]) === -1) {
            arr.push(d[i]["Categories"]);
            cat += d[i]["Categories"] + ",";
        }

    }
    return arr;
}

function GetStore(d) {
    var arr = [], cat = "";
    for (var i = 0; i < d.length; i++) {
        if (arr.indexOf(d[i]["Stores"]) === -1) {
            arr.push(d[i]["Stores"]);
        }

    }
    return arr.sort();
}
function GetStorage(d) {
    var arr = [], cat = "";
    for (var i = 0; i < d.length; i++) {
        if (arr.indexOf(d[i]["StoreDiff"]) === -1) {
            arr.push(d[i]["StoreDiff"]);
        }

    }
    return arr.sort(function (a, b) {
        return a - b;
    });
}
function DrawGraph(response) {
    var margin = { top: 50, right: 0, bottom: 100, left: 200 },
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        gridSize = 20,
        legendElementWidth = 5,
        buckets = 236,
        colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
        categories = GetCategories(response),
        storenames = GetStore(response)//Object.keys(response[0]);
        
    ;
    //storenames.shift();

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //.attr("height", 700)
        .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "RdYlGn")
    //.attr("transform", "translate(200,50)")
    ;

    var catLabels = svg.selectAll(".catLabel")
        .data(categories)
        .enter().append("text")
          .text(function (d) { return d; })
          .attr("x", 0)
          .attr("y", function (d, i) { return i * gridSize; })
          .style("text-anchor", "end")
          .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
           .attr('font-size', ".9em")
          .attr("class", function (d, i) {
              //return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
              return "catLabel";
          });

    var storeLabel = svg.selectAll(".storeLabel")
        .data(storenames)
        .enter().append("text")
          .text(function (d) { return d; })
          .attr("x", function (d, i) { return i * gridSize * 5; })
          .attr("y", 0)
          //.style("text-anchor", "middle")
          .attr("transform", "translate(" + gridSize / 1.5 + ", -6)")
            .attr('font-size', ".9em")
          .attr("class", function (d, i) {
              return "storeLabel";
          });
    //Categories
    //Stores
    //StoreDiff
    var heatmapChart = function (data) {
        var avgDataArr = GetStorage(data);
        var colorScale = d3.scale.quantile()
                        .domain(avgDataArr)
                        .range(d3.range(9));
        var newColorScale =
            function (data)
            {
                var array = [14102567, 16777215, 1742928];
                var result = 0;
                if (data<0) {
                    result = array[1]+((array[1] - array[0]) / Math.abs(0 - avgDataArr[0])) * data;
                }
                else if(data>=0)
                {
                    result = array[1] - ((array[1] - array[2]) / Math.abs(0 - avgDataArr[avgDataArr.length-1])) * data;
                }
                return parseInt(result,10);
            }
            //= d3.scale.quantile()
            //            //.domain([avgDataArr[0],0,avgDataArr[avgDataArr.length-1]])
            //            .domain(avgDataArr)
            //            .range([14102567, 16777215, 1742928])
        ;
                        
        var cards = svg.selectAll(".average")
            .data(data, function (d) { return d.Categories + ':' + d.Stores; });

        cards.append("title");

        var rectA = cards.enter().append("rect");
        rectA.attr("x", function (d) {
            return storenames.indexOf(d.Stores) * gridSize * 5;
        })
        .attr("y", function (d) {
            return categories.indexOf(d.Categories) * gridSize;
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "average bordered rect")
        .attr("width", function (d) {

            return gridSize * 5;
        })
        .attr("height",
        function (d) {
            return gridSize;
        })
        ;


        
        cards.transition().duration(1000)
            .attr("class", function (d) {
                var cl = colorScale(d.StoreDiff);
                return 'average bordered rect q' + cl + '-9';
            });
        cards.select("title").text(function (d) { return d.StoreDiff; });

        cards.exit().remove();
        cards.enter()
                .append("text")
                .text(function (d) {
                    var avgD = Math.round(d.StoreDiff * 100) / 100;

                    return "$" + (avgD < 0 ? "(" + Math.abs(avgD) + ")" : avgD);
                })
                .attr("font-family", "sans-serif")
                 .attr("font-size", "12px")
                .style("fill", "black")
                .attr("x", function (d) { return storenames.indexOf(d.Stores) * gridSize * 5; })
                .attr("y", function (d) { return categories.indexOf(d.Categories) * gridSize; })
                .attr("transform", "translate(" + gridSize / 1.5 + "," + gridSize / 1.5 + ")")
        ;
        cards.exit().remove();
        var legend = svg.selectAll(".legend")
            .data(avgDataArr);

        legend.enter().append("g")
            .attr("class", "legend");

        var legRect=legend.append("rect")
          .attr("x", function (d, i) {
              return legendElementWidth * i;
          })
          .attr("y", height+gridSize*2)
          .attr("width", legendElementWidth*3)
          .attr("height", legendElementWidth * 3)
           //.style("fill", function (d, i) { 
           //    var cScale= newColorScale(d);
           //    console.log(cScale);
           //    return '#'+cScale.toString(16); 
           //})
           .attr("class", function (d) {
                var cl = colorScale(d);
                return 'q' + cl + '-9';
            })
        ;

        
        legend.exit().remove();
        var allRects=d3.selectAll(".legend");
        var start = d3.select(allRects[0][0]);
        var rect = start.select('rect');
        
        start.append("text")
             .text(Math.round(avgDataArr[0]*100)/100)
             .attr("font-family", "sans-serif")
             .attr("font-size", "12px")
             .style("fill", "black")
             .attr('x', +rect.attr("x") - legendElementWidth*10)
             .attr("y", parseInt(rect.attr("y"),10) + legendElementWidth * 3)
             
        ;
        var end = d3.select(allRects[0][allRects[0].length-1]);
        rect = end.select('rect');
        end.append("text")
             .text(Math.round(avgDataArr[avgDataArr.length-1] * 100) / 100)
             .attr("font-family", "sans-serif")
             .attr("font-size", "12px")
             .style("fill", "black")
             .attr('x', +rect.attr("x") + legendElementWidth * 5)
             .attr("y", +rect.attr("y") + legendElementWidth * 3)

        ;
    };

    heatmapChart(response);

    
}
/*Testing data*/
var jsonData =
    [{ "Categories": "Clathing & Accassarias", "CCompetitor 10": "30.0620651183973", "Competitor 1": "13.5955730941948", "Competitor 2": "5.1357458087961", "Competitor 3": "3.9302435930385", "Competitor 4": "11.0318132065663", "Competitor 5": "23.7285928961751", "Competitor 6": "38.4489733309577", "Competitor 7": "13.0665095628418", "Competitor 8": "35.4659967423289", "Competitor 9": "37.4048428961751" }, { "Categories": "Taals & Hama Impravamant", "CCompetitor 10": "13.8007568238209", "Competitor 1": "4.1682466453052", "Competitor 2": "20.8490980635426", "Competitor 3": "28.1734244570213", "Competitor 4": "8.93803660049561", "Competitor 5": "50.6557263094354", "Competitor 6": "33.3230686517778", "Competitor 7": "23.2435894851111", "Competitor 8": "47.5180686517778", "Competitor 9": "60.3514019851111" }, { "Categories": "Shaas", "CCompetitor 10": "4.0216521317828", "Competitor 1": "4.250234448856", "Competitor 2": "6.4566850265196", "Competitor 3": "1.6031587107303", "Competitor 4": "2.885285373541", "Competitor 5": "0", "Competitor 6": "4.3741937984495", "Competitor 7": "12.2035271317828", "Competitor 8": "7.2951937984495", "Competitor 9": "7.9335271317828" }, { "Categories": "Patia, Lawn & Gardan", "CCompetitor 10": "32.5884377764171", "Competitor 1": "11.7539461440901", "Competitor 2": "24.4854445620418", "Competitor 3": "49.6831873882185", "Competitor 4": "14.5898266392212", "Competitor 5": "45.3997856025041", "Competitor 6": "39.2935548332733", "Competitor 7": "46.2671334285911", "Competitor 8": "49.4000583297768", "Competitor 9": "44.5964219661405" }, { "Categories": "Elactranics", "CCompetitor 10": "47.67279835391", "Competitor 1": "14.8698826912593", "Competitor 2": "-16.766984254785", "Competitor 3": "74.9657293883928", "Competitor 4": "7.7691729762663", "Competitor 5": "81.80529835391", "Competitor 6": "-22.884344503233", "Competitor 7": "79.85779835391", "Competitor 8": "87.0911316872433", "Competitor 9": "75.6761316872433" }, { "Categories": "Firnitira", "CCompetitor 10": "-85.795296523517", "Competitor 1": "93.122776870978", "Competitor 2": "133.631798071078", "Competitor 3": "-7.01155820576", "Competitor 4": "26.415084947873", "Competitor 5": "130.350088091868", "Competitor 6": "-25.459296523517", "Competitor 7": "179.008036809816", "Competitor 8": "215.834703476483", "Competitor 9": "215.894703476483" }, { "Categories": "Arts, Crafts & Sawing", "CCompetitor 10": "20.4430606680299", "Competitor 1": "3.3118313536091", "Competitor 2": "-4.295828220859", "Competitor 3": "9.8846656063015", "Competitor 4": "1.0008384458077", "Competitor 5": "-3.058328220859", "Competitor 6": "26.354171779141", "Competitor 7": "23.374171779141", "Competitor 8": "11.9508384458077", "Competitor 9": "13.7125051124743" }, { "Categories": "Jawalry", "CCompetitor 10": "7.5863582677164", "Competitor 1": "12.5923488337542", "Competitor 2": "4.3186858539233", "Competitor 3": "12.2655655847896", "Competitor 4": "-31.4412397714993", "Competitor 5": "26.3738582677164", "Competitor 6": "13.7488582677164", "Competitor 7": "15.3838582677164", "Competitor 8": "12.3816360454942", "Competitor 9": "16.0216360454942" }, { "Categories": "Hama & Kitchan", "CCompetitor 10": "27.3345135216008", "Competitor 1": "-2.3627084599995", "Competitor 2": "3.5123283022115", "Competitor 3": "24.6735127723326", "Competitor 4": "-0.263893482341203", "Competitor 5": "35.4806570410038", "Competitor 6": "36.8872047991132", "Competitor 7": "28.0693114404794", "Competitor 8": "39.5725682179731", "Competitor 9": "39.2712398380454" }, { "Categories": "Aitamativa", "CCompetitor 10": "-12.4148364153629", "Competitor 1": "-6.95723511121751", "Competitor 2": "-2.99768622280831", "Competitor 3": "19.5566509988248", "Competitor 4": "0.731422827786297", "Competitor 5": "33.4512162162161", "Competitor 6": "35.5724662162161", "Competitor 7": "34.3739085239084", "Competitor 8": "29.6997876447875", "Competitor 9": "31.1137162162161" }, { "Categories": "Campitars & Accassarias", "CCompetitor 10": "50.7018309859154", "Competitor 1": "15.4947156013", "Competitor 2": "17.3328309859154", "Competitor 3": "37.2394780447389", "Competitor 4": "24.7659126185685", "Competitor 5": "53.9518309859154", "Competitor 6": "0", "Competitor 7": "31.3518309859154", "Competitor 8": "42.4068309859154", "Competitor 9": "0" }, { "Categories": "Offica Pradicts", "CCompetitor 10": "19.531111111111", "Competitor 1": "-1.131052631579", "Competitor 2": "10.6440808080807", "Competitor 3": "16.1984444444443", "Competitor 4": "3.3771596762324", "Competitor 5": "11.6571717171716", "Competitor 6": "20.1097385620914", "Competitor 7": "18.4544444444443", "Competitor 8": "15.9594444444443", "Competitor 9": "25.8444444444443" }, { "Categories": "Baby Pradicts", "CCompetitor 10": "16.1178597241039", "Competitor 1": "3.262214140561", "Competitor 2": "-1.0640975134574", "Competitor 3": "15.6386434726992", "Competitor 4": "6.6609749836861", "Competitor 5": "-9.4325981602837", "Competitor 6": "43.0855206850063", "Competitor 7": "25.1982106106475", "Competitor 8": "46.9331804788207", "Competitor 9": "44.5362066226115" }, { "Categories": "Indistrial & Sciantific", "CCompetitor 10": "8.3073707865167", "Competitor 1": "3.0392328554822", "Competitor 2": "15.0740374531834", "Competitor 3": "9.8985707865168", "Competitor 4": "5.2644966143313", "Competitor 5": "16.0700374531834", "Competitor 6": "9.0019422150881", "Competitor 7": "20.2360374531834", "Competitor 8": "15.2229707865167", "Competitor 9": "18.4500374531834" }, { "Categories": "Pat Sipplias", "CCompetitor 10": "11.5479332339955", "Competitor 1": "7.779181012581", "Competitor 2": "6.4794624646681", "Competitor 3": "18.4445157768739", "Competitor 4": "-17.7900534177464", "Competitor 5": "1.965148633929", "Competitor 6": "30.5923225469725", "Competitor 7": "18.3209225469725", "Competitor 8": "25.1618188614688", "Competitor 9": "24.484027092427" }, { "Categories": "Gracary & Gairmat Faad", "CCompetitor 10": "-8.8940911367291", "Competitor 1": "-5.0677940510637", "Competitor 2": "2.1049746971112", "Competitor 3": "1.6890451685436", "Competitor 4": "-6.2722508180365", "Competitor 5": "-1.2997565253983", "Competitor 6": "1.4331070721379", "Competitor 7": "-0.677692826443799", "Competitor 8": "3.38004983324001", "Competitor 9": "3.41354912079755" }, { "Categories": "Haalth & Parsanal Cara", "CCompetitor 10": "-8.6314249481617", "Competitor 1": "0.834452538783797", "Competitor 2": "7.9406307214109", "Competitor 3": "3.9708794547134", "Competitor 4": "-1.0604375535609", "Competitor 5": "16.2080666714567", "Competitor 6": "17.3209938836281", "Competitor 7": "12.8645612348012", "Competitor 8": "12.1718702770429", "Competitor 9": "12.0703556142383" }, { "Categories": "Misical Instrimants", "CCompetitor 10": "27.472", "Competitor 1": "6.672", "Competitor 2": "-12.7008571428572", "Competitor 3": "28.95325", "Competitor 4": "-3.14581250000001", "Competitor 5": "-47.328", "Competitor 6": "47.392", "Competitor 7": "0", "Competitor 8": "49.192", "Competitor 9": "52.992" }, { "Categories": "Saftwara", "CCompetitor 10": "-363.433333333333", "Competitor 1": "9.2966666666667", "Competitor 2": "-73.9333333333333", "Competitor 3": "-60.6000000000003", "Competitor 4": "-8.4745833333333", "Competitor 5": "0", "Competitor 6": "0", "Competitor 7": "0", "Competitor 8": "0", "Competitor 9": "0" }, { "Categories": "Sparts & Oitdaars", "CCompetitor 10": "87.4526942724465", "Competitor 1": "7.6703502178657", "Competitor 2": "-22.722918407904", "Competitor 3": "39.1736491596638", "Competitor 4": "-16.063096547314", "Competitor 5": "83.4509983660138", "Competitor 6": "66.063220588236", "Competitor 7": "68.122020588236", "Competitor 8": "83.8184586834741", "Competitor 9": "86.488220588236" }, { "Categories": "Tays & Gamas", "CCompetitor 10": "-14.6175823226507", "Competitor 1": "9.0471719484747", "Competitor 2": "4.5547868802135", "Competitor 3": "-6.9210786971305", "Competitor 4": "8.8331334858527", "Competitor 5": "9.29817257931", "Competitor 6": "15.1490773412148", "Competitor 7": "13.4813252403745", "Competitor 8": "23.6511309126434", "Competitor 9": "28.0268154364529" }, { "Categories": "Additianal", "CCompetitor 10": "0", "Competitor 1": "25.995", "Competitor 2": "0", "Competitor 3": "0", "Competitor 4": "-55.17", "Competitor 5": "0", "Competitor 6": "0", "Competitor 7": "0", "Competitor 8": "0", "Competitor 9": "0" }, { "Categories": "Vidaa Gamas", "CCompetitor 10": "0", "Competitor 1": "-12.4266666666667", "Competitor 2": "9.2433333333333", "Competitor 3": "-19.5066666666667", "Competitor 4": "21.2808333333333", "Competitor 5": "0", "Competitor 6": "0", "Competitor 7": "0", "Competitor 8": "0", "Competitor 9": "0" }]
;
var csvData =
    [{ "Categories": "Clathing & Accassarias", "StoreAvg": 24.547777777777778, "StoreDiff": -30.062065118397282, "Stores": "CCompetitor 10" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 53.07064516129023, "StoreDiff": -13.800756823820919, "Stores": "CCompetitor 10" }, { "Categories": "Shaas", "StoreAvg": 21.911875000000006, "StoreDiff": -4.0216521317828189, "Stores": "CCompetitor 10" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 35.16434782608696, "StoreDiff": -32.5884377764171, "Stores": "CCompetitor 10" }, { "Categories": "Elactranics", "StoreAvg": 54.09, "StoreDiff": -47.672798353909613, "Stores": "CCompetitor 10" }, { "Categories": "Firnitira", "StoreAvg": 309.05999999999989, "StoreDiff": 85.795296523517209, "Stores": "CCompetitor 10" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 11.401111111111112, "StoreDiff": -20.443060668029887, "Stores": "CCompetitor 10" }, { "Categories": "Jawalry", "StoreAvg": 27.7775, "StoreDiff": -7.58635826771641, "Stores": "CCompetitor 10" }, { "Categories": "Hama & Kitchan", "StoreAvg": 19.740433212996269, "StoreDiff": -27.334513521600815, "Stores": "CCompetitor 10" }, { "Categories": "Aitamativa", "StoreAvg": 53.31105263157896, "StoreDiff": 12.414836415362863, "Stores": "CCompetitor 10" }, { "Categories": "Campitars & Accassarias", "StoreAvg": 9.44, "StoreDiff": -50.701830985915379, "Stores": "CCompetitor 10" }, { "Categories": "Offica Pradicts", "StoreAvg": 12.213333333333338, "StoreDiff": -19.531111111111006, "Stores": "CCompetitor 10" }, { "Categories": "Baby Pradicts", "StoreAvg": 40.616320754716845, "StoreDiff": -16.117859724103887, "Stores": "CCompetitor 10" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 27.586000000000002, "StoreDiff": -8.3073707865167243, "Stores": "CCompetitor 10" }, { "Categories": "Pat Sipplias", "StoreAvg": 27.009389312977, "StoreDiff": -11.547933233995479, "Stores": "CCompetitor 10" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 22.209825327511133, "StoreDiff": 8.8940911367290845, "Stores": "CCompetitor 10" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 36.600100224025489, "StoreDiff": 8.6314249481616727, "Stores": "CCompetitor 10" }, { "Categories": "Misical Instrimants", "StoreAvg": 28.410000000000004, "StoreDiff": -27.471999999999987, "Stores": "CCompetitor 10" }, { "Categories": "Saftwara", "StoreAvg": 422.99, "StoreDiff": 363.43333333333334, "Stores": "CCompetitor 10" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 16.100526315789477, "StoreDiff": -87.452694272446124, "Stores": "CCompetitor 10" }, { "Categories": "Tays & Gamas", "StoreAvg": 59.360588235294124, "StoreDiff": 14.617582322650698, "Stores": "CCompetitor 10" }, { "Categories": "Clathing & Accassarias", "StoreAvg": 41.014269801980269, "StoreDiff": -13.595573094194791, "Stores": "Competitor 1" }, { "Categories": "Elactranics", "StoreAvg": 86.892915662650708, "StoreDiff": -14.869882691258908, "Stores": "Competitor 1" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 62.703155339805946, "StoreDiff": -4.1682466453052029, "Stores": "Competitor 1" }, { "Categories": "Shaas", "StoreAvg": 21.683292682926837, "StoreDiff": -4.2502344488559878, "Stores": "Competitor 1" }, { "Categories": "Additianal", "StoreAvg": 98.795, "StoreDiff": -25.995000000000005, "Stores": "Competitor 1" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 55.998839458413968, "StoreDiff": -11.753946144090094, "Stores": "Competitor 1" }, { "Categories": "Firnitira", "StoreAvg": 130.14192660550472, "StoreDiff": -93.122776870977958, "Stores": "Competitor 1" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 28.5323404255319, "StoreDiff": -3.3118313536090973, "Stores": "Competitor 1" }, { "Categories": "Jawalry", "StoreAvg": 22.771509433962247, "StoreDiff": -12.592348833754162, "Stores": "Competitor 1" }, { "Categories": "Campitars & Accassarias", "StoreAvg": 44.647115384615368, "StoreDiff": -15.494715601300008, "Stores": "Competitor 1" }, { "Categories": "Hama & Kitchan", "StoreAvg": 49.437655194596644, "StoreDiff": 2.36270845999956, "Stores": "Competitor 1" }, { "Categories": "Aitamativa", "StoreAvg": 47.853451327433611, "StoreDiff": 6.9572351112175141, "Stores": "Competitor 1" }, { "Categories": "Offica Pradicts", "StoreAvg": 32.875497076023343, "StoreDiff": 1.1310526315789993, "Stores": "Competitor 1" }, { "Categories": "Baby Pradicts", "StoreAvg": 53.4719663382597, "StoreDiff": -3.262214140561035, "Stores": "Competitor 1" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 32.854137931034465, "StoreDiff": -3.0392328554822612, "Stores": "Competitor 1" }, { "Categories": "Pat Sipplias", "StoreAvg": 30.778141534391469, "StoreDiff": -7.7791810125810095, "Stores": "Competitor 1" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 18.383528241845671, "StoreDiff": 5.0677940510636219, "Stores": "Competitor 1" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 27.13422273707998, "StoreDiff": -0.834452538783836, "Stores": "Competitor 1" }, { "Categories": "Misical Instrimants", "StoreAvg": 49.209999999999994, "StoreDiff": -6.671999999999997, "Stores": "Competitor 1" }, { "Categories": "Saftwara", "StoreAvg": 50.26, "StoreDiff": -9.296666666666674, "Stores": "Competitor 1" }, { "Categories": "Vidaa Gamas", "StoreAvg": 62.91, "StoreDiff": 12.426666666666655, "Stores": "Competitor 1" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 95.88287037037027, "StoreDiff": -7.6703502178653338, "Stores": "Competitor 1" }, { "Categories": "Tays & Gamas", "StoreAvg": 35.695833964168713, "StoreDiff": -9.0471719484747126, "Stores": "Competitor 1" }, { "Categories": "Clathing & Accassarias", "StoreAvg": 49.474097087379015, "StoreDiff": -5.1357458087960453, "Stores": "Competitor 2" }, { "Categories": "Elactranics", "StoreAvg": 118.5297826086955, "StoreDiff": 16.766984254785882, "Stores": "Competitor 2" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 46.022303921568529, "StoreDiff": -20.84909806354262, "Stores": "Competitor 2" }, { "Categories": "Shaas", "StoreAvg": 19.476842105263163, "StoreDiff": -6.4566850265196614, "Stores": "Competitor 2" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 43.26734104046232, "StoreDiff": -24.485444562041742, "Stores": "Competitor 2" }, { "Categories": "Firnitira", "StoreAvg": 89.632905405405239, "StoreDiff": -133.63179807107744, "Stores": "Competitor 2" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 36.140000000000008, "StoreDiff": 4.2958282208590113, "Stores": "Competitor 2" }, { "Categories": "Jawalry", "StoreAvg": 31.045172413793114, "StoreDiff": -4.3186858539232951, "Stores": "Competitor 2" }, { "Categories": "Campitars & Accassarias", "StoreAvg": 42.809000000000005, "StoreDiff": -17.332830985915372, "Stores": "Competitor 2" }, { "Categories": "Hama & Kitchan", "StoreAvg": 43.562618432385634, "StoreDiff": -3.5123283022114506, "Stores": "Competitor 2" }, { "Categories": "Aitamativa", "StoreAvg": 43.893902439024394, "StoreDiff": 2.9976862228082979, "Stores": "Competitor 2" }, { "Categories": "Offica Pradicts", "StoreAvg": 21.100363636363639, "StoreDiff": -10.644080808080705, "Stores": "Competitor 2" }, { "Categories": "Baby Pradicts", "StoreAvg": 57.798277992278088, "StoreDiff": 1.0640975134573552, "Stores": "Competitor 2" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 20.81933333333334, "StoreDiff": -15.074037453183387, "Stores": "Competitor 2" }, { "Categories": "Pat Sipplias", "StoreAvg": 32.077860082304412, "StoreDiff": -6.4794624646680674, "Stores": "Competitor 2" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 11.210759493670837, "StoreDiff": -2.1049746971112118, "Stores": "Competitor 2" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 20.028044554452869, "StoreDiff": -7.9406307214109475, "Stores": "Competitor 2" }, { "Categories": "Misical Instrimants", "StoreAvg": 68.582857142857151, "StoreDiff": 12.70085714285716, "Stores": "Competitor 2" }, { "Categories": "Saftwara", "StoreAvg": 133.49, "StoreDiff": 73.933333333333337, "Stores": "Competitor 2" }, { "Categories": "Vidaa Gamas", "StoreAvg": 41.24, "StoreDiff": -9.24333333333334, "Stores": "Competitor 2" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 126.27613899613972, "StoreDiff": 22.722918407904118, "Stores": "Competitor 2" }, { "Categories": "Tays & Gamas", "StoreAvg": 40.188219032429949, "StoreDiff": -4.5547868802134772, "Stores": "Competitor 2" }, { "Categories": "Clathing & Accassarias", "StoreAvg": 50.67959930313657, "StoreDiff": -3.9302435930384902, "Stores": "Competitor 3" }, { "Categories": "Elactranics", "StoreAvg": 26.797068965517244, "StoreDiff": -74.965729388392376, "Stores": "Competitor 3" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 38.697977528089766, "StoreDiff": -28.173424457021383, "Stores": "Competitor 3" }, { "Categories": "Shaas", "StoreAvg": 24.330368421052547, "StoreDiff": -1.6031587107302769, "Stores": "Competitor 3" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 18.069598214285641, "StoreDiff": -49.683187388218421, "Stores": "Competitor 3" }, { "Categories": "Firnitira", "StoreAvg": 230.2762616822431, "StoreDiff": 7.0115582057604229, "Stores": "Competitor 3" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 21.959506172839514, "StoreDiff": -9.8846656063014819, "Stores": "Competitor 3" }, { "Categories": "Jawalry", "StoreAvg": 23.098292682926832, "StoreDiff": -12.265565584789577, "Stores": "Competitor 3" }, { "Categories": "Campitars & Accassarias", "StoreAvg": 22.902352941176474, "StoreDiff": -37.2394780447389, "Stores": "Competitor 3" }, { "Categories": "Hama & Kitchan", "StoreAvg": 22.40143396226453, "StoreDiff": -24.673512772332554, "Stores": "Competitor 3" }, { "Categories": "Aitamativa", "StoreAvg": 21.339565217391254, "StoreDiff": -19.556650998824843, "Stores": "Competitor 3" }, { "Categories": "Offica Pradicts", "StoreAvg": 15.546000000000007, "StoreDiff": -16.198444444444338, "Stores": "Competitor 3" }, { "Categories": "Baby Pradicts", "StoreAvg": 41.095537006121461, "StoreDiff": -15.638643472699272, "Stores": "Competitor 3" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 25.994799999999923, "StoreDiff": -9.8985707865168031, "Stores": "Competitor 3" }, { "Categories": "Pat Sipplias", "StoreAvg": 20.112806770098608, "StoreDiff": -18.444515776873871, "Stores": "Competitor 3" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 11.626689022238363, "StoreDiff": -1.6890451685436858, "Stores": "Competitor 3" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 23.997795821150419, "StoreDiff": -3.9708794547133976, "Stores": "Competitor 3" }, { "Categories": "Misical Instrimants", "StoreAvg": 26.928750000000004, "StoreDiff": -28.953249999999986, "Stores": "Competitor 3" }, { "Categories": "Saftwara", "StoreAvg": 120.15666666666668, "StoreDiff": 60.600000000000009, "Stores": "Competitor 3" }, { "Categories": "Vidaa Gamas", "StoreAvg": 69.99, "StoreDiff": 19.506666666666653, "Stores": "Competitor 3" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 64.379571428572177, "StoreDiff": -39.173649159663427, "Stores": "Competitor 3" }, { "Categories": "Tays & Gamas", "StoreAvg": 51.664084609773894, "StoreDiff": 6.9210786971304685, "Stores": "Competitor 3" }, { "Categories": "Clathing & Accassarias", "StoreAvg": 43.578029689608812, "StoreDiff": -11.031813206566248, "Stores": "Competitor 4" }, { "Categories": "Elactranics", "StoreAvg": 93.993625377643724, "StoreDiff": -7.7691729762658923, "Stores": "Competitor 4" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 57.933365384615541, "StoreDiff": -8.9380366004956073, "Stores": "Competitor 4" }, { "Categories": "Shaas", "StoreAvg": 23.048241758241762, "StoreDiff": -2.8852853735410626, "Stores": "Competitor 4" }, { "Categories": "Additianal", "StoreAvg": 179.96, "StoreDiff": 55.17, "Stores": "Competitor 4" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 53.162958963282939, "StoreDiff": -14.589826639221123, "Stores": "Competitor 4" }, { "Categories": "Firnitira", "StoreAvg": 196.84961852861019, "StoreDiff": -26.415084947872487, "Stores": "Competitor 4" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 30.843333333333305, "StoreDiff": -1.0008384458076911, "Stores": "Competitor 4" }, { "Categories": "Jawalry", "StoreAvg": 66.805098039215665, "StoreDiff": 31.441239771499255, "Stores": "Competitor 4" }, { "Categories": "Campitars & Accassarias", "StoreAvg": 35.375918367346948, "StoreDiff": -24.765912618568429, "Stores": "Competitor 4" }, { "Categories": "Hama & Kitchan", "StoreAvg": 47.338840216938266, "StoreDiff": 0.2638934823411816, "Stores": "Competitor 4" }, { "Categories": "Aitamativa", "StoreAvg": 40.164793388429764, "StoreDiff": -0.73142282778633216, "Stores": "Competitor 4" }, { "Categories": "Offica Pradicts", "StoreAvg": 28.367284768211878, "StoreDiff": -3.3771596762324663, "Stores": "Competitor 4" }, { "Categories": "Baby Pradicts", "StoreAvg": 50.073205495134566, "StoreDiff": -6.6609749836861667, "Stores": "Competitor 4" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 30.6288741721854, "StoreDiff": -5.2644966143313248, "Stores": "Competitor 4" }, { "Categories": "Pat Sipplias", "StoreAvg": 56.347375964718942, "StoreDiff": 17.790053417746464, "Stores": "Competitor 4" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 19.58798500881846, "StoreDiff": 6.2722508180364116, "Stores": "Competitor 4" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 29.029112829424715, "StoreDiff": 1.0604375535608988, "Stores": "Competitor 4" }, { "Categories": "Misical Instrimants", "StoreAvg": 59.02781250000001, "StoreDiff": 3.1458125000000194, "Stores": "Competitor 4" }, { "Categories": "Saftwara", "StoreAvg": 68.03125, "StoreDiff": 8.474583333333328, "Stores": "Competitor 4" }, { "Categories": "Vidaa Gamas", "StoreAvg": 29.2025, "StoreDiff": -21.280833333333341, "Stores": "Competitor 4" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 119.61631713554985, "StoreDiff": 16.063096547314245, "Stores": "Competitor 4" }, { "Categories": "Tays & Gamas", "StoreAvg": 35.909872426790741, "StoreDiff": -8.8331334858526844, "Stores": "Competitor 4" }, { "Categories": "Clathing & Accassarias", "StoreAvg": 30.881249999999994, "StoreDiff": -23.728592896175066, "Stores": "Competitor 5" }, { "Categories": "Elactranics", "StoreAvg": 19.9575, "StoreDiff": -81.80529835390962, "Stores": "Competitor 5" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 16.215675675675687, "StoreDiff": -50.655726309435465, "Stores": "Competitor 5" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 22.353, "StoreDiff": -45.39978560250406, "Stores": "Competitor 5" }, { "Categories": "Firnitira", "StoreAvg": 92.91461538461536, "StoreDiff": -130.35008809186732, "Stores": "Competitor 5" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 34.902499999999996, "StoreDiff": 3.058328220859, "Stores": "Competitor 5" }, { "Categories": "Jawalry", "StoreAvg": 8.99, "StoreDiff": -26.373858267716408, "Stores": "Competitor 5" }, { "Categories": "Aitamativa", "StoreAvg": 7.445, "StoreDiff": -33.451216216216096, "Stores": "Competitor 5" }, { "Categories": "Hama & Kitchan", "StoreAvg": 11.594289693593268, "StoreDiff": -35.480657041003816, "Stores": "Competitor 5" }, { "Categories": "Campitars & Accassarias", "StoreAvg": 6.19, "StoreDiff": -53.951830985915379, "Stores": "Competitor 5" }, { "Categories": "Baby Pradicts", "StoreAvg": 66.166778639104379, "StoreDiff": 9.4325981602836464, "Stores": "Competitor 5" }, { "Categories": "Offica Pradicts", "StoreAvg": 20.08727272727273, "StoreDiff": -11.657171717171615, "Stores": "Competitor 5" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 19.823333333333334, "StoreDiff": -16.070037453183392, "Stores": "Competitor 5" }, { "Categories": "Pat Sipplias", "StoreAvg": 36.592173913043482, "StoreDiff": -1.9651486339289974, "Stores": "Competitor 5" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 14.615490716180332, "StoreDiff": 1.2997565253982835, "Stores": "Competitor 5" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 11.760608604407119, "StoreDiff": -16.2080666714567, "Stores": "Competitor 5" }, { "Categories": "Misical Instrimants", "StoreAvg": 103.21, "StoreDiff": 47.328, "Stores": "Competitor 5" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 20.10222222222222, "StoreDiff": -83.45099836601338, "Stores": "Competitor 5" }, { "Categories": "Tays & Gamas", "StoreAvg": 35.444833333333378, "StoreDiff": -9.298172579310048, "Stores": "Competitor 5" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 33.548333333333332, "StoreDiff": -33.323068651777817, "Stores": "Competitor 6" }, { "Categories": "Shaas", "StoreAvg": 21.559333333333338, "StoreDiff": -4.3741937984494861, "Stores": "Competitor 6" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 28.459230769230775, "StoreDiff": -39.293554833273291, "Stores": "Competitor 6" }, { "Categories": "Elactranics", "StoreAvg": 124.6471428571428, "StoreDiff": 22.88434450323318, "Stores": "Competitor 6" }, { "Categories": "Firnitira", "StoreAvg": 248.724, "StoreDiff": 25.45929652351731, "Stores": "Competitor 6" }, { "Categories": "Clathing & Accassarias", "StoreAvg": 16.160869565217393, "StoreDiff": -38.448973330957671, "Stores": "Competitor 6" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 5.4899999999999993, "StoreDiff": -26.354171779140998, "Stores": "Competitor 6" }, { "Categories": "Jawalry", "StoreAvg": 21.615, "StoreDiff": -13.748858267716411, "Stores": "Competitor 6" }, { "Categories": "Hama & Kitchan", "StoreAvg": 10.187741935483873, "StoreDiff": -36.887204799113213, "Stores": "Competitor 6" }, { "Categories": "Aitamativa", "StoreAvg": 5.32375, "StoreDiff": -35.5724662162161, "Stores": "Competitor 6" }, { "Categories": "Offica Pradicts", "StoreAvg": 11.634705882352943, "StoreDiff": -20.1097385620914, "Stores": "Competitor 6" }, { "Categories": "Baby Pradicts", "StoreAvg": 13.648659793814439, "StoreDiff": -43.085520685006294, "Stores": "Competitor 6" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 26.891428571428577, "StoreDiff": -9.00194221508815, "Stores": "Competitor 6" }, { "Categories": "Pat Sipplias", "StoreAvg": 7.9650000000000016, "StoreDiff": -30.592322546972476, "Stores": "Competitor 6" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 11.882627118644072, "StoreDiff": -1.4331070721379771, "Stores": "Competitor 6" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 10.647681392235702, "StoreDiff": -17.320993883628113, "Stores": "Competitor 6" }, { "Categories": "Misical Instrimants", "StoreAvg": 8.49, "StoreDiff": -47.391999999999989, "Stores": "Competitor 6" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 37.49, "StoreDiff": -66.0632205882356, "Stores": "Competitor 6" }, { "Categories": "Tays & Gamas", "StoreAvg": 29.593928571428584, "StoreDiff": -15.149077341214841, "Stores": "Competitor 6" }, { "Categories": "Clathing & Accassarias", "StoreAvg": 41.543333333333337, "StoreDiff": -13.066509562841723, "Stores": "Competitor 7" }, { "Categories": "Elactranics", "StoreAvg": 21.905, "StoreDiff": -79.857798353909615, "Stores": "Competitor 7" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 43.6278125, "StoreDiff": -23.243589485111151, "Stores": "Competitor 7" }, { "Categories": "Shaas", "StoreAvg": 13.729999999999999, "StoreDiff": -12.203527131782826, "Stores": "Competitor 7" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 21.485652173913046, "StoreDiff": -46.267133428591016, "Stores": "Competitor 7" }, { "Categories": "Firnitira", "StoreAvg": 44.256666666666668, "StoreDiff": -179.00803680981602, "Stores": "Competitor 7" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 8.47, "StoreDiff": -23.374171779140994, "Stores": "Competitor 7" }, { "Categories": "Jawalry", "StoreAvg": 19.98, "StoreDiff": -15.383858267716409, "Stores": "Competitor 7" }, { "Categories": "Hama & Kitchan", "StoreAvg": 19.005635294117674, "StoreDiff": -28.06931144047941, "Stores": "Competitor 7" }, { "Categories": "Campitars & Accassarias", "StoreAvg": 28.79, "StoreDiff": -31.351830985915377, "Stores": "Competitor 7" }, { "Categories": "Aitamativa", "StoreAvg": 6.5223076923076935, "StoreDiff": -34.373908523908405, "Stores": "Competitor 7" }, { "Categories": "Baby Pradicts", "StoreAvg": 31.535969868173222, "StoreDiff": -25.198210610647511, "Stores": "Competitor 7" }, { "Categories": "Offica Pradicts", "StoreAvg": 13.290000000000003, "StoreDiff": -18.454444444444341, "Stores": "Competitor 7" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 15.657333333333334, "StoreDiff": -20.236037453183393, "Stores": "Competitor 7" }, { "Categories": "Pat Sipplias", "StoreAvg": 20.236399999999993, "StoreDiff": -18.320922546972486, "Stores": "Competitor 7" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 13.993427017225775, "StoreDiff": 0.6776928264437263, "Stores": "Competitor 7" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 15.104114041062621, "StoreDiff": -12.864561234801196, "Stores": "Competitor 7" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 35.4312, "StoreDiff": -68.122020588235614, "Stores": "Competitor 7" }, { "Categories": "Tays & Gamas", "StoreAvg": 31.261680672268874, "StoreDiff": -13.481325240374552, "Stores": "Competitor 7" }, { "Categories": "Clathing & Accassarias", "StoreAvg": 19.143846153846155, "StoreDiff": -35.465996742328905, "Stores": "Competitor 8" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 19.353333333333335, "StoreDiff": -47.51806865177781, "Stores": "Competitor 8" }, { "Categories": "Shaas", "StoreAvg": 18.638333333333332, "StoreDiff": -7.2951937984494926, "Stores": "Competitor 8" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 18.352727272727275, "StoreDiff": -49.400058329776783, "Stores": "Competitor 8" }, { "Categories": "Elactranics", "StoreAvg": 14.671666666666667, "StoreDiff": -87.09113168724295, "Stores": "Competitor 8" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 19.893333333333334, "StoreDiff": -11.950838445807662, "Stores": "Competitor 8" }, { "Categories": "Firnitira", "StoreAvg": 7.43, "StoreDiff": -215.83470347648267, "Stores": "Competitor 8" }, { "Categories": "Jawalry", "StoreAvg": 22.982222222222219, "StoreDiff": -12.38163604549419, "Stores": "Competitor 8" }, { "Categories": "Hama & Kitchan", "StoreAvg": 7.5023785166240256, "StoreDiff": -39.572568217973057, "Stores": "Competitor 8" }, { "Categories": "Campitars & Accassarias", "StoreAvg": 17.735, "StoreDiff": -42.406830985915377, "Stores": "Competitor 8" }, { "Categories": "Aitamativa", "StoreAvg": 11.196428571428573, "StoreDiff": -29.699787644787524, "Stores": "Competitor 8" }, { "Categories": "Baby Pradicts", "StoreAvg": 9.8009999999999877, "StoreDiff": -46.933180478820745, "Stores": "Competitor 8" }, { "Categories": "Offica Pradicts", "StoreAvg": 15.785, "StoreDiff": -15.959444444444344, "Stores": "Competitor 8" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 20.6704, "StoreDiff": -15.222970786516726, "Stores": "Competitor 8" }, { "Categories": "Pat Sipplias", "StoreAvg": 13.39550368550365, "StoreDiff": -25.161818861468831, "Stores": "Competitor 8" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 9.93568435754199, "StoreDiff": -3.3800498332400579, "Stores": "Competitor 8" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 15.796804998820944, "StoreDiff": -12.171870277042872, "Stores": "Competitor 8" }, { "Categories": "Misical Instrimants", "StoreAvg": 6.69, "StoreDiff": -49.191999999999993, "Stores": "Competitor 8" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 19.734761904761903, "StoreDiff": -83.8184586834737, "Stores": "Competitor 8" }, { "Categories": "Tays & Gamas", "StoreAvg": 21.091874999999998, "StoreDiff": -23.651130912643428, "Stores": "Competitor 8" }, { "Categories": "Clathing & Accassarias", "StoreAvg": 17.205000000000002, "StoreDiff": -37.404842896175055, "Stores": "Competitor 9" }, { "Categories": "Taals & Hama Impravamant", "StoreAvg": 6.52, "StoreDiff": -60.351401985111153, "Stores": "Competitor 9" }, { "Categories": "Shaas", "StoreAvg": 18.0, "StoreDiff": -7.9335271317828244, "Stores": "Competitor 9" }, { "Categories": "Patia, Lawn & Gardan", "StoreAvg": 23.156363636363633, "StoreDiff": -44.596421966140426, "Stores": "Competitor 9" }, { "Categories": "Elactranics", "StoreAvg": 26.08666666666667, "StoreDiff": -75.676131687242943, "Stores": "Competitor 9" }, { "Categories": "Arts, Crafts & Sawing", "StoreAvg": 18.131666666666668, "StoreDiff": -13.712505112474329, "Stores": "Competitor 9" }, { "Categories": "Firnitira", "StoreAvg": 7.3699999999999992, "StoreDiff": -215.89470347648268, "Stores": "Competitor 9" }, { "Categories": "Jawalry", "StoreAvg": 19.342222222222222, "StoreDiff": -16.021636045494187, "Stores": "Competitor 9" }, { "Categories": "Aitamativa", "StoreAvg": 9.7825, "StoreDiff": -31.113716216216098, "Stores": "Competitor 9" }, { "Categories": "Hama & Kitchan", "StoreAvg": 7.803706896551728, "StoreDiff": -39.271239838045354, "Stores": "Competitor 9" }, { "Categories": "Baby Pradicts", "StoreAvg": 12.197973856209156, "StoreDiff": -44.536206622611573, "Stores": "Competitor 9" }, { "Categories": "Offica Pradicts", "StoreAvg": 5.9, "StoreDiff": -25.844444444444342, "Stores": "Competitor 9" }, { "Categories": "Indistrial & Sciantific", "StoreAvg": 17.443333333333332, "StoreDiff": -18.450037453183395, "Stores": "Competitor 9" }, { "Categories": "Pat Sipplias", "StoreAvg": 14.073295454545455, "StoreDiff": -24.484027092427024, "Stores": "Competitor 9" }, { "Categories": "Gracary & Gairmat Faad", "StoreAvg": 9.902185069984446, "StoreDiff": -3.4135491207976028, "Stores": "Competitor 9" }, { "Categories": "Haalth & Parsanal Cara", "StoreAvg": 15.898319661625516, "StoreDiff": -12.0703556142383, "Stores": "Competitor 9" }, { "Categories": "Misical Instrimants", "StoreAvg": 2.89, "StoreDiff": -52.99199999999999, "Stores": "Competitor 9" }, { "Categories": "Sparts & Oitdaars", "StoreAvg": 17.065, "StoreDiff": -86.4882205882356, "Stores": "Competitor 9" }, { "Categories": "Tays & Gamas", "StoreAvg": 16.716190476190476, "StoreDiff": -28.026815436452949, "Stores": "Competitor 9" }]
;
