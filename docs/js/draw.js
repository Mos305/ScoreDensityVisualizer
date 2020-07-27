/**
 * グラフ用データセットを作成する関数
 * 
 * @param {Array[float]} don ドンの密度
 * @param {Array[float]} ka カツの密度
 * @param {Array[float]} all 小節の密度
 * @param {Array[float]} ave 平均密度
 * 
 * @returns {Array[Array[float], Array[float], Array[float], Array[float]]} ドン，カツ，小節，平均それぞれのデータセット
 */
function setDataset(don, ka, all, ave) {
    var datasetDon = {
        label: 'ドンの密度[打/s]',
        data: don,
        borderColor: "rgba(255,0,0,1)",
        backgroundColor: "rgba(0,0,0,0)"
    }
    var datasetKa = {
        label: 'カツの密度[打/s]',
        data: ka,
        borderColor: "rgba(0,0,255,1)",
        backgroundColor: "rgba(0,0,0,0)"
    }
    var datasetAll = {
        label: '小節全体の密度[打/s]',
        data: all,
        borderColor: "rgba(0,255,0,1)",
        backgroundColor: "rgba(0,0,0,0)"
    }
    var datasetAve = {
        label: '平均密度[打/s]',
        data: ave,
        borderColor: "rgba(64,64,64,1)",
        backgroundColor: "rgba(0,0,0,0)"
    }
    return [datasetDon, datasetKa, datasetAll, datasetAve];
}

/**
 * 横軸が小節のグラフを描写する関数
 * 
 * @param {object{"songTitle": str, "playTime": float, "notes": notes}} info {"songTitle": 曲名, "playTime": 演奏時間, "notes": 総ノーツ数}
 * @param {Array[float]} ts 時系列
 * @param {Array[float]} don ドンの密度
 * @param {Array[float]} ka カツの密度
 * @param {Array[float]} all 小節の密度
 * @param {Array[float]} ave 平均密度
 */
function drawMDGraph(info, ts, don, ka, all, ave) {

    // ラベルの設定
    var labels = [];
    for (var i = 0; i < all.length; i++) {
        labels[i] = i + 1 + "小節目";
    }

    // グラフの描写
    var ctxMeasure = document.getElementById("measureChart");
    var measureChart = new Chart(ctxMeasure, {
        type: 'line',
        data: {
            labels: labels,
            datasets: setDataset(don, ka, all, ave),
        },
        options: {
            title: {
                display: true,
                text: '譜面の密度変化［横軸：小節］（曲：' + info["songTitle"] + '）'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMax: 20,
                        suggestedMin: 0,
                        stepSize: 4,
                        callback: function(value, index, values) {
                            return value + '打/s'
                        }
                    }
                }]
            },
            elements: {
                line: {
                    tension: 0, // ベジェ曲線を無効にする
                }
            },
        }
    });
}

/**
 * 横軸が小節のグラフを描写する関数
 * 
 * @param {object{"songTitle": str, "playTime": float, "notes": notes}} info {"songTitle": 曲名, "playTime": 演奏時間, "notes": 総ノーツ数}
 * @param {Array[float]} ts 時系列
 * @param {Array[float]} don ドンの密度
 * @param {Array[float]} ka カツの密度
 * @param {Array[float]} all 小節の密度
 * @param {Array[float]} ave 平均密度
 */
function drawTDGraph(info, ts, don, ka, all, ave) {

    // 時系列の作成
    var donTs = [];
    var kaTs = [];
    var allTs = [];
    var aveTs = [];
    for (var i = 0; i < ts.length; i++) {
        donTs[i] = { y: don[i], t: new Date(2000, 0, 1, 0, Math.floor(ts[i] / 60.0), Math.floor(ts[i] % 60.0)) };
        kaTs[i] = { y: ka[i], t: new Date(2000, 0, 1, 0, Math.floor(ts[i] / 60.0), Math.floor(ts[i] % 60.0)) };
        allTs[i] = { y: all[i], t: new Date(2000, 0, 1, 0, Math.floor(ts[i] / 60.0), Math.floor(ts[i] % 60.0)) };
        aveTs[i] = { y: ave[i], t: new Date(2000, 0, 1, 0, Math.floor(ts[i] / 60.0), Math.floor(ts[i] % 60.0)) };
    }

    // グラフの描写
    var ctxTime = document.getElementById("timeChart");
    var timeChart = new Chart(ctxTime, {
        type: 'line',
        data: {
            datasets: setDataset(donTs, kaTs, allTs, aveTs)
        },
        options: {
            title: {
                display: true,
                text: '譜面の密度変化［横軸：演奏時間］（曲：' + info["songTitle"] + '）'
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'second',
                        displayFormats: {
                            second: 'mm:ss'
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMax: 20,
                        suggestedMin: 0,
                        stepSize: 4,
                        callback: function(value, index, values) {
                            return value + '打/s'
                        }
                    }
                }]
            },
            elements: {
                line: {
                    tension: 0, // ベジェ曲線を無効にする
                }
            },
        }
    });
}

/**
 * グラフを描写する関数
 * 
 * @param {object{"songTitle": str, "playTime": float, "notes": notes}} info {"songTitle": 曲名, "playTime": 演奏時間, "notes": 総ノーツ数}
 * @param {Array[float]} ts 時系列
 * @param {Array[float]} don ドンの密度
 * @param {Array[float]} ka カツの密度
 * @param {Array[float]} all 小節の密度
 */
function draw(info, ts, don, ka, all) {

    // 平均密度病者用の配列を作成
    var ave = []
    for (var i = 0; i < all.length; i++) {
        ave[i] = info["notes"] / parseFloat(info["playTime"]);
    }

    // 横軸が小節のグラフを描写
    drawMDGraph(info, ts, don, ka, all, ave);
    // 横軸が演奏時間のグラフを描写
    drawTDGraph(info, ts, don, ka, all, ave);
}



/**
 * 分析結果をテーブル表示する関数
 * @param {Array[Array[float, float, float, float, float, str]]} data 分析結果
 * @param {str} tableId elementのID
 */
function makeTable(data, tableId) {
    // 表の作成開始
    var rows = [];
    var table = document.createElement("table");

    // 表に2次元配列の要素を格納
    for (i = 0; i < data.length; i++) {
        rows.push(table.insertRow(-1)); // 行の追加
        for (j = 0; j < data[i].length; j++) {
            cell = rows[i].insertCell(-1);
            cell.appendChild(document.createTextNode(data[i][j]));
            // 背景色の設定
            if (j == 0 || j == 1) {
                cell.style.backgroundColor = "#bbb";
            } else if (i == 0) {
                cell.style.backgroundColor = "#bbb";
            } else {
                cell.style.backgroundColor = "#ddd";
            }
        }
    }
    // 指定したdiv要素に表を加える
    document.getElementById(tableId).textContent = null;
    document.getElementById(tableId).appendChild(table);
}