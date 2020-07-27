/**
 * その命令が何行目にあるかを返す関数
 * 
 * @params {Array[str]} lines ファイル内容（行区切りの配列）
 * @params {str} inst 命令
 * 
 * @returns {int} その命令が何行目にあるか
 */
function getInstRowNo(lines, inst) {
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].search(inst) >= 0) {
            return i;
        }
    }
}

/**
 * 命令の引数を抽出する関数
 * 
 * @params {Array[str]} lines ファイル内容（行区切りの配列）
 * @params {str} 命令
 *
 * @returns {str} 命令の引数
 */
function extractArg(line, inst) {
    return line.replace(inst, "");
}

/**
 * その命令のある行を探してその引数を抽出する関数
 * 
 * @param {array[str]} lines ファイル内容（行区切りの配列）
 * @param {str} inst 命令
 * 
 * @returns {str} 命令の引数
 */
function extractInstArg(lines, inst) {
    return lines[getInstRowNo(lines, inst)].replace(inst, "");
}

/**
 * BPMを抽出する関数
 * 
 * @param {str} line 行
 * @param {str} bpmInst "BPM:" or "#BPMCHANGE"
 * 
 * @returns {float} BPM
 */
function extractBpm(line, bpmInst) {
    return parseFloat(extractArg(line, bpmInst));
}

/**
 * 現在のBPMを更新する関数
 * 
 * @param {str} line 行
 * 
 * @returns {object{"bpm": float, "isContinue": bool}} {BPM, その後の処理を実行しないかどうか}
 */
function updateCurrentBpm(line) {
    match = line.match("#BPMCHANGE");
    if (match) {
        return { "bpm": extractBpm(line, "#BPMCHANGE"), "isContinue": true };
    } else {
        return { "bpm": null, "isContinue": false };
    }
}

/**
 * 現在の拍子を更新する関数
 * 
 * @param {str} line 行
 * 
 * @returns {object{"measure": float, "isContinue": bool}} {拍子, その後の処理を実行しないかどうか}
 */
function updateCurrentMeasure(line) {
    match = line.match("#MEASURE");
    if (match) {
        var measureFrac = extractArg(line, "#MEASURE").split('/');
        return { "measure": parseFloat(measureFrac[0]) / parseFloat(measureFrac[1]), "isContinue": true };
    } else {
        return { "measure": null, "isContinue": false };
    }
}

/**
 * 現在の小節の譜面を更新する関数
 * 
 * @param {str} line 行
 * 
 * @returns {str} 現在の小節の譜面
 */
function updateCurrentScore(line) {
    match = line.match(/^[0-9]+/g);
    if (match) {
        return match[0]
    } else {
        return "";
    }
}

/**
 * 文字列中に指定した文字列が何文字含まれているか数えるカウントする関数
 * 
 * @param {str} str 文字列
 * @param {str} seq 数えたい文字
 * 
 * @returns {int} カウント結果
 */
function counter(str, seq) {
    return str.split(seq).length - 1;
}

/**
 * 密度を計算する関数
 * 
 * @param {str} line 行
 * @param {str} score その小節のそれまでの譜面
 * @param {float} bpm 現在のBPM
 * @param {float} measure 現在の拍子
 * 
 * @returns {object{"density": Array[float, float, float, float, float, str], "score": str, "isContinue": bool}} {"density": [ドンの密度, カツの密度, 全ノーツの密度, BPM, 拍子, 譜面], "score": 小節初期化用の空文字, "isContinue": その後の処理を実行しないかどうか}
 */
function calcDensity(line, score, bpm, measure) {
    match = line.match(/^[0-9]+,/g);
    if (match) {
        // ドン数，カツ数をカウント
        score += match[0];
        var countDon = parseFloat(counter(score, "1") + counter(score, "3"));
        var countKa = parseFloat(counter(score, "2") + counter(score, "4"));
        var countAll = countDon + countKa;
        // その小節の長さ（秒数）を計算
        var barLength = 240.0 / bpm * measure;
        // 密度を計算して返す
        return { "density": [countDon / barLength, countKa / barLength, countAll / barLength, bpm, measure, score], "score": "", "isContinue": true };
    } else {
        return { "density": [null, null, null, null, null, null], "score": score, "isContinue": false };
    }
}

