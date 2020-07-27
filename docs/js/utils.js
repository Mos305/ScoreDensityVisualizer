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