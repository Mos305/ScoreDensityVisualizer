/**
 * ファイル読み込み関数
 */
function loadFile() {
    const obj1 = document.getElementById("file-selector");

    // ダイアログでファイルが選択された時
    obj1.addEventListener("change", function(evt) {

        const file = evt.target.files;

        // FileReaderの作成
        const reader = new FileReader();
        // テキスト形式で読み込む
        reader.readAsText(file[0], "Shift-JIS");

        // 読込終了後の処理
        reader.onload = function(ev) {
            analyze(reader.result);
        }
    }, false);
}



// // CSV読み込み

// function getCsvData(dataPath) {
//     const request = new XMLHttpRequest();
//     request.addEventListener('load', (event) => {
//         const response = event.target.responseText;
//         convertArray(response);
//     });
//     request.open('GET', dataPath, true);
//     request.send();
// }

// function convertArray(data) {
//     const dataArray = [];
//     const dataString = data.split('\n');
//     for (let i = 0; i < dataString.length; i++) {
//         dataArray[i] = dataString[i].split(',');
//     }

//     transposition(dataArray)
// }