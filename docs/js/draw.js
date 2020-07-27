/**
 * グラフを描写する関数
 * 
 * @param {str} title 曲名
 * @param {Array[float]} don ドンの密度
 * @param {Array[float]} ka カツの密度
 * @param {Array[float]} all 小節の密度
 */
function draw(title, don, ka, all) {

    var labels = [];
    for (var i = 0; i < all.length; i++) {
        labels[i] = i + 1 + "小節目";
    }

    var datasetDon = {
        label: 'ドンの密度[打/s]',
        data: don,
        borderColor: "rgba(255,0,0,1)",
        backgroundColor: "rgba(0,0,0,0)"
    }
    var datasetKa = {
        label: 'ドンの密度[打/s]',
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

    var ctx = document.getElementById("myLineChart");
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [datasetDon, datasetKa, datasetAll],
        },
        options: {
            title: {
                display: true,
                text: '譜面の密度変化（曲：' + title + '）'
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
            if (j == 0) {
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