/**
 * 譜面を分析する関数
 * 
 * @param {Array[str]} lines ファイル内容（行区切りの配列）
 * @param {float} currentBpm BPMの初期値
 * @param {float} currentMeasure 拍子の初期値
 */
function analyzeScore(lines, currentBpm, currentMeasure) {
    var density = [];
    var currentScore = "";
    for (var i = 0; i < lines.length; i++) {
        var result;
        var isContinue = false;

        // BPMを更新
        result = updateCurrentBpm(lines[i]);
        if (result["isContinue"]) {
            currentBpm = result["bpm"];
            continue;
        }

        // 拍子を更新
        result = updateCurrentMeasure(lines[i]);
        if (result["isContinue"]) {
            currentMeasure = result["measure"];
            continue;
        }

        // 密度を計算
        result = calcDensity(lines[i], currentScore, currentBpm, currentMeasure);
        if (result["isContinue"]) {
            density.push(result["density"]);
            currentScore = result["score"];
            continue;
        }

        // 小節の譜面を更新
        currentScore += updateCurrentScore(lines[i]);
    }

    return density;
}

/**
 * 分析結果をまとめなおす関数
 * 
 * @param {Array[Array[float, float, float, float, float, str]]} denAry 分析結果
 * 
 * @returns {object{Array[float], Array[float], Array[float]}} {ドンの密度, カツの密度, 全ノーツの密度}
 */
function splitDensityArray(denAry) {
    var donDensity = [];
    var kaDensity = [];
    var allDensity = [];
    for (let i = 0; i < denAry.length; i++) {
        donDensity[i] = denAry[i][0];
        kaDensity[i] = denAry[i][1];
        allDensity[i] = denAry[i][2];
    }
    return { donDensity, kaDensity, allDensity };
}

/**
 * 指定した桁数で四捨五入する関数
 * 
 * @param {float} x 値
 * @param {float} d 桁
 * 
 * @returns {float} 四捨五入した値
 */
function floor(x, d) {
    return Math.floor(x * Math.pow(10, d)) / Math.pow(10, d);
}

/**
 * 表示用に分析結果を整える関数
 * 
 * @param {Arrya[Array[float, float, float, float, float, str]]} denAry 分析結果
 * 
 * @param {Arrya[Array[float, float, float, float, float, str]]} 整えた分析結果
 */
function setTableForDisplay(denAry) {
    var table = [
        ["小節番号", "ドンの密度[打/s]", "カツの密度[打/s]", "小節の密度[打/s]", "BPM", "拍子", "譜面"]
    ];
    for (var i = 0; i < denAry.length; i++) {
        var row = [
            [i + 1]
        ];
        for (var j = 0; j < denAry[i].length - 1; j++) {
            row[j + 1] = floor(denAry[i][j], 3);
        }
        row[(denAry[i].length - 1) + 1] = denAry[i][j];
        table.push(row);
    }
    return table;
}

/**
 * 譜面を分析する関数
 * 
 * @param {str} contents ファイル内容
 */
function analyze(contents) {
    // document.test.txt.value = contents;

    // ファイル内容を行ごとに配列へ格納
    var lines = contents.split('\n');

    // 譜面記述行を抽出
    var scoreLines = lines.slice(getInstRowNo(lines, "#START") + 1, getInstRowNo(lines, "#END"));

    // BPMと拍子の初期値を設定
    var currentBpm = extractBpm(extractInstArg(lines, "BPM:"), "BPM:"); // ヘッダから抽出
    var currentMeasure = 4.0 / 4.0;

    // 譜面を分析
    var density = analyzeScore(scoreLines, currentBpm, currentMeasure);

    // テーブルに分析結果を出力
    makeTable(setTableForDisplay(density), "table");

    // グラフに分析結果を出力
    var { donDensity, kaDensity, allDensity } = splitDensityArray(density);
    draw(donDensity, kaDensity, allDensity);
}